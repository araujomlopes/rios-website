// ===============================
// WEATHER CONFIG (Maputo - 24 de Julho)
// ===============================
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=-25.9692&longitude=32.5732&current_weather=true&hourly=relativehumidity_2m";

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadWeather();
  setInterval(loadWeather, 600000); // 10 minutos
});

// ===============================
// FETCH WEATHER
// ===============================
async function loadWeather() {
  try {
    const res = await fetch(WEATHER_URL);

    if (!res.ok) throw new Error("Erro na API");

    const data = await res.json();

    updateWeatherUI(data);

  } catch (error) {
    console.error("Erro ao carregar clima:", error);
    // fallback silencioso (mantém -- no HTML)
  }
}

// ===============================
// UPDATE UI
// ===============================
function updateWeatherUI(data) {
  const temp = Math.round(data.current_weather.temperature);
  const code = data.current_weather.weathercode;

  // pegar humidade mais próxima da hora atual
  const humidity = getCurrentHumidity(data);

  // atualizar valores
  setText("weather-temp", temp + "°");
  setText("air-temp", temp + "°");
  setText("humidity", humidity + "%");

  // atualizar descrição + ícone
  const weather = getWeatherByCode(code);

  setText("weather-label", weather.label);
  setHTML("weather-icon", weather.icon);
}

// ===============================
// HELPERS
// ===============================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHTML(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

// ===============================
// HUMIDITY (hora atual)
// ===============================
function getCurrentHumidity(data) {
  try {
    const now = new Date();
    const hour = now.getHours();

    return data.hourly.relativehumidity_2m[hour] ?? "--";
  } catch {
    return "--";
  }
}

// ===============================
// WEATHER CODE → UI
// ===============================
function getWeatherByCode(code) {
  if (code === 0) {
    return {
      label: "Céu limpo",
      icon: sunIcon()
    };
  }

  if (code <= 3) {
    return {
      label: "Parci. nublado",
      icon: cloudIcon()
    };
  }

  if (code <= 67) {
    return {
      label: "Chuva",
      icon: rainIcon()
    };
  }

  return {
    label: "Nublado",
    icon: cloudIcon()
  };
}

// ===============================
// SVG ICONS
// ===============================
function sunIcon() {
  return `
    <svg width="22" height="22" viewBox="0 0 24 26" fill="none">
      <circle cx="12" cy="12" r="5" stroke="#1e85e6" stroke-width="1.6"/>
      <line x1="12" y1="1" x2="12" y2="4" stroke="#1e85e6" stroke-width="1.6"/>
      <line x1="12" y1="20" x2="12" y2="23" stroke="#1e85e6" stroke-width="1.6"/>
      <line x1="1" y1="12" x2="4" y2="12" stroke="#1e85e6" stroke-width="1.6"/>
      <line x1="20" y1="12" x2="23" y2="12" stroke="#1e85e6" stroke-width="1.6"/>
    </svg>
  `;
}

function cloudIcon() {
  return `
    <svg width="22" height="22" viewBox="0 0 24 26" fill="none">
      <path d="M5 15a4 4 0 1 1 1-7 5 5 0 0 1 9 2 3 3 0 1 1 1 5H5z"
        stroke="#1e85e6" stroke-width="1.6"/>
    </svg>
  `;
}

function rainIcon() {
  return `
    <svg width="22" height="22" viewBox="0 0 24 26" fill="none">
      <path d="M5 15a4 4 0 1 1 1-7 5 5 0 0 1 9 2 3 3 0 1 1 1 5H5z"
        stroke="#1e85e6" stroke-width="1.6"/>
      <line x1="8" y1="18" x2="8" y2="22" stroke="#1e85e6" stroke-width="1.6"/>
    </svg>
  `;
}