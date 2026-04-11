// assets/js/language.js

let currentLang = "pt"; // idioma padrão

async function loadLanguage(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    const translations = await res.json();

    // traduz textos
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[key]) el.textContent = translations[key];
    });

    // traduz atributos alt (ex: logos)
    document.querySelectorAll("[data-i18n-alt]").forEach(el => {
      const key = el.getAttribute("data-i18n-alt");
      if (translations[key]) el.alt = translations[key];
    });

  } catch(err) {
    console.error("Erro ao carregar idioma:", err);
  }
}

// função chamada após o footer ser injetado
function initLanguage() {
  // traduz com idioma atual
  loadLanguage(currentLang);

  // seleciona idioma ao clicar
  document.querySelectorAll(".footer-select .option").forEach(option => {
    option.addEventListener("click", () => {
      const lang = option.getAttribute("data-lang");
      if (!lang) return;

      currentLang = lang;
      loadLanguage(currentLang);

      // atualiza o select visual
      const selectContainer = option.closest(".custom-select");
      const selected = selectContainer.querySelector(".select-selected");
      selected.textContent = option.textContent + " ";
      const arrow = document.createElement("span");
      arrow.className = "arrow";
      selected.appendChild(arrow);
    });
  });
}