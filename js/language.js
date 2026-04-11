async function changeLanguage(lang){

  const response = await fetch(`lang/${lang}.json`);
  const translations = await response.json();

  document.querySelectorAll("[data-i18n]").forEach(element => {

    const key = element.getAttribute("data-i18n");

    element.textContent = translations[key];

  });

  localStorage.setItem("language", lang);

}


document.addEventListener("DOMContentLoaded", () => {

  const savedLanguage = localStorage.getItem("language") || "pt";

  changeLanguage(savedLanguage);

});