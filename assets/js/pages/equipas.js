 // Cores oficiais de cada equipa inicio
const teamColors = {
  "Equipa 1": "#3E92CE",
  "Equipa 2": "#FFA500",
  "Equipa 3": "#014e96",
  "Equipa 4": "#5d7a82",
  "Equipa 5": "#213E76",
  "Equipa 6": "#DDAED7"
};
 // Cores oficiais de cada equipa fim

async function loadSponsors() {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1241588928&single=true&output=csv";

  const response = await fetch(url);
  const csvText = await response.text();

  const lines = csvText.split("\n").map(l => l.split(","));

  const headers = lines[0];
  const sponsorIndex = headers.indexOf("Sponsor");
  const teamIndex     = headers.indexOf("Equipa");
  const pictureIndex  = headers.indexOf("Picture");

  const sponsors = lines.slice(1).map(row => ({
    team: row[teamIndex],
    sponsorName: row[sponsorIndex],
    sponsorPic: row[pictureIndex]
  }));

  sponsors.forEach(s => {
    const container = document.querySelector(
      `.team-sponsor[data-team="${s.team}"]`
    );

    if (container) {
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
          <img src="${s.sponsorPic}" style="width:22px; height:22px; object-fit:contain; opacity:0.9;">
          <span style="font-size:14px; color:#444;">${s.sponsorName}</span>
        </div>
      `;
    }
  });
}

loadSponsors();




// Hover com cor da equipa inicio
// Hover com cor da equipa e texto branco temporário
document.querySelectorAll(".team-card").forEach(card => {
  const teamName = card.querySelector(".team-name").textContent.trim();
  const color = teamColors[teamName] || ""; // fallback cor da equipa

  card.addEventListener("mouseenter", () => {
    card.style.backgroundColor = color;
    // todo o texto branco enquanto o mouse estiver sobre o card
    card.querySelectorAll("*").forEach(el => el.style.color = "#fff");
    card.style.transition = "0.3s ease";
  });

  card.addEventListener("mouseleave", () => {
    card.style.backgroundColor = ""; // cor original do card
    // todo o texto volta à cor preta
    card.querySelectorAll("*").forEach(el => el.style.color = "var(--text)");
  });
});


// Hover com cor da equipa fim