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
   NORMALIZAÇÃO DE NOMES
   ===================================================== */
function normalizeString(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* =====================================================
   PARSE DATA + HORA
   ===================================================== */
function parseDateTime(d, t) {
  if (!d) return null;
  d = d.trim().replace(/[-.]/g, "/");
  let day, month, year;
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    [year, month, day] = d.split("-").map(Number);
  } else {
    const p = d.split("/");
    if (p.length < 3) return null;
    [day, month, year] = p.map(Number);
    if (year < 100) year += year < 50 ? 2000 : 1900;
  }
  let h = 0, m = 0;
  if (t && /(\d{1,2}):(\d{2})/.test(t)) {
    [h, m] = t.split(":").map(Number);
  }
  return new Date(year, month-1, day, h, m);
}

/* =====================================================
   LOGO DAS EQUIPAS
   ===================================================== */
const LOGO_BASE_PATH = "assets/images/team-logo/";
function getTeamLogo(teamName, teamMap) {
  const team = teamMap[teamName];
  if (!team || !team.Logopng) return `${LOGO_BASE_PATH}default.svg`;
  return `${LOGO_BASE_PATH}${team.Logopng.trim()}`;
}

/* =====================================================
   RENDER CARD DA PARTIDA
   ===================================================== */
function renderMatchCard(m, teamMap) {
  const home = m.HomeTeam || "";
  const away = m.AwayTeam || "";
  const homeLogo = getTeamLogo(home, teamMap);
  const awayLogo = getTeamLogo(away, teamMap);

  const dateText = m.Data || "";
  const localText = m["Local do jogo"] || "";
  const timeText = m.Time || "";
  const hg = m.HomeGoals ?? "";
  const ag = m.AwayGoals ?? "";
  const hasScore = hg !== "" || ag !== "";

  const compName = m.Competition || "Mundialito de Futsal";
  const compSub = `${dateText}${ localText ? " · " + localText : "" }`;

  return `
<article class="match-card" data-jornada="${m.Jornada}" data-home="${home}" data-away="${away}">
  <header class="match-card__header">
    <img class="comp-badge" src="" onerror="this.style.display='none'">
    <div class="comp-info">
      <div class="comp-name">${compName}</div>
      <div class="comp-sub">${compSub}</div>
    </div>
  </header>

  <div class="match-card__body">
    <div class="home-block">
      <a href="equipa.html?team=${encodeURIComponent(home)}" class="team-name-link">
        <div class="team-name">${home}</div>
      </a>
    </div>

    <div class="match-meta">
      <a href="equipa.html?team=${encodeURIComponent(home)}" class="team-logo-link">
        <img class="team-logo" src="${homeLogo}" onerror="this.src='${LOGO_BASE_PATH}default.svg'">
      </a>

      <div class="match-time">
        ${ (() => {
          if (hasScore) return `<strong style="font-size:18px;">${hg} - ${ag}</strong>`;
          if (timeText) {
            const [hh, mm] = timeText.split(":");
            return `${hh.padStart(2,"0")}:${mm.padStart(2,"0")}`;
          }
          return "--:--";
        })() }
      </div>

      <a href="equipa.html?team=${encodeURIComponent(away)}" class="team-logo-link">
        <img class="team-logo" src="${awayLogo}" onerror="this.src='${LOGO_BASE_PATH}default.svg'">
      </a>
    </div>

    <div class="away-block">
      <a href="equipa.html?team=${encodeURIComponent(away)}" class="team-name-link">
        <div class="team-name">${away}</div>
      </a>
    </div>
  </div>
</article>`;
}

/* =====================================================
   LOAD MATCHES E RENDER
   ===================================================== */
async function loadMatchesAndRender() {
  const data = await loadJSON();
  if (!data) return;

  const matchesRaw = data.ficha_jogo || [];
  const teamsRaw = data.equipas || [];
  const teamMap = {};
  teamsRaw.forEach(t => { if (t.Team) teamMap[t.Team] = t; });

  let matches = matchesRaw.map(m => ({...m, __dt: parseDateTime(m.Data, m.Time)}))
                          .filter(x => x.__dt);

  matches.sort((a,b) => a.__dt - b.__dt);

  const container = document.getElementById("jornadas-container");
  container.innerHTML = "";

  const jornadas = {};
  matches.forEach(m => {
    const j = m.Jornada || "Sem Jornada";
    if (!jornadas[j]) jornadas[j] = [];
    jornadas[j].push(m);
  });

  Object.keys(jornadas).sort((a,b)=>a-b).forEach(j => {
    container.insertAdjacentHTML("beforeend", `<h2 class="section-title">Jornada ${j}</h2>`);
    container.insertAdjacentHTML("beforeend", `<div class="matches-wrap" id="jornada-${j}"></div>`);
    jornadas[j].forEach(m => {
      document.getElementById(`jornada-${j}`).insertAdjacentHTML("beforeend", renderMatchCard(m, teamMap));
    });
  });

  loadFilters();
}

loadMatchesAndRender();
setInterval(loadMatchesAndRender, 180000);

/* =====================================================
   FILTROS
   ===================================================== */
function loadFilters() {
  loadMatchdayOptions();
  loadClubOptions();
  applyFilters();
}

function loadMatchdayOptions() {
  const select = document.getElementById("matchdaySelect");
  select.innerHTML = `<option value="all">Todas Jornadas</option>`;
  const jornadas = new Set();
  document.querySelectorAll(".match-card").forEach(card => jornadas.add(card.dataset.jornada));
  [...jornadas].sort((a,b)=>a-b).forEach(j => select.insertAdjacentHTML("beforeend", `<option value="${j}">Jornada ${j}</option>`));
}

function loadClubOptions() {
  const select = document.getElementById("clubSelect");
  select.innerHTML = `<option value="all">Todos os Clubes</option>`;
  const clubs = new Set();
  document.querySelectorAll(".match-card").forEach(card => {
    clubs.add(card.dataset.home);
    clubs.add(card.dataset.away);
  });
  [...clubs].sort().forEach(c => select.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));
}

function applyFilters() {
  const jornada = document.getElementById("matchdaySelect").value;
  const club = document.getElementById("clubSelect").value;

  document.querySelectorAll(".section-title").forEach(t => (t.style.display = "none"));
  document.querySelectorAll(".matches-wrap").forEach(w => (w.style.display = "none"));

  const visible = {};
  document.querySelectorAll(".match-card").forEach(card => {
    const cardJornada = card.dataset.jornada;
    const home = card.dataset.home;
    const away = card.dataset.away;

    let show = true;
    if (jornada !== "all" && jornada !== cardJornada) show = false;
    if (club !== "all" && home !== club && away !== club) show = false;

    card.style.display = show ? "grid" : "none";
    if (show) visible[cardJornada] = true;
  });

  Object.keys(visible).forEach(j => {
    document.querySelector(`#jornada-${j}`).style.display = "grid";
    const title = [...document.querySelectorAll(".section-title")]
      .find(t => t.textContent.includes(`Jornada ${j}`));
    if (title) title.style.display = "block";
  });
}

document.getElementById("matchdaySelect").addEventListener("change", applyFilters);
document.getElementById("clubSelect").addEventListener("change", applyFilters);