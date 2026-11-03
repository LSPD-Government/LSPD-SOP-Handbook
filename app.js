const content = document.getElementById("handbookContent");
const nav = document.getElementById("sectionNav");
const searchInput = document.getElementById("searchInput");
const sectionCount = document.getElementById("sectionCount");
const searchStatus = document.getElementById("searchStatus");
const noResults = document.getElementById("noResults");

function inline(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>");
}
function slug(text) { return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function renderMarkdown(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  let html = "", inList = false, listType = "", inTable = false, sectionIndex = 0;
  const closeList = () => { if (inList) { html += `</${listType}>`; inList = false; listType = ""; } };
  const closeTable = () => { if (inTable) { html += "</tbody></table>"; inTable = false; } };
  const closeBlocks = () => { closeList(); closeTable(); };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { closeBlocks(); continue; }
    if (/^# /.test(line)) {
      closeBlocks();
      const title = line.replace(/^# /, "").trim();
      if (sectionIndex > 0) html += "</div></article>";
      sectionIndex++;
      const id = slug(title) || `section-${sectionIndex}`;
      html += `<article class="sop-section" id="${id}" data-section="${inline(title)}"><h2>${inline(title)}</h2><div class="section-body">`;
      continue;
    }
    if (/^## /.test(line) || /^### /.test(line)) { closeBlocks(); html += `<h3>${inline(line.replace(/^#{2,3} /, ""))}</h3>`; continue; }
    if (/^\|/.test(line)) {
      closeList();
      const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
      if (/^[\s:|-]+$/.test(line.replace(/[|]/g, ""))) continue;
      if (!inTable) { inTable = true; html += "<table><thead><tr>" + cells.map(c => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>"; }
      else html += "<tr>" + cells.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>";
      continue;
    } else closeTable();
    const ul = /^\s*[-*]\s+/.test(line), ol = /^\s*\d+\.\s+/.test(line);
    if (ul || ol) {
      const wanted = ul ? "ul" : "ol";
      if (!inList || listType !== wanted) { closeList(); inList = true; listType = wanted; html += `<${wanted}>`; }
      html += `<li>${inline(line.replace(/^\s*(?:[-*]|\d+\.)\s+/, ""))}</li>`; continue;
    }
    closeList();
    if (/^---+$/.test(line.trim())) { html += "<hr>"; continue; }
    if (/^>/.test(line)) { html += `<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`; continue; }
    html += `<p>${inline(line.trim())}</p>`;
  }
  closeBlocks(); if (sectionIndex > 0) html += "</div></article>"; return html;
}
fetch("handbook.md").then(r => { if (!r.ok) throw new Error("Could not load handbook.md"); return r.text(); }).then(md => {
  content.innerHTML = renderMarkdown(md);
  const sections = [...content.querySelectorAll(".sop-section")];
  nav.innerHTML = sections.map(section => `<a href="#${section.id}" data-target="${section.id}">${section.querySelector("h2").textContent}</a>`).join("");
  sectionCount.textContent = `${sections.length} handbook sections`;
  if (!sections.length) content.innerHTML = "<p>Handbook content could not be organized. Check handbook.md formatting.</p>";
  const links = [...nav.querySelectorAll("a")];
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) links.forEach(a => a.classList.toggle("active", a.dataset.target === entry.target.id));
  }), { rootMargin: "-18% 0px -72% 0px" });
  sections.forEach(s => observer.observe(s));
  searchInput.addEventListener("input", applySearch); applySearch();
}).catch(err => {
  content.innerHTML = '<div class="loading-panel">The handbook could not be loaded. Make sure <b>handbook.md</b> is in the same folder as index.html.</div>';
  nav.innerHTML = '<div class="loading">Handbook index unavailable.</div>'; console.error(err);
});
function applySearch() {
  const query = searchInput.value.trim().toLowerCase(), sections = [...content.querySelectorAll(".sop-section")]; let shown = 0;
  sections.forEach(section => {
    const match = !query || section.textContent.toLowerCase().includes(query);
    section.classList.toggle("search-hidden", !match);
    const link = nav.querySelector(`[data-target="${section.id}"]`);
    if (link) link.classList.toggle("search-hidden", !match);
    if (match) shown++;
  });
  noResults.hidden = shown !== 0;
  searchStatus.textContent = query ? `Showing ${shown} of ${sections.length} sections matching “${searchInput.value.trim()}”.` : "";
}
document.getElementById("menuButton").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("menu-open");
  document.querySelector(".top-actions").classList.toggle("open");
});