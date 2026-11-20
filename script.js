// ==========================================================================
// 1. OBSŁUGA HAMBURGER MENU (DZIAŁA NA KAŻDEJ PODSTRONIE)
// ==========================================================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');

if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });
}

// ==========================================================================
// 2. PRZESUWNA GALERIA 23 PARKÓW I PODGLĄD DANYCH JSON (INDEX.HTML)
// ==========================================================================
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');

const detailImg = document.getElementById('detail-img');
const detailBadge = document.getElementById('detail-badge');
const detailTitle = document.getElementById('detail-title');
const detailMeta = document.getElementById('detail-meta');
const detailDesc = document.getElementById('detail-desc');

const etykietyStref = {
    gorskie: 'Park górski',
    pojezierne: 'Park pojezierny / nizinny',
    nadmorskie: 'Park nadmorski'
};

if (carouselTrack) {
    // Obsługa przycisków strzałek (płynne przewijanie lewo/prawo)
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            carouselTrack.scrollBy({ left: -320, behavior: 'smooth' });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            carouselTrack.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }

    // Aktualizacja panelu szczegółów pod karuzelą
    function pokazSzczegolyParku(park, kliknietyElement) {
        document.querySelectorAll('.carousel-item').forEach(el => el.classList.remove('active'));
        if (kliknietyElement) {
            kliknietyElement.classList.add('active');
        }

        detailImg.onerror = function () {
            this.onerror = null;
            this.src = 'images/hero.jpg';
        };
        detailImg.src = park.zdjecie;
        detailImg.alt = park.nazwa;

        const strefa = etykietyStref[park.kategoria] || park.kategoria;
        detailBadge.textContent = `#${park.id} • ${strefa}`;
        detailTitle.textContent = park.nazwa;
        detailMeta.textContent = `Województwo: ${park.wojewodztwo} | Powierzchnia: ${park.powierzchnia}`;
        detailDesc.textContent = park.opis;
    }

    // Pobranie 23 parków z parki.json
    async function zaladujKaruzelaJSON() {
        try {
            const response = await fetch('parki.json');
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }
            const parki = await response.json();

            carouselTrack.innerHTML = '';

            parki.forEach((park, index) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'carousel-item';
                item.innerHTML = `
                    <img src="${park.zdjecie}" alt="${park.nazwa}" loading="lazy" onerror="this.onerror=null; this.src='images/hero.jpg';">
                    <span class="carousel-item-title">${park.nazwa}</span>
                `;

                item.addEventListener('click', () => pokazSzczegolyParku(park, item));
                carouselTrack.appendChild(item);

                // Domyślnie wyświetl dane pierwszego parku po załadowaniu strony
                if (index === 0) {
                    pokazSzczegolyParku(park, item);
                }
            });
        } catch (error) {
            carouselTrack.innerHTML = `<p class="error-msg">Nie udało się pobrać pliku <strong>parki.json</strong>. Uruchom projekt przez Live Server lub GitHub Pages.</p>`;
            console.error('Błąd karuzeli JSON:', error);
        }
    }

    zaladujKaruzelaJSON();
}