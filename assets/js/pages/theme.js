// ===============================
// THEME.JS – HEADER / FOOTER / IDIOMA / LOGOS
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

  const headerEl = document.getElementById("header");
  const footerEl = document.getElementById("footer");

  // ===============================
  // DETECTAR IDIOMA
  // ===============================
  let lang = localStorage.getItem("siteLanguage") || "pt";
  const path = window.location.pathname;
  const isEnglishPage = /-en\.html$/.test(path);

  if(lang === "en" && !isEnglishPage){
    window.location.href = path.replace(".html","-en.html");
    return;
  }
  if(lang === "pt" && isEnglishPage){
    window.location.href = path.replace("-en.html",".html");
    return;
  }

  // ===============================
  // CARREGAR HEADER
  // ===============================
  const headerFile = lang === "en" ? "partials/header-en.html" : "partials/header.html";
  if(headerEl){
    try {
      const html = await fetch(headerFile).then(r => r.text());
      headerEl.innerHTML = html;
      initHeaderNav();
    } catch(err){
      console.error('Erro ao carregar header:', err);
    }
  }

  // ===============================
  // CARREGAR FOOTER
  // ===============================
  const footerFile = lang === "en" ? "partials/footer-en.html" : "partials/footer.html";
  if(footerEl){
    try {
      const html = await fetch(footerFile).then(r => r.text());
      footerEl.innerHTML = html;

      // Atualiza ano automático
      const year = footerEl.querySelector("#rioYear");
      if(year) year.textContent = new Date().getFullYear();

      // Inicializa dropdown idioma e tema
      initFooterDropdown();

      // Atualiza logos de acordo com o tema atual
      const currentTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      updateLogos(currentTheme);

    } catch(err){
      console.error('Erro ao carregar footer:', err);
    }
  }

  // ===============================
  // TRADUÇÕES DA PÁGINA (data-i18n)
  // ===============================
  const translations = {
    tabela_title: { pt: "Tabela", en: "Table" },
    jogos: { pt: "Jogos", en: "Matches" },
    ver_todos_jogos: { pt: "Ver todos Jogos", en: "View All Matches" }
  };

  function updatePageContent(){
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if(translations[key]){
        el.textContent = translations[key][lang];
      }
    });
  }

  updatePageContent();

});

// ===============================
// MENU HEADER
// ===============================
function initHeaderNav(){
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav');
  if(!navToggle || !navList) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navList.classList.toggle('show', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
    document.documentElement.classList.toggle('menu-open', !isOpen);
  });

  document.querySelectorAll('.has-submenu > a').forEach(link => {
    link.addEventListener('click', e => {
      if(window.innerWidth >= 880) return;
      e.preventDefault();
      link.parentElement.classList.toggle('open');
    });
  });

  window.addEventListener('resize', () => {
    if(window.innerWidth >= 880){
      document.querySelectorAll('.has-submenu').forEach(item => item.classList.remove('open'));
      navList.classList.remove('show');
      navToggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
    }
  });
}

// ===============================
// DROPDOWN IDIOMA + TEMA
// ===============================
function initFooterDropdown(){

  // IDIOMA
  const lang = localStorage.getItem("siteLanguage") || "pt";

  document.querySelectorAll("[data-language-select]").forEach(select => {
    const selected = select.querySelector(".select-selected");
    const options = select.querySelectorAll(".option");
    if(!selected) return;

    // Mostrar idioma atual
    selected.childNodes[0].nodeValue = lang === "en" ? "English" : "Português";

    // Criar seta se não existir
    if(!selected.querySelector(".arrow")){
      const arrow = document.createElement("span");
      arrow.classList.add("arrow");
      selected.appendChild(arrow);
    }

    // Abrir dropdown idioma
    selected.addEventListener("click", e => {
      e.stopPropagation();
      document.querySelectorAll("[data-language-select]").forEach(s => {
        if(s !== select) s.classList.remove("open");
      });
      select.classList.toggle("open");
    });

    // Selecionar idioma
    options.forEach(option => {
      option.addEventListener("click", () => {
        const langSelected = option.dataset.lang;
        select.classList.remove("open");
        changeLanguage(langSelected);
      });
    });
  });

  // TEMA (modo de visualização)
  const themeSelectEl = document.querySelector("[data-theme-select]");
  if(themeSelectEl){
    const selectedTheme = themeSelectEl.querySelector(".select-selected");
    const currentTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", currentTheme);
    if(selectedTheme) selectedTheme.innerHTML = (currentTheme === "dark" ? "Escuro" : "Claro") + '<span class="arrow"></span>';
  }

  // Fechar dropdown ao clicar fora
  document.addEventListener("click", () => {
    document.querySelectorAll("[data-language-select]").forEach(s => s.classList.remove("open"));
  });
}

// ===============================
// TROCAR IDIOMA
// ===============================
function changeLanguage(lang){
  const currentLang = localStorage.getItem("siteLanguage") || "pt";
  const path = window.location.pathname;
  if(currentLang === lang) return;

  localStorage.setItem("siteLanguage", lang);
  if(lang === "en"){
    if(!path.includes("-en.html")){
      window.location.href = path.replace(".html","-en.html");
    }
  } else {
    if(path.includes("-en.html")){
      window.location.href = path.replace("-en.html",".html");
    }
  }
}

// ===============================
// TROCAR LOGOS SEGUNDO TEMA
// ===============================
function updateLogos(theme){
  document.querySelectorAll('img[data-light][data-dark]').forEach(img => {
    const newSrc = theme === 'dark' ? img.dataset.dark : img.dataset.light;
    img.setAttribute('src', newSrc);
  });
}

// ===============================
// ALTERAR TEMA PELO DROPDOWN
// ===============================
document.addEventListener("click", (e) => {
  const option = e.target.closest(".option[data-theme]");
  if(!option) return;

  const theme = option.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  // Atualiza logos do header e footer
  updateLogos(theme);

  // Atualiza texto do dropdown
  const selectedTheme = document.querySelector("[data-theme-select] .select-selected");
  if(selectedTheme) selectedTheme.innerHTML = (theme === "dark" ? "Escuro" : "Claro") + '<span class="arrow"></span>';
});