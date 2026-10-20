(() => {
  "use strict";

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
