document.addEventListener("DOMContentLoaded", () => {
// ---------------------------------------------------------
    // 1. OBSŁUGA HAMBURGER MENU (DLA WSZYSTKICH PODSTRON)
    // ---------------------------------------------------------
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navMenu = document.getElementById("nav-menu");

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
            navMenu.classList.toggle("open");
            hamburgerBtn.classList.toggle("open"); // <-- to utrzymuje stan 90 stopni
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