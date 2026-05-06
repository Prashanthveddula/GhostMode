const DEFAULT_SETTINGS = {
  enabled: true,
  contrast: "dark"
};

let settings = { ...DEFAULT_SETTINGS };

function getAppType() {
  const url = window.location.href;
  if (url.includes("spreadsheets")) return "sheets";
  if (url.includes("document")) return "docs";
  return null;
}

function buildContrastFilter(contrast) {
  if (contrast === "dark") return "invert(1) hue-rotate(180deg) brightness(1.1) contrast(0.9)";
  if (contrast === "darker") return "invert(1) hue-rotate(180deg) brightness(1) contrast(1)";
  if (contrast === "darkest") return "invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)";
  return "invert(1) hue-rotate(180deg)";
}

async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(["enabled", "contrast"]);
    settings = { ...DEFAULT_SETTINGS, ...stored };
    return settings;
  } catch (e) {
    return settings;
  }
}

function getCssFile(appType) {
  return appType === "sheets" ? "styles/sheets-dark.css" : "styles/docs-dark.css";
}

async function injectStyles() {
  const appType = getAppType();
  if (!appType) return;

  if (!settings.enabled) {
    removeStyles();
    return;
  }

  const filter = buildContrastFilter(settings.contrast);
  const cssFile = getCssFile(appType);

  let styleLink = document.getElementById("ghostmode-styles");
  if (!styleLink) {
    styleLink = document.createElement("link");
    styleLink.id = "ghostmode-styles";
    styleLink.rel = "stylesheet";
    styleLink.type = "text/css";
    document.documentElement.appendChild(styleLink);
  }
  
  styleLink.href = browser.runtime.getURL(cssFile);
  document.documentElement.style.setProperty("--ghostmode-filter", filter);
  document.documentElement.setAttribute("data-ghostmode-enabled", "true");
}

function removeStyles() {
  const existing = document.getElementById("ghostmode-styles");
  if (existing) existing.remove();
  document.documentElement.style.removeProperty("--ghostmode-filter");
  document.documentElement.removeAttribute("data-ghostmode-enabled");
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateStyles") {
    settings.enabled = message.enabled;
    settings.contrast = message.contrast;
    injectStyles();
    sendResponse({ success: true });
    return true;
  }

  if (message.action === "forceRefresh") {
    loadSettings().then(() => injectStyles());
    sendResponse({ success: true });
    return true;
  }
});

// Initialize
(async () => {
  await loadSettings();
  await injectStyles();
})();
