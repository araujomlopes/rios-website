// =====================================================
// JOGADOR.JS - VERSÃO PARA USAR dados.json
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const PLAYER_NAME = urlParams.get("player") || "Dickson";

  // =====================================================
  // 1️⃣ Carrega o JSON local gerado pelo build.js
  // =====================================================
  const dados = await fetch('dados.json').then(r => r.json());

  const jogos = dados.ficha_jogo || [];
  const equipas = dados.equipas || [];
  const jogadores = dados.jogadores || [];

  // =====================================================
  // 2️⃣ Utilitários
  // =====================================================
  const normalize = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const safeNumber = val => { const n = Number(String(val || "0").replace(",", ".").trim()); return isNaN(n) ? 0 : n; };
  const countPlayerCards = (val, playerName) => {
    if (!val) return 0;
    let total = 0;
    String(val).split(",").forEach(entry => {
      if (normalize(entry.trim()) === normalize(playerName)) total++;
    });
    return total;
  };

  // =====================================================
  // 3️⃣ Encontra jogador e equipa
  // =====================================================
  const player = jogadores.find(p => normalize(p.Player) === normalize(PLAYER_NAME));
  if (!player) return;

  const teamKey = normalize(player.Team);
  const team = equipas.find(e => normalize(e.Team) === teamKey);

  // =====================================================
  // 4️⃣ BANNER
  // =====================================================
  if (player && team) {
    const teamFolder = team.Team.replace(/\s+/g, '_');
    const picture = document.querySelector(".bg-texture-container");
    if (picture) {
      const img = picture.querySelector("img");
      const sources = picture.querySelectorAll("source");

      if (sources[0]) sources[0].dataset.srcset = `assets/images/banner_players/${teamFolder}/1920.webp`;
      if (sources[1]) sources[1].dataset.srcset = `assets/images/banner_players/${teamFolder}/1200.webp`;
      if (sources[2]) sources[2].dataset.srcset = `assets/images/banner_players/${teamFolder}/800.webp`;
      if (img) img.dataset.src = `assets/images/banner_players/${teamFolder}/800.webp`;

      new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            sources.forEach(s => { if (s) s.srcset = s.dataset.srcset; });
            if (img) img.src = img.dataset.src;
            observer.disconnect();
          }
        });
      }).observe(picture);
    }
  }

  // =====================================================
  // 5️⃣ HEADER
  // =====================================================
  const playerNumberEl = document.querySelector(".player-number");
  const firstNameEl = document.querySelector(".firstName");
  const lastNameEl = document.querySelector(".lastName");
  const shirtName = document.querySelector(".shirt-name");
  const shirtNumber = document.querySelector(".shirt-number");
  const playerPositionEl = document.querySelector(".player-position");
  const playerClubEl = document.querySelector(".player-club");
  const playerImg = document.querySelector(".player-photo-img");

  if (playerNumberEl) playerNumberEl.textContent = player.Number;
  if (firstNameEl) firstNameEl.textContent = player.Player?.split(" ")[0] || player.Player;
  if (lastNameEl) lastNameEl.textContent = player.Apelido || "";
  if (shirtName) shirtName.textContent = player.Player?.split(" ")[0] || player.Player;
  if (shirtNumber) shirtNumber.textContent = player.Number;
  if (playerPositionEl) playerPositionEl.textContent = player.Position;
  if (playerClubEl) playerClubEl.textContent = player.Team;

  if (playerImg) {
    playerImg.dataset.src = `assets/images/perfil_jogador/foto_perfil_banner/${encodeURIComponent(PLAYER_NAME)}.webp`;
    new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playerImg.src = playerImg.dataset.src;
          obs.disconnect();
        }
      });
    }).observe(playerImg);
  }

  if (team) {
    const clubLogo = document.querySelector(".club-logo");
    if (clubLogo) {
      clubLogo.dataset.src = `assets/images/team-logo/${team.Logopng}`;
      new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            clubLogo.src = clubLogo.dataset.src;
            obs.disconnect();
          }
        });
      }).observe(clubLogo);
    }
  }

  // =====================================================
  // 6️⃣ FILTRA JOGOS PARA O SLIDER
  // =====================================================
  const sliderGamesList = jogos.filter(j => {
    const hasResult = j.HomeGoals && j.AwayGoals && j.HomeGoals.trim() !== "" && j.AwayGoals.trim() !== "";
    const isHomeTeam = normalize(j.HomeTeam) === teamKey;
    const isAwayTeam = normalize(j.AwayTeam) === teamKey;
    const isTeamGame = isHomeTeam || isAwayTeam;

    const playersHome = j.PlayersHome ? String(j.PlayersHome).split(",").map(n => normalize(n.trim())) : [];
    const playersAway = j.PlayersAway ? String(j.PlayersAway).split(",").map(n => normalize(n.trim())) : [];
    const playerInHome = playersHome.includes(normalize(player.Player));
    const playerInAway = playersAway.includes(normalize(player.Player));
    const playerInFicha = playerInHome || playerInAway;

    if (hasResult) return playerInFicha;
    if (!hasResult && isTeamGame) return true;
    return false;
  });

  // =====================================================
  // 7️⃣ JOGOS PARA ESTATÍSTICAS
  // =====================================================
  const statsGamesList = jogos.filter(j => {
    const hasResult = j.HomeGoals && j.AwayGoals && j.HomeGoals.trim() !== "" && j.AwayGoals.trim() !== "";
    const playersHome = j.PlayersHome ? String(j.PlayersHome).split(",").map(n => normalize(n.trim())) : [];
    const playersAway = j.PlayersAway ? String(j.PlayersAway).split(",").map(n => normalize(n.trim())) : [];
    const playerInHome = playersHome.includes(normalize(player.Player));
    const playerInAway = playersAway.includes(normalize(player.Player));
    const playerInFicha = playerInHome || playerInAway;
    return hasResult && playerInFicha;
  });

  // =====================================================
  // 8️⃣ CÁLCULO DAS ESTATÍSTICAS
  // =====================================================
  let wins = 0, draws = 0, defeats = 0, goals = 0, yellow = 0, red = 0;
  statsGamesList.forEach(j => {
    const homeScore = safeNumber(j.HomeGoals);
    const awayScore = safeNumber(j.AwayGoals);
    const isHome = normalize(j.HomeTeam) === teamKey;

    if (homeScore === awayScore) draws++;
    else if ((homeScore > awayScore && isHome) || (awayScore > homeScore && !isHome)) wins++;
    else defeats++;

    // ===== PROCESSA GOLOS DO JOGADOR =====
// ===== PROCESSA GOLOS DO JOGADOR =====
const processScorers = (val) => {
  if (!val) return 0;

  // Se for string (antigo formato CSV), transforma em array
  const arr = Array.isArray(val) ? val : String(val).split(",").map(s => s.trim()).filter(s => s);

  let total = 0;
  arr.forEach(entry => {
    const parts = entry.split(":");      // "Araujo:10"
    const name = normalize(parts[0]);
    if (name === normalize(player.Player)) {
      total += parts[1] ? Number(parts[1]) : 1;
    }
  });
  return total;
};

// ===== PROCESSA CARTÕES DO JOGADOR =====
const countPlayerCards = (val, playerName) => {
  if (!val) return 0;
  const arr = Array.isArray(val) ? val : String(val).split(",").map(s => s.trim()).filter(s => s);
  let total = 0;
  arr.forEach(entry => {
    if (normalize(entry) === normalize(playerName)) total++;
  });
  return total;
};

goals += processScorers(j.ScorersHome);
goals += processScorers(j.ScorersAway);

    yellow += countPlayerCards(isHome ? j.YellowsHome : j.YellowsAway, player.Player);
    red += countPlayerCards(isHome ? j.RedsHome : j.RedsAway, player.Player);
  });

  const totalGamesStats = statsGamesList.length;

  const setStat = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setStat('height', player["Altura"] || "—");
  setStat('preferredFoot', player["Pé preferido"] || "—");
  setStat('games', totalGamesStats);
  setStat('wins', wins);
  setStat('draws', draws);
  setStat('defeats', defeats);
  setStat('goals', goals);
  setStat('yellowCards', yellow);
  setStat('redCards', red);

  // =====================================================
  // 9️⃣ SLIDER DE JOGOS
  // =====================================================
  const track = document.getElementById("games-track");
  if (track) {
    track.innerHTML = "";

    sliderGamesList.forEach(j => {
      const home = equipas.find(e => normalize(e.Team) === normalize(j.HomeTeam));
      const away = equipas.find(e => normalize(e.Team) === normalize(j.AwayTeam));
      const homeGoals = j.HomeGoals?.trim() !== "" ? safeNumber(j.HomeGoals) : null;
      const awayGoals = j.AwayGoals?.trim() !== "" ? safeNumber(j.AwayGoals) : null;
      
      const scoreDisplay = (() => {
        if (homeGoals !== null || awayGoals !== null) return `${homeGoals ?? "?"} - ${awayGoals ?? "?"}`;
        if (j["Time"]) {
          const t = j["Time"].split(":");
          return `${t[0].padStart(2, "0")}:${t[1]?.padStart(2, "0") || "00"}`;
        }
        return "--:--";
      })();

      const card = document.createElement("div");
      card.className = "mu-card";
      
      let displayInfo = "";
      if (homeGoals !== null || awayGoals !== null) {
        const parts = String(j.Data).split("/");
        const day = parts[0]?.padStart(2,"0") || "";
        const monthNum = parseInt(parts[1],10);
        const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        const month = monthNames[monthNum-1] || "";
        displayInfo = `Terminado, ${day} ${month}`;
      } else {
        displayInfo = `${j.Data || ""}, ${j["Local do jogo"] || ""}`;
      }

      card.innerHTML = `
        <p class="info">${displayInfo}</p>
        <div class="score">
          <img data-src="assets/images/team-logo/${home?.Logopng || ""}" alt="">
          <span>${scoreDisplay}</span>
          <img data-src="assets/images/team-logo/${away?.Logopng || ""}" alt="">
        </div>
        <div class="teams"><span>${j.HomeTeam}</span><span>VS</span><span>${j.AwayTeam}</span></div>
      `;
      track.appendChild(card);
    });

    // Lazy-load slider images
    const sliderImages = track.querySelectorAll("img[data-src]");
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.src = entry.target.dataset.src;
          entry.target.removeAttribute("data-src");
          obs.unobserve(entry.target);
        }
      });
    }, { root: track, threshold: 0.1 });
    sliderImages.forEach(img => imgObserver.observe(img));

    // Slider nav e drag (igual ao original)
    const slider = document.querySelector(".tabelapontos-container .mu-slider");
    if (slider) {
      const btnPrev = slider.querySelector(".prev");
      const btnNext = slider.querySelector(".next");
      const STEP = 280;
      if (btnPrev) btnPrev.onclick = () => track.scrollBy({ left: -STEP, behavior: "smooth" });
      if (btnNext) btnNext.onclick = () => track.scrollBy({ left: STEP, behavior: "smooth" });
    }

    let isDown=false, startX, scrollLeft;
    track.addEventListener("mousedown", e => { isDown=true; startX=e.pageX-track.offsetLeft; scrollLeft=track.scrollLeft; });
    track.addEventListener("mouseleave", ()=>{ isDown=false; });
    track.addEventListener("mouseup", ()=>{ isDown=false; });
    track.addEventListener("mousemove", e => { if(!isDown) return; e.preventDefault(); track.scrollLeft = scrollLeft - (e.pageX-startX)*1.5; });
    track.addEventListener("touchstart", e => { isDown=true; startX=e.touches[0].pageX-track.offsetLeft; scrollLeft=track.scrollLeft; });
    track.addEventListener("touchend", ()=>{ isDown=false; });
    track.addEventListener("touchmove", e => { if(!isDown) return; track.scrollLeft = scrollLeft - (e.touches[0].pageX-startX)*1.5; });
  }

  // =====================================================
  // 10️⃣ TEAMMATES
  // =====================================================
  renderTeammates(jogadores, player.Team, PLAYER_NAME);

  // Inicializa o slider de teammates (arrastar, touch e botões)
initTeammatesSlider();
});

// =====================================================
// FUNÇÃO PARA TEAMMATES (igual ao original)
// =====================================================
function renderTeammates(allPlayers, currentTeam, currentPlayerName) {
  const track = document.getElementById('teammates-track');
  if (!track) return;

  const teammates = allPlayers.filter(p => 
    p.Team && currentTeam &&
    p.Team.trim().toLowerCase() === currentTeam.trim().toLowerCase() && 
    p.Player.trim().toLowerCase() !== currentPlayerName.trim().toLowerCase()
  );

  track.innerHTML = ""; // limpa track antes

teammates.forEach(tm => {
    const nameParts = tm.Player.trim().split(' ');
    const firstName = nameParts[0];
    const apelido = tm.Apelido || "";

    const div = document.createElement("div");
    div.className = "mu-slide";

    div.innerHTML = `
        <div class="tm-card-premium">
          <div class="tm-header-info">
            <span class="tm-first-name">${firstName}</span>
            <span class="tm-last-name">${apelido}</span>
          </div>
          <div class="shirt-container">
            <img class="shirt-img" 
                 src="assets/images/perfil_jogador/foto_perfil_banner/${encodeURIComponent(tm.Player)}.webp" 
                 onerror="this.src='assets/images/default-player.webp'">
            <div class="shirt-data">
              <span class="shirt-name-small">${firstName}</span>
              <span class="shirt-number-big">${tm.Number || ''}</span>
            </div>
          </div>
        </div>
    `;

    // 🔹 Detecta clique sem arraste
    let isDragging = false;
    div.addEventListener("mousedown", () => { isDragging = false; });
    div.addEventListener("mousemove", () => { isDragging = true; });
    div.addEventListener("mouseup", () => {
        if (!isDragging) window.location.href = `jogador.html?player=${encodeURIComponent(tm.Player)}`;
    });
    div.addEventListener("touchstart", () => { isDragging = false; });
    div.addEventListener("touchmove", () => { isDragging = true; });
    div.addEventListener("touchend", () => {
        if (!isDragging) window.location.href = `jogador.html?player=${encodeURIComponent(tm.Player)}`;
    });

    track.appendChild(div);
});

  initTeammatesSlider();
}

function initTeammatesSlider() {
  const track = document.getElementById('teammates-track');
  const btnPrev = document.querySelector('.teammates-container .prev');
  const btnNext = document.querySelector('.teammates-container .next');

  if (!track) return;

  const scrollAmount = 260;

  // Botões
  if (btnNext) btnNext.onclick = () => {
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (btnPrev) btnPrev.onclick = () => {
    track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  // ===== DRAG APENAS PARA MOUSE =====
  let isDown = false;
  let startX;
  let scrollLeft;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX;
    scrollLeft = track.scrollLeft;
    track.classList.add('dragging');
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.classList.remove('dragging');
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.classList.remove('dragging');
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;

    e.preventDefault(); // 🔥 importante
    const walk = (e.pageX - startX) * 1.2;
    track.scrollLeft = scrollLeft - walk;
  });
}

// =====================================================
// TOGGLE ESTATÍSTICAS / INFO (igual ao original)
// =====================================================
const btnSeason = document.getElementById("btn-season");
const btnCareer = document.getElementById("btn-career");
const statsGrid = document.querySelector(".stats-grid");
const stats = document.querySelectorAll(".stats-grid .stat-item");

function showMainStats() {
  stats.forEach((el,i) => el.style.display = i>=2?"flex":"none");
  if(statsGrid){ statsGrid.classList.remove("info-mode"); statsGrid.classList.add("main-mode"); }
}

function showInfoStats() {
  stats.forEach((el,i) => el.style.display = i<2?"flex":"none");
  if(statsGrid){ statsGrid.classList.remove("main-mode"); statsGrid.classList.add("info-mode"); }
}

if(btnSeason && btnCareer){
  showMainStats();
  btnSeason.onclick = () => { showMainStats(); btnSeason.classList.add("active"); btnCareer.classList.remove("active"); };
  btnCareer.onclick = () => { showInfoStats(); btnCareer.classList.add("active"); btnSeason.classList.remove("active"); };
}