fetch("footer.html")
  .then(res => res.text())
  .then(html => {

    document.getElementById("footer-mount").innerHTML = html;

    initLanguageSelector(); // inicializa o seletor

  });