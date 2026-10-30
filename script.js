document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------------------------------
    // 1. OBSŁUGA HAMBURGER MENU (DLA WSZYSTKICH PODSTRON)
    // ---------------------------------------------------------
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navMenu = document.getElementById("nav-menu");

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
            navMenu.classList.toggle("open");
        });
    }

    // ---------------------------------------------------------
    // 2. ĆWICZENIE 5 (ZADANIE 1): PRZEWIJANA LISTA PARKÓW
    // ---------------------------------------------------------
    const lista = document.querySelector("#lista");
    const przyciskDol = document.querySelector("#dol");
    const przyciskGora = document.querySelector("#gora");

    if (lista && przyciskDol && przyciskGora) {
        przyciskDol.addEventListener("click", () => {
            lista.scrollBy({
                top: 100,
                behavior: "smooth"
            });
        });

        przyciskGora.addEventListener("click", () => {
            lista.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // ---------------------------------------------------------
    // 3. ĆWICZENIE 5 (ZADANIE 2 + DODATKOWE): OKNO MODALNE
    // ---------------------------------------------------------
    const modal = document.querySelector("#modal");
    const openBtn = document.querySelector("#openModal");
    const closeBtn = document.querySelector("#closeModal");

    if (modal && openBtn && closeBtn) {
        // Otwieranie modala i blokowanie scrollowania strony
        openBtn.addEventListener("click", () => {
            modal.classList.add("show");
            document.body.classList.add("no-scroll");
        });

        // Zamykanie modala przyciskiem X
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("show");
            document.body.classList.remove("no-scroll");
        });

        // Zadanie dodatkowe: zamykanie po kliknięciu w przyciemnione tło
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("show");
                document.body.classList.remove("no-scroll");
            }
        });
    }
});