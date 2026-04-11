// =====================================================
// PAGINA EQUIPA - VERSÃO DADOS.JSON
// =====================================================

// ----------------------
// CONFIGURAÇÃO DO JSON
// ----------------------
const DATA_JSON = "dados.json"; // substitui todos os SHEETS.*

// ----------------------
// PEGAR PARAMETRO DA URL
// ----------------------
function getTeamFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('team') || '';
}
const TEAM_NAME = getTeamFromURL();

// Normaliza nome da equipa para usar como pasta
function folderNameFromTeam(team){
    if(!team) return "";
    return team
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g,"");
}

// ----------------------
// VARIÁVEIS GLOBAIS
// ----------------------
let allTeams = [];
let allPlayers = [];
let allMatches = [];
let allSponsors = [];

// ----------------------
// FUNÇÃO AUXILIAR PARA CARREGAR JSON
// ----------------------
async function fetchJSON() {
    const res = await fetch(DATA_JSON);
    return await res.json();
}

// ----------------------
// LIMPAR NOMES
// ----------------------
function cleanPlayerName(name) {
    if(!name) return "";
    let cleaned = name.replace(/["']/g, "");
    cleaned = cleaned.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let id = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");
    return { display: cleaned, id: id };
}

// ----------------------
// CARREGAR DADOS DA EQUIPA
// ----------------------
async function loadTeamData() {
    const data = await fetchJSON();
    allTeams = data.equipas || [];
    allPlayers = data.jogadores || [];
    allMatches = data.ficha_jogo || [];
    allSponsors = data.sponsors || [];

    const team = allTeams.find(t => t.Team === TEAM_NAME);
    if(!team) return console.error("Team not found:", TEAM_NAME);

    // Atualiza título da equipa
    const headerTitle = document.querySelector(".team-title");
    if(headerTitle) headerTitle.textContent = team.Team;

    // Atualiza nome do sponsor
    const sponsorData = allSponsors.find(s => s.Equipa === TEAM_NAME);
    const sponsorElem = document.querySelector(".team-sponsor");
    if(sponsorElem && sponsorData && sponsorData.Sponsor) sponsorElem.textContent = sponsorData.Sponsor;

    // Atualiza banner
    updateTeamBanner();
}

// ----------------------
// ATUALIZA BANNER
// ----------------------
function updateTeamBanner() {
    const bgPicture = document.getElementById("team-banner-picture");
    if (!bgPicture) return;

    const folder = folderNameFromTeam(TEAM_NAME);

    const desktopSource = bgPicture.querySelector('source[media="(min-width: 1440px)"]');
    const tabletSource  = bgPicture.querySelector('source[media="(min-width: 768px)"]');
    const img           = bgPicture.querySelector("img");

    if (desktopSource) desktopSource.srcset = `assets/images/banner/${folder}/banner-3840.webp`;
    if (tabletSource)  tabletSource.srcset  = `assets/images/banner/${folder}/banner-2560.webp`;
    if (img) {
        img.src = `assets/images/banner/${folder}/banner-920.webp`;
        img.alt = `${TEAM_NAME} Banner`;
    }
}
window.addEventListener("resize", updateTeamBanner);

// ----------------------
// CARREGAR JOGOS
// ----------------------
function loadMatches() {
    const teamMatches = allMatches.filter(j => j.HomeTeam === TEAM_NAME || j.AwayTeam === TEAM_NAME);
    const track = document.querySelector(".mu-slider-track");
    if(!track) return;

    track.innerHTML = "";
    teamMatches.forEach(j => {
        const home = j.HomeTeam, away = j.AwayTeam;
        const scoreHome = j.HomeGoals || "", scoreAway = j.AwayGoals || "";
        const homeTeamData = allTeams.find(t => t.Team===home);
        const awayTeamData = allTeams.find(t => t.Team===away);

        const card = document.createElement("div");
        card.className = "mu-card";
        card.innerHTML = `
            <img class="league" src="//via.placeholder.com/150x50?text=League" alt="">
            <p class="info">${j.Data}, ${j.Time}, ${j["Local do jogo"]}</p>
            <div class="score">
                <img src="assets/images/team-logo/${homeTeamData?.Logopng || 'placeholder.svg'}" alt="${home}">
                <span>${scoreHome !== "" || scoreAway !== "" ? `${scoreHome} - ${scoreAway}` : (j.Time ? j.Time : "--:--")}</span>
                <img src="assets/images/team-logo/${awayTeamData?.Logopng || 'placeholder.svg'}" alt="${away}">
            </div>
            <div class="teams"><span>${home}</span><span>VS</span><span>${away}</span></div>
        `;
        track.appendChild(card);
    });
}

// ----------------------
// CARREGAR JOGADORES / SQUAD
// ----------------------
// ----------------------
// CARREGAR JOGADORES / SQUAD
// ----------------------
function loadSquad() {
    const teamPlayers = allPlayers.filter(p => p.Team === TEAM_NAME);
    const carousel = document.querySelector(".squad-carousel");
    if (!carousel) return;

    carousel.innerHTML = "";
    teamPlayers.forEach(p => {
        const display = p.Player.trim(); // mantém os acentos exatamente como no JSON

        // Tentativa de foto real do jogador, se não houver usa placeholder
        let imgPath = 'assets/images/perfil_jogador/foto_topscore_x/placeholder.webp';
        if (p.foto_topscore_x && p.foto_topscore_x.trim() !== "") {
            imgPath = `assets/images/perfil_jogador/foto_topscore_x/${p.foto_topscore_x}`;
        } else {
            // Usa o nome original do jogador para tentar carregar a imagem (mantendo acentos)
            const fileName = p.Player.trim() + ".webp";
            imgPath = `assets/images/perfil_jogador/foto_topscore_x/${fileName}`;
        }

        // Cria div do jogador
const div = document.createElement("div");
div.className = "squad-player";

// Conteúdo interno
div.innerHTML = `
    <div class="squad-player-img">
        <img src="${imgPath}" alt="${display}" onerror="this.src='assets/images/silhouette/silhouette_topscore-x.svg'">
    </div>
    <div class="squad-player-name">${display}</div>
    <div class="squad-player-role">${p.Position || ""}</div>
`;

// Variável para detectar drag
let isDragging = false;

// Mouse events
div.addEventListener("mousedown", () => { isDragging = false; });
div.addEventListener("mousemove", () => { isDragging = true; });
div.addEventListener("mouseup", () => {
    if (!isDragging) {
        window.location.href = `jogador.html?player=${encodeURIComponent(p.Player)}`;
    }
});

// Touch events
div.addEventListener("touchstart", () => { isDragging = false; });
div.addEventListener("touchmove", () => { isDragging = true; });
div.addEventListener("touchend", () => {
    if (!isDragging) {
        window.location.href = `jogador.html?player=${encodeURIComponent(p.Player)}`;
    }
});

carousel.appendChild(div);
    });
}

// ----------------------
// CALCULAR E ANIMAR ESTATÍSTICAS
// ----------------------
// ----------------------
// CALCULAR E ANIMAR ESTATÍSTICAS
// ----------------------
// ----------------------
// CALCULAR E ANIMAR ESTATÍSTICAS
// ----------------------
function calculateStats() {
    const teamMatches = allMatches.filter(j =>
        (j.HomeTeam === TEAM_NAME || j.AwayTeam === TEAM_NAME) &&
        j.HomeGoals !== "" && j.AwayGoals !== ""
    );

    let wins = 0, draws = 0, defeats = 0;
    let goalsFor = 0, goalsAgainst = 0, yellows = 0, reds = 0;

    teamMatches.forEach(j => {
        const homeScore = parseInt(j.HomeGoals || 0);
        const awayScore = parseInt(j.AwayGoals || 0);

        if (j.HomeTeam === TEAM_NAME) {
            goalsFor += homeScore;
            goalsAgainst += awayScore;
            // Lê arrays diretamente do JSON, sem split
            yellows += Array.isArray(j.YellowsHome) ? j.YellowsHome.length : 0;
            reds += Array.isArray(j.RedsHome) ? j.RedsHome.length : 0;

            if (homeScore > awayScore) wins++;
            else if (homeScore === awayScore) draws++;
            else defeats++;
        } else {
            goalsFor += awayScore;
            goalsAgainst += homeScore;
            yellows += Array.isArray(j.YellowsAway) ? j.YellowsAway.length : 0;
            reds += Array.isArray(j.RedsAway) ? j.RedsAway.length : 0;

            if (awayScore > homeScore) wins++;
            else if (awayScore === homeScore) draws++;
            else defeats++;
        }
    });

    const totalGames = teamMatches.length;

    document.getElementById("stat-games").textContent = totalGames;
    document.getElementById("stat-goals-for").textContent = goalsFor;
    document.getElementById("stat-goals-against").textContent = goalsAgainst;
    document.getElementById("stat-yellows").textContent = yellows;
    document.getElementById("stat-reds").textContent = reds;
    document.getElementById("stat-wins").textContent = wins;
    document.getElementById("stat-draws").textContent = draws;
    document.getElementById("stat-defeats").textContent = defeats;
}

// =========================
// FUNÇÃO UNIVERSAL PARA SLIDERS
// =========================
// =======================
// FUNÇÃO GENÉRICA PARA SLIDERS
// =======================
function initSlider(trackSelector, btnPrevSelector, btnNextSelector, cardWidth = 283) {
  const track = document.querySelector(trackSelector);
  const btnPrev = document.querySelector(btnPrevSelector);
  const btnNext = document.querySelector(btnNextSelector);
  if (!track) return;

  // Calcula scrollAmount automático se necessário
  const scrollAmount = cardWidth;

  // BOTÕES
  btnPrev?.addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  btnNext?.addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  // DRAG & TOUCH
// ======================
// DRAG & TOUCH UNIVERSAL
// ======================
let isDown = false;
let startX = 0;
let scrollLeft = 0;
let moved = false;

const start = x => {
  isDown = true;
  moved = false;
  track.classList.add("dragging");
  startX = x;
  scrollLeft = track.scrollLeft;
};

const move = x => {
  if (!isDown) return;
  const walk = x - startX;
  if (Math.abs(walk) > 5) moved = true; // detecta drag real
  track.scrollLeft = scrollLeft - walk;
};

const end = () => {
  isDown = false;
  track.classList.remove("dragging");
};

// Mouse Events
track.addEventListener("mousedown", e => start(e.pageX));
track.addEventListener("mousemove", e => move(e.pageX));
window.addEventListener("mouseup", end);

// Bloqueia clique se arrastou
track.addEventListener("click", e => {
  if (moved) {
    e.preventDefault();
    e.stopPropagation();
  }
});

// Touch Events
track.addEventListener("touchstart", e => start(e.touches[0].pageX), { passive: true });
track.addEventListener("touchmove", e => move(e.touches[0].pageX), { passive: true });
track.addEventListener("touchend", end);
}

// ----------------------
// INICIALIZA TODOS SLIDERS
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  initSlider(".mu-slider-track", ".mu-slider-btn.prev", ".mu-slider-btn.next", 283);
  initSlider(".squad-carousel", ".squad-nav-btn.prev", ".squad-nav-btn.next", 300);
});

// =========================
// INICIALIZAR PAGINA
// =========================
async function initTeamPage() {
    await loadTeamData();
    loadMatches();
    loadSquad();
    calculateStats();

    // Inicializa sliders
    initSlider(".mu-slider-track", ".mu-slider-btn.prev", ".mu-slider-btn.next");
    initSlider(".squad-carousel", ".squad-nav-btn.prev", ".squad-nav-btn.next");
}

document.addEventListener("DOMContentLoaded", initTeamPage);



