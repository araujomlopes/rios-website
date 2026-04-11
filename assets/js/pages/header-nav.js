// ===============================
// HEADER NAV JS – MENU PRINCIPAL E SUBMENU MOBILE
// ===============================

console.log('HEADER NAV JS CARREGADO');

// =======================================
// FUNÇÃO PARA INICIALIZAR MENU HEADER
// =======================================
function initHeaderNav() {

  // Seleciona botão toggle do menu e lista de navegação
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav');

  // Se algum dos elementos não existir, log de aviso e sai da função
  if (!navToggle || !navList) {
    console.warn('NAV ELEMENTOS NÃO ENCONTRADOS');
    return;
  }

  // ===============================
  // MENU PRINCIPAL – TOGGLE MOBILE
  // ===============================
  navToggle.addEventListener('click', () => {

    // Verifica se o menu está aberto
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';

    // Atualiza atributo aria-expanded
    navToggle.setAttribute('aria-expanded', String(!isOpen));

    // Alterna classe show para abrir/fechar menu
    navList.classList.toggle('show', !isOpen);

    // Alterna classes no body e html para controle visual do menu
    document.body.classList.toggle('menu-open', !isOpen);
    document.documentElement.classList.toggle('menu-open', !isOpen);
  });

  // ===============================
  // SUBMENU MOBILE
  // ===============================
  document.querySelectorAll('.has-submenu > a').forEach(link => {
    link.addEventListener('click', e => {

      // Só ativa em mobile (< 880px)
      if (window.innerWidth >= 880) return;

      e.preventDefault();

      // Alterna classe open no item pai para mostrar/ocultar submenu
      link.parentElement.classList.toggle('open');
    });
  });

  // ===============================
  // OPCIONAL: FECHAR SUBMENU AO REDIMENSIONAR
  // ===============================
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 880) {
      document.querySelectorAll('.has-submenu').forEach(item => {
        item.classList.remove('open');
      });

      navList.classList.remove('show');
      navToggle.setAttribute('aria-expanded', 'false');

      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
    }
  });

}

// =======================================
// CARREGAR HEADER VIA FETCH
// =======================================
document.addEventListener("DOMContentLoaded", function () {

  const path = window.location.pathname;

  // Define qual arquivo de header carregar dependendo da URL
  const headerFile = path.includes("-en.html")
    ? "partials/header-en.html"
    : "partials/header.html";

  // Fetch do header
  fetch(headerFile)
    .then(res => {
      if (!res.ok) throw new Error('Header não encontrado');
      return res.text();
    })
    .then(html => {

      // Insere o HTML do header no DOM
      document.getElementById("header").innerHTML = html;

      // Inicializa menu – 🔴 só depois do header estar no DOM
      initHeaderNav();
    })
    .catch(err => console.error('Erro ao carregar header:', err));

});