document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("a[href]").forEach(link => {

    link.addEventListener("click", (e) => {

      const href = link.getAttribute("href");

      // Ignorar links externos ou especiais
      if (
        link.target === "_blank" ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        link.hasAttribute("download")
      ) return;

      e.preventDefault();

      document.documentElement.classList.add("is-leaving");

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });

  });

});