/* =====================================================
   CONFIGURAÇÃO LOCAL
   ===================================================== */
const PATH_LOGOS = "assets/images/team-logo/";

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
   FORMATAÇÃO DE DATA/HORA
   ===================================================== */
function formatarData(dataStr, horaStr) {
  if (!dataStr) return "";
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  let dia, mes, ano;

  if (dataStr.includes("-")) [ano, mes, dia] = dataStr.split("-").map(Number);
  else if (dataStr.includes("/")) {
    [dia, mes, ano] = dataStr.split("/").map(Number);
    if (ano < 100) ano += 2000;
  }
  if (!dia || !mes || !ano) return dataStr;
  const mesFormatado = meses[mes-1] || dataStr;

  if (horaStr) {
    const [h,m] = horaStr.split(":");
    return `${dia} ${mesFormatado}, ${h.padStart(2,"0")}:${m.padStart(2,"0")}`;
  }
  return `${dia} ${mesFormatado}`;
}

function isHoje(dataStr) {
  if (!dataStr) return false;
  const hoje = new Date();
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  return hoje.getFullYear() === ano && (hoje.getMonth()+1) === mes && hoje.getDate() === dia;
}

function isLive(dataStr, horaStr) {
  if (!dataStr || !horaStr) return false;
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  const [hora, min] = horaStr.split(":").map(Number);
  const inicio = new Date(ano, mes-1, dia, hora, min);
  const agora = new Date();
  return agora >= inicio && agora <= new Date(inicio.getTime() + 2*60*60*1000);
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
   RENDER CARD DE JOGO
   ===================================================== */
function renderMatchCard(jogo, logos) {
  const home = jogo.HomeTeam || "";
  const away = jogo.AwayTeam || "";
  const logoCasa = logos[normalizeString(home)] || "default.svg";
const logoFora = logos[normalizeString(away)] || "default.svg";

  const status = (() => {
    if(jogo.HomeGoals && jogo.AwayGoals) return "Fim do jogo";
    if(isLive(jogo.Data, jogo.Time)) return "LIVE";
    if(isHoje(jogo.Data)) return "Hoje, " + (jogo.Time || "");
    return formatarData(jogo.Data, jogo.Time);
  })();

  const card = document.createElement("article");
  card.classList.add("match-card");
  if(!jogo.HomeGoals && !jogo.AwayGoals) card.classList.add("upcoming");

  card.dataset.home = home;
  card.dataset.away = away;

  card.innerHTML = `
    <div class="match-status">${status}</div>
    <div class="match-teams">
      <div class="team"><img src="${PATH_LOGOS}${logoCasa}" onerror="this.src='${PATH_LOGOS}default.svg'"><span>${home}</span></div>
      ${jogo.HomeGoals ? `<span class="score">${jogo.HomeGoals}</span>` : ""}
    </div>
    <div class="match-teams">
      <div class="team"><img src="${PATH_LOGOS}${logoFora}" onerror="this.src='${PATH_LOGOS}default.svg'"><span>${away}</span></div>
      ${jogo.AwayGoals ? `<span class="score">${jogo.AwayGoals}</span>` : ""}
    </div>
  `;

  return card;
}

/* =====================================================
   CARREGAR JOGOS
   ===================================================== */
async function carregarJogos() {
  const track = document.getElementById("matchesTrack");
  if(!track) return;

  const data = await loadJSON();
  if(!data) return;

  const jogos = data.ficha_jogo || [];
  const equipes = data.equipas || [];

  const logos = {};
equipes.forEach(eq => { 
  if(eq.Team && eq.Logopng) {
    logos[normalizeString(eq.Team)] = eq.Logopng.trim();
  }
});

  jogos.sort((a,b) => {
    const d1 = new Date(a.Data + "T" + (a.Time || "00:00"));
    const d2 = new Date(b.Data + "T" + (b.Time || "00:00"));
    return d1 - d2;
  });

  track.innerHTML = "";
  jogos.forEach(jogo => track.appendChild(renderMatchCard(jogo, logos)));

  iniciarSlider();
}

/* =====================================================
   SLIDER
   ===================================================== */
function iniciarSlider() {
  const track = document.getElementById("matchesTrack");
  const btnLeft = document.querySelector(".matches-arrow.left");
  const btnRight = document.querySelector(".matches-arrow.right");
  if(!track) return;

  let isDragging=false, startX=0, scrollStart=0;

  btnRight.addEventListener("click", ()=> track.scrollBy({left:320, behavior:"smooth"}));
  btnLeft.addEventListener("click", ()=> track.scrollBy({left:-320, behavior:"smooth"}));

  track.addEventListener("pointerdown", e=>{
    isDragging = true;
    startX = e.clientX;
    scrollStart = track.scrollLeft;
    track.classList.add("dragging");
    track.style.scrollBehavior = "auto";
    e.preventDefault();
  });

  window.addEventListener("pointermove", e=>{
    if(!isDragging) return;
    track.scrollLeft = scrollStart - (e.clientX - startX);
  });

  window.addEventListener("pointerup", ()=> {
    if(!isDragging) return;
    isDragging = false;
    track.classList.remove("dragging");
    track.style.scrollBehavior = "smooth";
  });

  track.addEventListener("wheel", e=>{
    if(Math.abs(e.deltaX) > Math.abs(e.deltaY)){
      e.preventDefault();
      track.scrollLeft += e.deltaX;
    }
  }, {passive:false});
}

/* =====================================================
   START
   ===================================================== */
window.addEventListener("DOMContentLoaded", carregarJogos);