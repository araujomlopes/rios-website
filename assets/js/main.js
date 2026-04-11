document.addEventListener('DOMContentLoaded', () => {

  const mount = document.getElementById('footer');
  if (!mount) return;

  fetch('partials/footer.html')
    .then(res => {
      if (!res.ok) throw new Error('Footer não encontrado');
      return res.text();
    })
    .then(html => {
      mount.innerHTML = html;

      // Ano automático
      const year = mount.querySelector('#rioYear');
      if (year) {
        year.textContent = new Date().getFullYear();
      }
    })
    .catch(err => console.error('Erro ao carregar footer:', err));

});






// ===============================
// GLOBAL UI (Header / Nav) START
// ===============================

document.addEventListener('DOMContentLoaded', () => {

  // Inject header
  const headerSlot = document.getElementById('header');
  if (headerSlot) {
    fetch('partials/header.html')
      .then(res => res.text())
      .then(html => {
        headerSlot.innerHTML = html;
        initHeader();
      })
      .catch(err => console.error('Header load error', err));
  }

  function initHeader() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('show');
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

});

// ===============================
// GLOBAL UI (Header / Nav) END
// ===============================
















// ===============================
// FOOTER BOTTOM COPYRIGHT (FOOTER) START
// ===============================

document.addEventListener("click", function(e){

/* ABRIR DROPDOWN */

const selected = e.target.closest(".select-selected");

if(selected){

const select = selected.closest(".custom-select");

document.querySelectorAll(".custom-select").forEach(s=>{
if(s !== select){
s.classList.remove("open");
}
});

select.classList.toggle("open");

return;
}


/* ESCOLHER OPÇÃO */

const option = e.target.closest(".option");

if(option){

const select = option.closest(".custom-select");
const selectedBox = select.querySelector(".select-selected");

selectedBox.childNodes[0].nodeValue = option.textContent;

select.classList.remove("open");

return;

}


/* FECHAR AO CLICAR FORA */

document.querySelectorAll(".custom-select").forEach(select=>{
select.classList.remove("open");
});

});

// ===============================
// FOOTER BOTTOM COPYRIGHT (FOOTER) END
// ===============================



































// ===============================
// MAIN.JS – HEADER / FOOTER / IDIOMA
// ===============================

console.log('MAIN.JS CARREGADO');

document.addEventListener("DOMContentLoaded", async () => {

  const headerEl = document.getElementById("header");
  const footerEl = document.getElementById("footer");

  // ===============================
  // DETECTAR IDIOMA
  // ===============================
  let lang = localStorage.getItem("siteLanguage") || "pt";
  const path = window.location.pathname;
  const isEnglishPage = /-en\.html$/.test(path);

  // Redirecionar para página correta
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
  const headerFile = lang === "en"
    ? "partials/header-en.html"
    : "partials/header.html";

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
  const footerFile = lang === "en"
    ? "partials/footer-en.html"
    : "partials/footer.html";

  if(footerEl){

    try {

      const html = await fetch(footerFile).then(r => r.text());

      footerEl.innerHTML = html;

      // Atualiza ano automático
      const year = footerEl.querySelector("#rioYear");

      if(year) year.textContent = new Date().getFullYear();

      // Inicializa dropdown idioma
      initFooterDropdown();

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

      document.querySelectorAll('.has-submenu')
        .forEach(item => item.classList.remove('open'));

      navList.classList.remove('show');

      navToggle.setAttribute('aria-expanded','false');

      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');

    }

  });

}


// ===============================
// DROPDOWN IDIOMA
// ===============================
function initFooterDropdown(){

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

    // Abrir dropdown
    selected.addEventListener("click", e => {

      e.stopPropagation();

      document
        .querySelectorAll("[data-language-select]")
        .forEach(s => {

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

  // Fechar dropdown ao clicar fora
  document.addEventListener("click", () => {

    document
      .querySelectorAll("[data-language-select]")
      .forEach(s => s.classList.remove("open"));

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

  }

  else{

    if(path.includes("-en.html")){
      window.location.href = path.replace("-en.html",".html");
    }

  }

}



























