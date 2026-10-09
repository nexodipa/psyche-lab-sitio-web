const menuButton = document.querySelector("#menu-button");
const siteNav = document.querySelector("#site-nav");
const quoteForm = document.querySelector("#quote-form");
const formNote = document.querySelector("#form-note");
const languageSelect = document.querySelector("#language-select");

const translate = (key, lang = document.documentElement.lang || "es") => {
  if (lang === "es") return key;
  return window.PSYCHE_TRANSLATIONS?.[lang]?.[key] || window.PSYCHE_TRANSLATIONS?.en?.[key] || key;
};

const translatableAttributes = ["placeholder", "aria-label", "alt", "title", "content"];
const excludedTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
const attributeMemoryKey = (attr) => `original${attr.replace(/[^a-z0-9]/gi, "")}`;

const collectTextNodes = (root = document.body) => {
  const nodeFilter = window.NodeFilter || { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2 };
  const walker = document.createTreeWalker(root, nodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent.trim()) return nodeFilter.FILTER_REJECT;
      if (excludedTags.has(node.parentElement?.tagName) || node.parentElement?.closest('[translate="no"], [aria-hidden="true"]')) return nodeFilter.FILTER_REJECT;
      return nodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
};

const prepareTranslationMemory = () => {
  collectTextNodes().forEach((node) => {
    node.originalText = node.textContent;
    node.originalTrimmed = node.textContent.trim().replace(/\s+/g, " ");
  });

  document.querySelectorAll("*").forEach((element) => {
    translatableAttributes.forEach((attr) => {
      if (element.hasAttribute(attr)) {
        element.dataset[attributeMemoryKey(attr)] = element.getAttribute(attr);
      }
    });
  });
};

const applyLanguage = (lang) => {
  const activeLang = window.PSYCHE_LANGUAGES?.[lang] ? lang : "es";
  document.documentElement.lang = activeLang;
  document.documentElement.dir = window.PSYCHE_RTL?.includes(activeLang) ? "rtl" : "ltr";

  collectTextNodes().forEach((node) => {
    const original = node.originalTrimmed || node.textContent.trim().replace(/\s+/g, " ");
    const translated = translate(original, activeLang);
    const leading = node.originalText.match(/^\s*/)?.[0] || "";
    const trailing = node.originalText.match(/\s*$/)?.[0] || "";
    node.textContent = `${leading}${translated}${trailing}`;
  });

  document.querySelectorAll("*").forEach((element) => {
    translatableAttributes.forEach((attr) => {
      const original = element.dataset[attributeMemoryKey(attr)];
      if (original) element.setAttribute(attr, translate(original, activeLang));
    });
  });

  document.title = translate("Psyche Lab | Psicologia aplicada, apego y claridad personal", activeLang);
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute(
      "content",
      translate(
        "Psyche Lab ofrece psicoeducacion, claridad psicologica, analisis de patrones relacionales, recursos de apego, habitos y estructura interna.",
        activeLang
      )
    );
  }
  localStorage.setItem("psycheLabLanguage", activeLang);
  if (languageSelect) languageSelect.value = activeLang;
};

window.applyPsycheLanguage = applyLanguage;

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => siteNav.classList.remove("open"));
  });
}

prepareTranslationMemory();

if (languageSelect) {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  const savedLanguage = urlLanguage || localStorage.getItem("psycheLabLanguage") || "es";
  applyLanguage(savedLanguage);
  languageSelect.addEventListener("change", (event) => applyLanguage(event.target.value));
}

if (quoteForm) {
  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const lang = document.documentElement.lang || "es";
    const data = new FormData(quoteForm);
    const request = [
      translate("Solicitud para Psyche Lab", lang),
      "",
      `${translate("Nombre", lang)}: ${data.get("name") || ""}`,
      `${translate("Contacto", lang)}: ${data.get("contact") || ""}`,
      `${translate("Servicio", lang)}: ${data.get("service") || ""}`,
      `${translate("Formato preferido", lang)}: ${data.get("format") || ""}`,
      `${translate("Urgencia", lang)}: ${data.get("urgency") || ""}`,
      "",
      `${translate("Tema principal", lang)}:`,
      data.get("message") || "",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(request);
      formNote.textContent = translate("Solicitud copiada. Puedes pegarla en WhatsApp o correo.", lang);
    } catch (error) {
      formNote.textContent = translate("Solicitud preparada. Copiala manualmente desde los campos antes de enviar.", lang);
    }
  });
}
