/* =====================================================
   LOAD JSON (SUBSTITUI SHEETS)
   ===================================================== */
async function loadJSON() {
  try {
    const res = await fetch("dados.json");
    if (!res.ok) throw new Error("dados.json não encontrado");
    return await res.json();
  } catch (err) {
    console.error("Erro carregando dados.json:", err);
    return null;
  }
}

/* =====================================================
   NORMALIZAÇÃO PARA NOMES E BUSCAS
   ===================================================== */
function normalizeString(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* =====================================================
   RESOLVE CAMINHO DE IMAGEM DO JOGADOR
   ===================================================== */
function resolvePlayerImage(playerName, foto_lista) {
  // Prioriza foto_lista do JSON
  if (foto_lista) {
    return `assets/images/perfil_jogador/foto_lista/${foto_lista}`;
  }
  // Fallback para nome do jogador
  return `assets/images/perfil_jogador/foto_lista/${playerName}.webp`;
}

/* =====================================================
   TOP SCORERS
   ===================================================== */
async function updateTopScorers() {
  const data = await loadJSON();
  if (!data) return;

  const fichas = data.ficha_jogo || [];
  const equipas = data.equipas || [];
  const jogadores = data.jogadores || [];

  const stats = {};
  const clubSet = new Set();

  // Monta estatísticas iniciais e caminhos de imagens
  jogadores.forEach(j => {
    const name = (j.Player || "").trim();
    if (!name) return;

    stats[name] = {
      golos: 0,
      team: j.Team || "",
      position: j.Position || "",
      image: resolvePlayerImage(name, j.foto_lista)
    };

    if (j.Team) clubSet.add(j.Team);
  });

  // Popula select de clubes
  const selectClub = document.getElementById("ts-club-select");
  if (selectClub) {
    selectClub.innerHTML = `<option value="">Todos os clubes</option>`;
    Array.from(clubSet)
      .sort((a, b) => a.localeCompare(b))
      .forEach(club => {
        const opt = document.createElement("option");
        opt.value = club;
        opt.textContent = club;
        selectClub.appendChild(opt);
      });
  }

  // Soma gols por jogador
  fichas.forEach(f => {
    ["ScorersHome", "ScorersAway"].forEach(col => {
      const scorers = f[col];
      if (!scorers || !Array.isArray(scorers)) return;

      scorers.forEach(s => {
        // "Nome do Jogador:3"
        const [name, goals] = s.split(":");
        const g = Number(goals) || 1;
        if (stats[name?.trim()]) stats[name.trim()].golos += g;
      });
    });
  });

  // Agrupamento por posições
  const grouped = {
    "Guarda-redes": [],
    "Fixos": [],
    "Alas": [],
    "Pivôs": []
  };

  Object.entries(stats).forEach(([name, data]) => {
    const pos = (data.position || "").toLowerCase();
    if (pos.includes("guarda")) grouped["Guarda-redes"].push({ playerName: name, ...data });
    else if (pos.includes("fixo")) grouped["Fixos"].push({ playerName: name, ...data });
    else if (pos.includes("ala")) grouped["Alas"].push({ playerName: name, ...data });
    else if (pos.includes("piv")) grouped["Pivôs"].push({ playerName: name, ...data });
  });

  // Ordena por nome dentro da posição
  const displayOrder = ["Guarda-redes", "Fixos", "Alas", "Pivôs"];
  displayOrder.forEach(pos => grouped[pos].sort((a, b) => a.playerName.localeCompare(b.playerName)));

  const grid = document.querySelector(".scorers-grid");
  if (!grid) return;

  grid.innerHTML = "";

  function cardHTML(p) {
    const link = `jogador.html?player=${encodeURIComponent(p.playerName)}`;
    return `
      <div class="scorer-card">
        <div class="ts-rank"><p class="ts-rank__label">${p.rank}</p></div>
        <div class="player-info">
          <a href="${link}">
            <img src="${p.image}" class="player-photo"
              onerror="this.onerror=null;this.src='assets/images/silhouette/silhouette_foto_lista.svg';">
          </a>
          <div class="player-text">
            <a href="${link}"><h3>${p.playerName}</h3></a>
            <p>${p.position}</p>
          </div>
        </div>
      </div>`;
  }

  let rankCounter = 1;

  displayOrder.forEach(pos => {
    if (!grouped[pos].length) return;

    grid.innerHTML += `
      <h2 class="pos-title" style="
        grid-column:1/-1;
        margin:20px 0 0;
        font-family: var(--font-secondary);
        font-size: var(--fs-xl);
        font-weight: var(--fw-semibold);
        color: var(--text);
      ">${pos}</h2>`;

    grouped[pos].forEach(p => {
      p.rank = rankCounter++;
      grid.innerHTML += cardHTML(p);
    });
  });

  // FILTROS
  function filterCards() {
    const term = normalizeString(document.getElementById("ts-search")?.value);
    const clubTerm = document.getElementById("ts-club-select")?.value;

    document.querySelectorAll(".scorer-card").forEach(card => {
      const name = normalizeString(card.querySelector("h3").textContent);
      const posi = normalizeString(card.querySelector("p").textContent);
      const team = stats[card.querySelector("h3").textContent]?.team;

      let show = name.includes(term) || posi.includes(term);
      if (clubTerm) show = show && team === clubTerm;

      card.style.display = show ? "" : "none";
    });
  }

  document.getElementById("ts-search")?.addEventListener("input", filterCards);
  document.getElementById("ts-club-select")?.addEventListener("change", filterCards);
}

updateTopScorers();