document.addEventListener("DOMContentLoaded", async () => {
  const mainToggle = document.getElementById("main-toggle");
  const contrastBtns = document.querySelectorAll('.contrast-btn');

  const settings = await browser.runtime.sendMessage({ action: "getSettings" });

  mainToggle.checked = settings.enabled;
  updateContrastButtons(contrastBtns, settings.contrast);

  mainToggle.addEventListener("change", async () => {
    await browser.runtime.sendMessage({ action: "toggleEnabled" });
  });

  contrastBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      const level = btn.dataset.level;
      await browser.runtime.sendMessage({ action: "setContrast", contrast: level });
      updateContrastButtons(contrastBtns, level);
    });
  });

  function updateContrastButtons(buttons, activeLevel) {
    buttons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.level === activeLevel);
    });
  }
});
