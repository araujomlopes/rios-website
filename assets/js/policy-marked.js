/**
 * Carrega arquivo Markdown e renderiza no container com marked.js
 * Mantém estilos antigos: h1, h2, listas, parágrafos, .red-underline, meta
 */
function loadPolicyMarkdown(filename, containerId = "policy") {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(`markdown/${filename}.md`)
    .then(res => {
      if (!res.ok) throw new Error("Arquivo Markdown não encontrado");
      return res.text();
    })
    .then(md => {
      // Converte Markdown para HTML
      let html = marked.parse(md);

      // Formatação especial: [[Texto]] → .red-underline
      html = html.replace(/\[\[\s*(.+?)\s*\]\]/g, '<span class="red-underline">$1</span>');

      container.innerHTML = html;

      // Mantemos a lógica antiga para detectar "Last Updated" e adicionar classe .meta
      const ps = container.querySelectorAll("p");
      ps.forEach(p => {
        if (p.textContent.startsWith("Last Updated")) {
          p.classList.add("meta");
        }
      });
    })
    .catch(err => {
      container.innerHTML = "<p>Erro ao carregar o conteúdo.</p>";
      console.error(err);
    });
}