const DEFAULT_SETTINGS = {
  enabled: true,
  contrast: "dark"
};

async function getSettings() {
  const stored = await browser.storage.local.get(["enabled", "contrast"]);
  return { ...DEFAULT_SETTINGS, ...stored };
}

async function setSettings(settings) {
  await browser.storage.local.set(settings);
}

browser.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-ghostmode") {
    const settings = await getSettings();
    settings.enabled = !settings.enabled;
    await setSettings(settings);

    const tabs = await browser.tabs.query({ url: ["*://*.docs.google.com/*"] });
    for (const tab of tabs) {
      browser.tabs.sendMessage(tab.id, {
        action: "updateStyles",
        enabled: settings.enabled,
        contrast: settings.contrast
      }).catch(() => {});
    }
  }
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "getSettings") {
    return getSettings();
  }

  if (message.action === "toggleEnabled") {
    return getSettings().then(async (settings) => {
      settings.enabled = !settings.enabled;
      await setSettings(settings);

      const tabs = await browser.tabs.query({ url: ["*://*.docs.google.com/*"] });
      for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id, {
          action: "updateStyles",
          enabled: settings.enabled,
          contrast: settings.contrast
        }).catch(() => {});
      }
      return settings;
    });
  }

  if (message.action === "setContrast") {
    const { contrast } = message;
    return getSettings().then(async (settings) => {
      settings.contrast = contrast;
      await setSettings(settings);

      const tabs = await browser.tabs.query({ url: ["*://*.docs.google.com/*"] });
      for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id, {
          action: "updateStyles",
          enabled: settings.enabled,
          contrast: contrast
        }).catch(() => {});
      }
      return settings;
    });
  }
});
