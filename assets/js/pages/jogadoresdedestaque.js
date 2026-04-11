document.addEventListener("DOMContentLoaded", ()=>{

  const track = document.querySelector('.carousel-track');
  let isDown=false, startX, scrollLeft;

  // DRAG
  track.addEventListener('mousedown', e=>{
    isDown=true;
    startX=e.pageX - track.offsetLeft;
    scrollLeft=track.scrollLeft;
    document.body.style.userSelect="none";
  });

  document.addEventListener('mouseup', ()=>{
    isDown=false;
    document.body.style.userSelect="auto";
  });

  track.addEventListener('mousemove', e=>{
    if(!isDown) return;
    e.preventDefault();
    const x=e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x-startX);
  });

});

// Normalizar nome
function cleanName(s){
  return (s||"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9\s]/g,"")
    .replace(/\s+/g," ")
    .trim()
    .toLowerCase();
}

// Processa array ["Nome:2"]
function processScorers(arr){
  if(!arr || !Array.isArray(arr)) return [];

  return arr.map(e=>{
    const parts = e.split(":");
    const nome = cleanName(parts[0]?.trim());
    let golos = 1;

    if(parts.length > 1){
      const numero = parts[1].trim().replace(/[^\d]/g, "");
      if(numero !== "") golos = parseInt(numero,10);
    }

    return { name: nome, goals: golos };
  });
}

let ultimoRender = "";

async function updateTopScorers(){
  try{
    // 🔥 JSON LOCAL (SEM SHEETS)
    const res = await fetch("dados.json");
    const data = await res.json();

    const fichas = data.ficha_jogo || [];
    const jogadores = data.jogadores || [];

    const track = document.querySelector('.carousel-track');
    if(!track) return;

    const stats = {};

    // BASE JOGADORES
    jogadores.forEach(j=>{
      const rawName = j.Player || j.player || "";
      if(!rawName) return;

      const nameKey = cleanName(rawName);

      let dataNascimento = "";
      if(j.Age) dataNascimento = new Date(j.Age);

      stats[nameKey] = {
        gols: 0,
        apelido: j.Apelido || "",
        // 🔥 CORREÇÃO DAS IMAGENS (igual ao código que funciona)
        image: j.foto_topscore_x || `${rawName.replace(/\s+/g,'_')}.webp`,
        displayName: rawName,
        dataNascimento: dataNascimento
      };
    });

    // SOMAR GOLOS DOS JOGOS
    fichas.forEach(f=>{
      const lista = [
        ...processScorers(f.ScorersHome),
        ...processScorers(f.ScorersAway)
      ];

      lista.forEach(s=>{
        if(!s.name) return;

        if(!stats[s.name]){
          stats[s.name] = {
            gols: 0,
            apelido: "",
            image: `${s.name.replace(/\s+/g,'_')}.webp`,
            displayName: s.name,
            dataNascimento: ""
          };
        }

        stats[s.name].gols += s.goals;
      });
    });

    // ORDENAR TOP 10
    const top10 = Object.values(stats)
      .sort((a,b)=>{
        if(a.gols !== b.gols) return b.gols - a.gols;
        if(a.dataNascimento && b.dataNascimento){
          return a.dataNascimento - b.dataNascimento;
        }
        return 0;
      })
      .slice(0,10);

    // RENDER (VISUAL ORIGINAL INTACTO)
    // RENDER (VISUAL ORIGINAL INTACTO) + clique para página do jogador
const htmlFinal = top10.map(p => {
  return `
    <div class="player-shield" data-player="${encodeURIComponent(p.displayName)}">
      <div class="shield">
        <div class="player-name">
          <span>${p.displayName}</span>
          <strong>${p.apelido}</strong>
        </div>
        <div class="player-photo-wrap">
          <img src="assets/images/perfil_jogador/foto_topscore_x/${p.image}"
               onerror="this.onerror=null;this.src='assets/images/silhouette/silhouette_topscore-x.svg';">
        </div>
      </div>
    </div>
  `;
}).join("");

if (htmlFinal !== ultimoRender) {
  track.innerHTML = htmlFinal;
  ultimoRender = htmlFinal;

  // ===============================
  // CLIQUE NOS CARDS DOS JOGADORES
  // ===============================
  track.querySelectorAll(".player-shield").forEach(card => {
    let isDragging = false;

    // Mouse / Drag
    card.addEventListener("mousedown", () => { isDragging = false; });
    card.addEventListener("mousemove", () => { isDragging = true; });
    card.addEventListener("mouseup", () => {
      if (!isDragging) {
        const playerName = card.dataset.player;
        window.location.href = `jogador.html?player=${playerName}`;
      }
    });

    // Touch / Drag
    card.addEventListener("touchstart", () => { isDragging = false; });
    card.addEventListener("touchmove", () => { isDragging = true; });
    card.addEventListener("touchend", () => {
      if (!isDragging) {
        const playerName = card.dataset.player;
        window.location.href = `jogador.html?player=${playerName}`;
      }
    });

    // Cursor pointer
    card.style.cursor = "pointer";
  });
}

  }catch(e){
    console.error("Erro carregando marcadores:", e);
  }
}





// INIT
updateTopScorers();