/* =====================================================
   Página: Melhores Marcadores
   Componente: RIOS Style Player Carousel
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector('.carousel-track');
  const btnLeft = document.querySelector('.carousel-btn.left');
  const btnRight = document.querySelector('.carousel-btn.right');

  if (track && btnLeft && btnRight) {
    const scrollAmount = 283;
    const smoothScrollBy = (el, dist) => el.scrollTo({ left: el.scrollLeft + dist, behavior: 'smooth' });

    btnLeft.addEventListener('click', () => smoothScrollBy(track, -scrollAmount));
    btnRight.addEventListener('click', () => smoothScrollBy(track, scrollAmount));

    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => { isDown = true; track.classList.add('dragging'); startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; });
    track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('dragging'); });
    track.addEventListener('mouseup', () => { isDown = false; track.classList.remove('dragging'); });
    track.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); const x = e.pageX - track.offsetLeft; const walk = x - startX; track.scrollLeft = scrollLeft - walk; });
  }
});


/* =====================================================
   Normalização de nomes
   ===================================================== */
function cleanName(s) {
  return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toLowerCase();
}


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
   TOP SCORERS CAROUSEL
   ===================================================== */
async function loadTopScorersCarousel() {
  try {

    const data = await loadJSON();
    if (!data) return;

    const fichas = data.ficha_jogo || [];
    const jogadores = data.jogadores || [];
    const equipas = data.equipas || [];

    const teamLogos = {};
    equipas.forEach(e => { if(e.Team && e.Logopng) teamLogos[cleanName(e.Team)] = e.Logopng; });

    const stats = {};
    jogadores.forEach(j => {
      const name = cleanName(j.Player);
      if(!name) return;
      stats[name] = {
        nameOriginal: j.Player,
        gols: 0,
        jogos: 0,
        team: j.Team||"",
        position: j.Position||"",
        image: j.foto_topscore_x || `${j.Player.replace(/\s+/g,'_')}.webp`
      };
    });

    function processScorers(arr){
      if(!arr || !Array.isArray(arr)) return [];
      return arr.map(e=>{
        const [n,q]=e.split(":");
        return { name: cleanName(n), goals: Number(q)||1 };
      });
    }

    function processPlayers(arr){
      if(!arr || !Array.isArray(arr)) return [];
      return arr.map(p=>cleanName(p));
    }

    fichas.forEach(f => {
      [...processScorers(f.ScorersHome), ...processScorers(f.ScorersAway)]
        .forEach(s => { if(stats[s.name]) stats[s.name].gols += s.goals; });

      const playersInMatch = [...processPlayers(f.PlayersHome), ...processPlayers(f.PlayersAway)];
      playersInMatch.forEach(p => { if(stats[p]) stats[p].jogos += 1; });
    });

    const top6 = Object.values(stats).sort((a,b)=>b.gols - a.gols).slice(0,6);
    const track = document.querySelector('.carousel-track');
    if(!track) return;

    track.innerHTML = top6.map(p => {
      const logo = teamLogos[cleanName(p.team)];
      return `
        <div class="player-card" data-player="${encodeURIComponent(p.nameOriginal)}">
          <div class="player-image-wrapper">
            <img class="player-photo"
                 src="assets/images/perfil_jogador/foto_topscore_x/${p.image}"
                 onerror="this.onerror=null;this.src='assets/images/silhouette/silhouette_topscore-x.svg';">
            <img class="team-logo"
                 src="assets/images/team-logo/${logo||'logo_default.svg'}"
                 alt="${p.team}">
          </div>
          <h3>${p.nameOriginal}</h3>
          <p class="position">${p.position||"-"}</p>
          <div class="stats">
            <div><span class="golos_estat">${p.gols}</span><strong>Golos</strong></div>
            <div><span class="golos_estat">${p.jogos}</span><strong>Jogos</strong></div>
          </div>
        </div>
      `;
    }).join("");

    // CLICK NO CARD (sem quebrar drag)
let moved = false;

track.addEventListener('mousedown', () => moved = false);
track.addEventListener('mousemove', () => moved = true);

track.querySelectorAll('.player-card').forEach(card => {
  card.addEventListener('click', () => {
    if (moved) return;
    const player = card.dataset.player;
    if (player) {
      window.location.href = `jogador.html?player=${player}`;
    }
  });
});

  } catch(err) {
    console.error("Erro carregando top scorers:", err);
  }
}

loadTopScorersCarousel();


/* =====================================================
   GRID OFICIAL DE MARCADORES
   ===================================================== */
async function updateOfficialGrid() {
  try {

    const data = await loadJSON();
    if (!data) return;

    const fichas = data.ficha_jogo || [];
    const jogadores = data.jogadores || [];
    const equipas = data.equipas || [];

    const teamLogos = {};
    equipas.forEach(e => { if(e.Team && e.Logopng) teamLogos[cleanName(e.Team)] = e.Logopng; });

    const stats = {};
    jogadores.forEach(j => {
      if(!j.Player) return;
      const name = cleanName(j.Player);
      stats[name] = {
        nameOriginal: j.Player,
        golos: 0,
        team: j.Team||"",
        position: j.Position||"",
        image: j.foto_top_score || `${j.Player.replace(/\s+/g,'_')}.webp`,
        jogos: 0
      };
    });

    function processScorers(arr){
      if(!arr || !Array.isArray(arr)) return [];
      return arr.map(e=>{
        const [n,q]=e.split(":");
        return { name: cleanName(n), goals: Number(q)||1 };
      });
    }

    function processPlayers(arr){
      if(!arr || !Array.isArray(arr)) return [];
      return arr.map(p=>cleanName(p));
    }

    fichas.forEach(f => {
      [...processScorers(f.ScorersHome), ...processScorers(f.ScorersAway)]
        .forEach(s => { if(stats[s.name]) stats[s.name].golos += s.goals; });

      const playersInMatch = [...processPlayers(f.PlayersHome), ...processPlayers(f.PlayersAway)];
      playersInMatch.forEach(p => { if(stats[p]) stats[p].jogos += 1; });
    });

    const grid = document.getElementById("official-grid");
    if(!grid) return;
    grid.innerHTML = "";

    Object.values(stats)
      .sort((a,b)=>b.golos-a.golos)
      .forEach(d => {
        const logo = teamLogos[cleanName(d.team)];
        const card = document.createElement("div");
card.className = "rider-card";
card.dataset.player = encodeURIComponent(d.nameOriginal);
        card.innerHTML = `
          <div class="rider-top">
            <div class="rider-content">
              <h3 class="rider-name">${d.nameOriginal}</h3>
              <div class="rider-meta">
                <img src="assets/images/team-logo/${logo||'logo_default.svg'}" class="flag">
                <span>${d.team} | ${d.position}</span>
              </div>
            </div>
            <div class="rider-right">
              <div class="rider-img">
                <img src="assets/images/perfil_jogador/foto_top_score/${d.image}"
                     onerror="this.onerror=null;this.src='assets/images/silhouette/silhouette_foto_top_score.svg';">
              </div>
              <span class="rider-number">${d.golos}</span>
            </div>
          </div>
        `;


        card.addEventListener("click", () => {
  const player = card.dataset.player;
  if (player) {
    window.location.href = `jogador.html?player=${player}`;
  }
});
        grid.appendChild(card);
      });

  } catch(err) {
    console.error("Erro grid oficial:", err);
  }
}

updateOfficialGrid();



