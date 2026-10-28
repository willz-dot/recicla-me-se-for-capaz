(() => {
  "use strict";

  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  const themeStorageKey = "recicla-me-theme";
  let savedTheme = "light";

  try {
    savedTheme = window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
  } catch {
    // The theme still works for this page view when storage is unavailable.
  }

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    themeButtons.forEach((button) => {
      const isDark = theme === "dark";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro");
      button.textContent = isDark ? "Modo claro" : "Modo escuro";
    });
  };

  applyTheme(savedTheme);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      try {
        window.localStorage.setItem(themeStorageKey, nextTheme);
      } catch {
        // Keep the selected theme active for this page view.
      }
    });
  });

  document.querySelectorAll(".mobile-nav").forEach((menu) => {
    const trigger = menu.querySelector("summary");
    const panel = menu.querySelector("nav");

    if (!trigger || !panel) return;

    const syncAccessibleName = () => {
      trigger.setAttribute("aria-label", menu.open ? "Fechar navegação principal" : "Abrir navegação principal");
    };

    // <details>/<summary> already provides Space, Enter and native disclosure behavior.
    syncAccessibleName();
    menu.addEventListener("toggle", syncAccessibleName);

    menu.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !menu.open) return;
      event.preventDefault();
      menu.open = false;
      trigger.focus();
    });

    panel.addEventListener("click", (event) => {
      if (event.target.closest("a")) menu.open = false;
    });
  });
})();
