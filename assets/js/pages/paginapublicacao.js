document.addEventListener("DOMContentLoaded", () => {

  // === Controle de abas ===
  const tabs = document.querySelectorAll(".rioslag-table .tab");
  const simplified = document.getElementById("simplified");
  const full = document.getElementById("full");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active
      tabs.forEach(t => t.classList.remove("active"));
      simplified.classList.remove("active");
      full.classList.remove("active");

      // Ativa o selecionado
      tab.classList.add("active");
      const view = tab.dataset.view;
      if (view === "simplified") simplified.classList.add("active");
      if (view === "full") full.classList.add("active");
    });
  });

  // === Função utilitária para acentos e normalização ===
  function normalizeName(name) {
    return (name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // === Carregar dados (JSON local) ===
  async function loadData() {
    try {
      const res = await fetch("dados.json");
      if (!res.ok) throw new Error("dados.json não encontrado");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function renderTable() {
    const data = await loadData();
    if (!data) return;

    const ficha_jogo = data.ficha_jogo || [];
    const equipas = data.equipas || [];

    // === Mapa de logotipos ===
    const logos = {};
    equipas.forEach(e => logos[e.Team?.trim()] = e.Logopng ? e.Logopng.trim() : "");

    function getLogo(teamName) {
      const logoFile = logos[teamName?.trim()];
      return logoFile ? `assets/images/team-logo/${logoFile}` : "assets/images/team-logo/default.svg";
    }

    // === Estatísticas ===
    const teams = {};
    equipas.forEach(e => {
      const name = e.Team?.trim();
      if (!name) return;
      teams[name] = { name, played:0, wins:0, draws:0, losses:0, gf:0, ga:0, points:0, form:[] };
    });

    ficha_jogo.forEach(m => {
      const home = m.HomeTeam?.trim();
      const away = m.AwayTeam?.trim();
      const hg = parseInt(m.HomeGoals);
      const ag = parseInt(m.AwayGoals);
      if (!home || !away || isNaN(hg) || isNaN(ag)) return;

      if (!teams[home]) teams[home] = { name:home, played:0, wins:0, draws:0, losses:0, gf:0, ga:0, points:0, form:[] };
      if (!teams[away]) teams[away] = { name:away, played:0, wins:0, draws:0, losses:0, gf:0, ga:0, points:0, form:[] };

      teams[home].played++; teams[away].played++;
      teams[home].gf += hg; teams[home].ga += ag;
      teams[away].gf += ag; teams[away].ga += hg;

      if (hg > ag) { teams[home].wins++; teams[away].losses++; teams[home].points += 3; teams[home].form.push("win"); teams[away].form.push("loss"); }
      else if (hg < ag) { teams[away].wins++; teams[home].losses++; teams[away].points += 3; teams[away].form.push("win"); teams[home].form.push("loss"); }
      else { teams[home].draws++; teams[away].draws++; teams[home].points++; teams[away].points++; teams[home].form.push("draw"); teams[away].form.push("draw"); }
    });

    // === Ordenação ===
    function compareTeams(a,b) {
      if(a.points!==b.points) return b.points-a.points;
      const diffA=a.gf-a.ga; const diffB=b.gf-b.ga;
      if(diffA!==diffB) return diffB-diffA;
      if(a.gf!==b.gf) return b.gf-a.gf;
      return 0;
    }

    const sortedTeams = Object.values(teams).sort(compareTeams);

    // === Form (últimos 5 jogos) ===
    function renderForm(team) {
      return (team.form||[]).slice(-5).reverse().map(r => {
        const cls = r==="win"?"win":r==="draw"?"draw":"loss";
        return `<span class="match-form ${cls}"></span>`;
      }).join("");
    }

    // === Preencher tabelas ===
    const tSimplified = document.querySelector("#simplified tbody");
    const tFull = document.querySelector("#full tbody");
    tSimplified.innerHTML = "";
    tFull.innerHTML = "";

    sortedTeams.forEach((t,i)=>{
      const diff=t.gf-t.ga;
      const logo=getLogo(t.name);

      tSimplified.innerHTML += `
  <tr>
    <td>${i+1}</td>
    <td class="team-cell">
      <!-- Logo independente -->
      <a href="equipa.html?team=${encodeURIComponent(t.name)}" class="team-logo-link">
        <img src="${logo}" alt="${t.name}" width="30">
      </a>
      <!-- Nome independente -->
      <a href="equipa.html?team=${encodeURIComponent(t.name)}" class="team-name-link">
        <span>${t.name}</span>
      </a>
    </td>
    <td>${t.played}</td>
    <td class="${diff > 0 ? 'diff-positive' : diff < 0 ? 'diff-negative' : ''}">
  ${diff > 0 ? "+" + diff : diff}
</td>
    <td><b>${t.points}</b></td>
    <td><div class="form">${renderForm(t)}</div></td>
  </tr>`;

      tFull.innerHTML += `
  <tr>
    <td>${i+1}</td>
    <td class="team-logo-cell">
      <a href="equipa.html?team=${encodeURIComponent(t.name)}" class="team-logo-link">
        <img src="${logo}" width="30" alt="${t.name} Logo">
      </a>
    </td>
    <td class="team-name-cell">
      <a href="equipa.html?team=${encodeURIComponent(t.name)}" class="team-name-link">
        <span>${t.name}</span>
      </a>
    </td>
    <td>${t.played}</td>
    <td>${t.wins}</td>
    <td>${t.draws}</td>
    <td>${t.losses}</td>
    <td>${t.gf}</td>
    <td>${t.ga}</td>
    <td class="${diff > 0 ? 'diff-positive' : diff < 0 ? 'diff-negative' : ''}">
  ${diff > 0 ? "+" + diff : diff}
</td>
    <td><b>${t.points}</b></td>
    <td><div class="form">${renderForm(t)}</div></td>
  </tr>`;
    });

  }

  renderTable();
});