// build.js
import fs from 'fs';
import fetch from 'node-fetch';

// -----------------------------------------------------
// Função para converter CSV em JSON com suporte a listas
// -----------------------------------------------------
function parseCSV(csv, listCols = []) {
  const lines = csv.replace(/\r/g, "").split("\n").filter(l => l.trim() !== "");
  if (!lines.length) return [];

  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const obj = {};

    headers.forEach((h, i) => {
      let val = values[i] ? values[i].trim().replace(/^"|"$/g, "") : "";

      if (listCols.includes(h)) {
        val = val.split(/[;,]/).map(s => s.trim()).filter(s => s !== "");
      }

      obj[h] = val;
    });

    return obj;
  });
}

// ---------------------------------------------
// URLs das tuas Google Sheets
// ---------------------------------------------
const sheets = {
  ficha_jogo: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv",
  equipas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv",
  jogadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv",
  sponsors: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1241588928&single=true&output=csv",
  metadados: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=663120966&single=true&output=csv",
  capitulos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=693973353&single=true&output=csv",


  // RESTO
  disciplina_regras: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1931195741&single=true&output=csv",
  fases_competicao: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=633641637&single=true&output=csv",
  financeiro: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=524853342&single=true&output=csv",
  jornadas_planeadas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=145845616&single=true&output=csv"
};

const listColumnsBySheet = {
  ficha_jogo: ["ScorersHome","ScorersAway","AssistsHome","AssistsAway","PlayersHome","PlayersAway","YellowsHome","YellowsAway","RedsHome","RedsAway"]
};

async function main() {
  const finalData = {};

  for (let key in sheets) {
    try {
      console.log(`🔄 processando ${key}...`);
      const res = await fetch(sheets[key]);
      const text = await res.text();
      finalData[key] = parseCSV(text, listColumnsBySheet[key] || []);
    } catch (err) {
      console.error(`Erro ${key}: ${err.message}`);
      finalData[key] = [];
    }
  }

  // ===== NORMALIZAR OS JOGADORES =====
  finalData.jogadores = finalData.jogadores.map(j => ({
    ID: j.Player || "",
    Player: j.Player || "",
    Apelido: j.Apelido || "",
    Number: j.Number || "",
    Position: j.Position || "",
    Team: j.Team || "",
    foto_perfil: j.foto_perfil_banner || "",
    Goals: j.foto_topscore_x || "",
    // outros campos que quiseres manter...
  }));

  // ===== NORMALIZAR AS EQUIPAS =====
  finalData.equipas = finalData.equipas.map(e => ({
    Team: e.Team || "",
    City: e.City || "",
    Coach: e.Coach || "",
    Founded: e.Founded || "",
    Logopng: e.Logopng || "",
    background: e["background picture"] || ""
  }));

  fs.writeFileSync("dados.json", JSON.stringify(finalData, null, 2));
  console.log("✅ dados.json gerado e normalizado!");
}

main();