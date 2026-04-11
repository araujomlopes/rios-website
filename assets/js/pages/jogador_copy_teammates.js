document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const PLAYER_NAME = urlParams.get("player") || "Dickson";

  const SHEETS = {
    jogos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv",
    equipas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv",
    jogadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv"
  };

  const loadCSV = url => new Promise(res =>
    Papa.parse(url,{download:true,header:true,complete:r=>res(r.data)})
  );

  const normalize = s => (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const safeNumber = val => { const n = Number(String(val||"0").replace(",",".").trim()); return isNaN(n)?0:n; };

  // Contar cartões apenas se o jogador estiver listado
  const countPlayerCards = (val, playerName) => {
    if(!val) return 0;
    let total = 0;
    String(val).split(",").forEach(entry=>{
      if(normalize(entry.trim()) === normalize(playerName)) total++;
    });
    return total;
  };

  // Carrega todas as sheets
  const [jogos, equipas, jogadores] = await Promise.all([
    loadCSV(SHEETS.jogos),
    loadCSV(SHEETS.equipas),
    loadCSV(SHEETS.jogadores)
  ]);

  const player = jogadores.find(p => normalize(p.Player) === normalize(PLAYER_NAME));
  if(!player) return;

  const teamKey = normalize(player.Team);
  const team = equipas.find(e => normalize(e.Team) === teamKey);


  // ==========================
// TEAMMATES (EXCLUI PLAYER)
// ==========================
const teammatesList = jogadores.filter(p => 
  normalize(p.Team) === teamKey &&
  normalize(p.Player) !== normalize(player.Player)
);

const teammatesContainer = document.querySelector(".teammates-carousel");

if(teammatesContainer){
  teammatesContainer.innerHTML = "";

  teammatesList.forEach(p => {
    const div = document.createElement("div");
    div.className = "teammates-player";

    div.innerHTML = `
      <a href="jogador.html?player=${encodeURIComponent(p.Player)}">
        <div class="teammates-player-img">
          <img src="assets/images/perfil_jogador/foto_topscore_x/${p.foto_topscore_x || 'placeholder.webp'}" alt="${p.Player}">
        </div>
        <div class="teammates-player-name">${p.Player}</div>
        <div class="teammates-player-role">${p.Apelido}</div>
      </a>
    `;

    teammatesContainer.appendChild(div);
  });
}


  // ==========================
// TEAMMATES (EXCLUI PLAYER)
// ==========================

  // ===== BANNER =====
  if(player && team){
    const teamFolder = team.Team.replace(/\s+/g,'_');
    const picture = document.querySelector(".bg-texture-container");
    const img = picture.querySelector("img");
    const sources = picture.querySelectorAll("source");

    sources[0].dataset.srcset = `assets/images/banner_players/${teamFolder}/1920.webp`;
    sources[1].dataset.srcset = `assets/images/banner_players/${teamFolder}/1200.webp`;
    sources[2].dataset.srcset = `assets/images/banner_players/${teamFolder}/800.webp`;
    img.dataset.src = `assets/images/banner_players/${teamFolder}/800.webp`;

    new IntersectionObserver((entries, observer)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          sources.forEach(s=>s.srcset=s.dataset.srcset);
          img.src = img.dataset.src;
          observer.disconnect();
        }
      });
    }).observe(picture);
  }

  // ===== HEADER =====
  document.querySelector(".player-number").textContent = player.Number;
  document.querySelector(".firstName").textContent = player.Player;
  document.querySelector(".lastName").textContent = player.Apelido;

  // Atualizar camisola
  const shirtName = document.querySelector(".shirt-name");
  const shirtNumber = document.querySelector(".shirt-number");

  if(shirtName) shirtName.textContent = player.Player;
  if(shirtNumber) shirtNumber.textContent = player.Number;


  document.querySelector(".player-position").textContent = player.Position;
  document.querySelector(".player-club").textContent = player.Team;

  const playerImg = document.querySelector(".player-photo img");
  playerImg.dataset.src = `assets/images/perfil_jogador/foto_perfil_banner/${PLAYER_NAME}.webp`;
  new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        playerImg.src = playerImg.dataset.src;
        obs.disconnect();
      }
    });
  }).observe(playerImg);

  if(team){
    const clubLogo = document.querySelector(".club-logo");
    clubLogo.dataset.src = `assets/images/team-logo/${team.Logopng}`;
    new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          clubLogo.src = clubLogo.dataset.src;
          obs.disconnect();
        }
      });
    }).observe(clubLogo);
  }

  // ===== FILTRAR JOGOS DO JOGADOR =====
  // ===== FILTRAR JOGOS DO JOGADOR (inclui jogos por realizar da sua equipa) =====
const playerGamesList = jogos.filter(j => {
  const isHomeTeam = normalize(j.HomeTeam) === teamKey;
  const isAwayTeam = normalize(j.AwayTeam) === teamKey;

  const playerInHome = j.PlayersHome && normalize(j.PlayersHome).split(",").map(n=>normalize(n.trim())).includes(normalize(player.Player));
  const playerInAway = j.PlayersAway && normalize(j.PlayersAway).split(",").map(n=>normalize(n.trim())).includes(normalize(player.Player));

  // Inclui jogo se:
  // 1) Jogador participou (presente na ficha)
  // 2) OU jogo por realizar da equipa do jogador (sem resultados ainda)
  if(playerInHome || playerInAway) return true; // jogador participou
  if((isHomeTeam || isAwayTeam) && (!j.HomeGoals || !j.AwayGoals || j.HomeGoals.trim()==="" || j.AwayGoals.trim()==="")) return true; // jogo por realizar da equipa
  return false; // caso contrário, não mostrar
});

  let wins=0, draws=0, defeats=0, goals=0, yellow=0, red=0, yellowRed=0;

  playerGamesList.forEach(j => {
    if(!j.HomeGoals || !j.AwayGoals || j.HomeGoals.trim()==="" || j.AwayGoals.trim()==="") return;

    const hg = safeNumber(j.HomeGoals);
    const ag = safeNumber(j.AwayGoals);
    const isHome = normalize(j.HomeTeam) === teamKey;

    if(hg === ag) draws++;
    else if((hg > ag && isHome) || (ag > hg && !isHome)) wins++;
    else defeats++;

    // Gols do jogador
    const processScorers = (str) => {
      if(!str) return 0;
      let total = 0;
      str.split(",").forEach(entry=>{
        const [name, qty] = entry.split(":");
        if(normalize(name) === normalize(player.Player)) total += Number(qty) || 1;
      });
      return total;
    };
    goals += processScorers(j.ScorersHome);
    goals += processScorers(j.ScorersAway);

    // Cartões do jogador
    yellow += countPlayerCards(isHome ? j.YellowsHome : j.YellowsAway, player.Player);
    red += countPlayerCards(isHome ? j.RedsHome : j.RedsAway, player.Player);
    yellowRed += countPlayerCards(isHome ? j["Yellow red Home"] : j["Yellow red Away"], player.Player);
  });

  const totalGames = playerGamesList.length;

  // ===== DONUT =====
  

  // ===== ATUALIZA ESTATS =====
  document.getElementById('height').textContent = player["Altura"] ?? 0;
  document.getElementById('preferredFoot').textContent = player["Pé preferido"] ?? 0;
  document.getElementById('games').textContent = totalGames;
  document.getElementById('wins').textContent = wins;
  document.getElementById('draws').textContent = draws;
  document.getElementById('defeats').textContent = defeats;
  document.getElementById('goals').textContent = goals ?? 0;
  document.getElementById('yellowCards').textContent = yellow ?? 0;
  document.getElementById('redCards').textContent = red ?? 0;
  // ===== BARRAS =====
  

  // ===== SLIDER DE JOGOS =====
  const track = document.querySelector(".mu-slider-track");
  track.innerHTML = "";

  playerGamesList.forEach(j => {
    const home = equipas.find(e=>normalize(e.Team)===normalize(j.HomeTeam));
    const away = equipas.find(e=>normalize(e.Team)===normalize(j.AwayTeam));
    const homeGoals = j.HomeGoals?.trim()!=="" ? safeNumber(j.HomeGoals) : null;
    const awayGoals = j.AwayGoals?.trim()!=="" ? safeNumber(j.AwayGoals) : null;
    const scoreDisplay = (() => {
  if(homeGoals!==null || awayGoals!==null) return `${homeGoals} - ${awayGoals}`;
  if(j["Time"]){
    const t = j["Time"].split(":");
    const hh = t[0].padStart(2,"0");
    const mm = t[1].padStart(2,"0");
    return `${hh}:${mm}`;
  }
  return "--:--";
})();

    const card = document.createElement("div");
    card.className = "mu-card";
    let displayInfo = "";
if(homeGoals !== null || awayGoals !== null){
  // Extrai dia e mês da string da Sheet
  const parts = j.Data.split("/"); // ["18","4","26"]
  if(parts.length >= 2){
    const day = parts[0].padStart(2,"0");
    const monthNum = parseInt(parts[1],10);
    const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    const month = monthNames[monthNum-1] || "";
    displayInfo = `Terminado, ${day} ${month}`;
  } else {
    displayInfo = "Terminado";
  }
} else {
  displayInfo = `${j.Data}, ${j["Local do jogo"]}`;
}

card.innerHTML = `
  <p class="info">${displayInfo}</p>
  <div class="score">
    <img data-src="assets/images/team-logo/${home?.Logopng||""}" alt=""/>
    <span>${scoreDisplay}</span>
    <img data-src="assets/images/team-logo/${away?.Logopng||""}" alt=""/>
  </div>
  <div class="teams"><span>${j.HomeTeam}</span><span>VS</span><span>${j.AwayTeam}</span></div>
`;
    track.appendChild(card);
  });

  // Lazy-load slider images
  const sliderImages = track.querySelectorAll("img[data-src]");
  const imgObserver = new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.src = entry.target.dataset.src;
        entry.target.removeAttribute("data-src");
        obs.unobserve(entry.target);
      }
    });
  }, {root: track, threshold: 0.1});
  sliderImages.forEach(img=>imgObserver.observe(img));

  // SLIDER NAV
  const btnPrev = document.querySelector(".mu-slider-btn.prev");
  const btnNext = document.querySelector(".mu-slider-btn.next");
  const STEP = 280;
  btnPrev.onclick = () => track.scrollBy({ left:-STEP, behavior:"smooth" });
  btnNext.onclick = () => track.scrollBy({ left: STEP, behavior:"smooth" });

  // DRAG & SWIPE
  let isDown=false, startX, scrollLeft;
  track.addEventListener("mousedown", e=>{ isDown=true; startX=e.pageX-track.offsetLeft; scrollLeft=track.scrollLeft; });
  track.addEventListener("mouseleave", ()=>{ isDown=false; });
  track.addEventListener("mouseup", ()=>{ isDown=false; });
  track.addEventListener("mousemove", e=>{ if(!isDown) return; e.preventDefault(); const x=e.pageX-track.offsetLeft; const walk=(x-startX)*1.5; track.scrollLeft=scrollLeft-walk; });
  track.addEventListener("touchstart", e=>{ isDown=true; startX=e.touches[0].pageX-track.offsetLeft; scrollLeft=track.scrollLeft; });
  track.addEventListener("touchend", ()=>{ isDown=false; });
  track.addEventListener("touchmove", e=>{ if(!isDown) return; const x=e.touches[0].pageX-track.offsetLeft; const walk=(x-startX)*1.5; track.scrollLeft=scrollLeft-walk; });

});





















const btnSeason = document.getElementById("btn-season");
const btnCareer = document.getElementById("btn-career");
const statsGrid = document.querySelector(".stats-grid");
const stats = document.querySelectorAll(".stats-grid .stat-item");

function showMainStats(){
  stats.forEach((el, i) => {
    el.style.display = i >= 2 ? "flex" : "none";
  });

  statsGrid.classList.remove("info-mode");
  statsGrid.classList.add("main-mode");
}

function showInfoStats(){
  stats.forEach((el, i) => {
    el.style.display = i < 2 ? "flex" : "none";
  });

  statsGrid.classList.remove("main-mode");
  statsGrid.classList.add("info-mode");
}

// default
showMainStats();

btnSeason.onclick = () => {
  showMainStats();
  btnSeason.classList.add("active");
  btnCareer.classList.remove("active");
};

btnCareer.onclick = () => {
  showInfoStats();
  btnCareer.classList.add("active");
  btnSeason.classList.remove("active");
};












// ==========================
// SLIDER TEAMMATES
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector('.teammates-carousel');
  const buttons = document.querySelectorAll('.teammates-nav-btn');

  if(buttons.length >= 2 && carousel){
    buttons[0].addEventListener('click', () => {
      carousel.scrollBy({ left:-300, behavior:'smooth' });
    });

    buttons[1].addEventListener('click', () => {
      carousel.scrollBy({ left:300, behavior:'smooth' });
    });
  }
});