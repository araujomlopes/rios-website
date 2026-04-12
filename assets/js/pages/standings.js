/* =====================================================
   LOAD JSON LOCAL
   ===================================================== */
async function loadJSON(path = "dados.json") {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} não encontrado`);
    return await res.json();
  } catch (err) {
    console.error("Erro carregando JSON:", err);
    return null;
  }
}

/* =====================================================
   NORMALIZAÇÃO DE NOMES PARA LOGOS
   ===================================================== */
function formatTeamToLogo(name) {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/* =====================================================
   CALCULAR CLASSIFICAÇÃO
   ===================================================== */
function calculateStandings(matches) {
  const teams = {};

  matches.forEach(match => {
    const home = match.HomeTeam?.trim();
    const away = match.AwayTeam?.trim();
    [home, away].forEach(t => {
      if (t && !teams[t]) teams[t] = { 
        name: t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 
      };
    });
  });

  matches.forEach(match => {
    const home = match.HomeTeam?.trim();
    const away = match.AwayTeam?.trim();
    if (!home || !away || match.HomeGoals === "" || match.AwayGoals === "") return;

    const hg = Number(match.HomeGoals), ag = Number(match.AwayGoals);
    if (isNaN(hg) || isNaN(ag)) return;

    teams[home].played++; teams[away].played++;
    teams[home].gf += hg; teams[home].ga += ag;
    teams[away].gf += ag; teams[away].ga += hg;

    if (hg > ag) { 
      teams[home].wins++; teams[home].points += 3; teams[away].losses++; 
    } else if (hg < ag) { 
      teams[away].wins++; teams[away].points += 3; teams[home].losses++; 
    } else { 
      teams[home].draws++; teams[away].draws++; 
      teams[home].points++; teams[away].points++; 
    }
  });

  return Object.values(teams).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffB = b.gf - b.ga, diffA = a.gf - a.ga;
    if (diffB !== diffA) return diffB - diffA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

/* =====================================================
   RENDER CLASSIFICAÇÃO
   ===================================================== */
function renderStandings(teams, logos) {
  const track = document.querySelector("#standings-track");
  if (!track) return;
  track.innerHTML = "";

  teams.forEach((team, index) => {
    const key = formatTeamToLogo(team.name);
const logoFile = logos[key];

const logoPath = logoFile
  ? `assets/images/team-logo/${logoFile}`
  : "assets/images/team-logo/default.svg";

    const card = document.createElement("div");
    card.className = "standing-card";
    card.innerHTML = `
      <span class="position">${index + 1}.</span>
      <img src="${logoPath}" onerror="this.src='assets/images/team-logo/default.svg'" alt="${team.name}">
      <span class="team">${team.name}</span>
      <span class="points">${team.points} Pts</span>
    `;

    // ✅ Redireciona para a página da equipa ao clicar
    card.addEventListener("click", () => {
      // O parâmetro 'team' vai ser lido pela página equipa.html
      window.location.href = `equipa.html?team=${encodeURIComponent(team.name)}`;
    });

    // Cursor de “pointer” ao passar o mouse
    card.style.cursor = "pointer";

    track.appendChild(card);
  });
}

/* =====================================================
   START CLASSIFICAÇÃO
   ===================================================== */
async function initStandings() {
  const data = await loadJSON();
  if (!data) return;
  const matches = data.ficha_jogo || [];

  const standings = calculateStandings(matches);

// 🔥 NOVO: criar mapa de logos
const equipas = data.equipas || [];
const logos = {};

equipas.forEach(e => {
  const key = formatTeamToLogo(e.Team);
  logos[key] = e.Logopng ? e.Logopng.trim() : "";
});

// 🔥 passar logos para render
renderStandings(standings, logos);
}

window.addEventListener("DOMContentLoaded", initStandings);