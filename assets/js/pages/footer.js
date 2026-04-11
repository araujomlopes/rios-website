document.addEventListener("DOMContentLoaded", function () {

  const path = window.location.pathname;

  const footerFile = path.includes("-en.html")
    ? "partials/footer-en.html"
    : "partials/footer.html";

  fetch(footerFile)
    .then(res => res.text())
    .then(html => {
      document.getElementById("footer").innerHTML = html;
    });

});