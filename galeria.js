// 1. Obsługa hamburger menu z obrotem 90° i płynnym rozwijaniem
const hamburgerBtn = document.getElementById('hamburger-btn');
const navCollapse = document.getElementById('nav-collapse');

if (hamburgerBtn && navCollapse) {
    hamburgerBtn.addEventListener('click', () => {
        const czyOtwarte = navCollapse.classList.toggle('open');
        hamburgerBtn.classList.toggle('open', czyOtwarte);
        hamburgerBtn.setAttribute('aria-expanded', String(czyOtwarte));
    });
}

// 2. Referencje do elementów galerii i przycisków filtrowania
const galleryGrid = document.getElementById('gallery-grid');
const filterButtons = document.querySelectorAll('.filter-btn');

// Referencje do okna modalnego (Lightbox)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxMeta = document.getElementById('lightbox-meta');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxClose = document.getElementById('lightbox-close');

let wszystkieParki = [];

const etykietyKategorii = {
    gorskie: 'Górski',
    pojezierne: 'Pojezierny / Nizinny',
    nadmorskie: 'Nadmorski'
};

// 3. Pobranie danych o parkach
async function zaladujDane() {
    try {
        const response = await fetch('parki.json');
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        wszystkieParki = await response.json();
        renderujGalerie(wszystkieParki);
    } catch (error) {
        galleryGrid.innerHTML = `<p class="error-msg">Nie udało się wczytać galerii parków.</p>`;
        console.error('Błąd ładowania danych:', error);
    }
}

// 4. Dynamiczne generowanie kart
function renderujGalerie(listaParkow) {
    galleryGrid.innerHTML = '';

    listaParkow.forEach(park => {
        const card = document.createElement('article');
        card.className = 'gallery-card';
        const etykieta = etykietyKategorii[park.kategoria] || park.kategoria;

        card.innerHTML = `
            <div class="gallery-img-wrapper">
                <img src="${park.zdjecie}" alt="${park.nazwa}" loading="lazy" onerror="this.onerror=null; this.src='images/hero.jpg';">
                <span class="gallery-badge">${etykieta}</span>
            </div>
            <div class="gallery-card-body">
                <h3>${park.nazwa}</h3>
                <p class="gallery-location">Woj. ${park.wojewodztwo} &bull; ${park.powierzchnia}</p>
                <button type="button" class="gallery-more-btn">Powiększ i zobacz opis &rarr;</button>
            </div>
        `;

        card.addEventListener('click', () => otworzLightbox(park));
        galleryGrid.appendChild(card);
    });
}

// 5. Obsługa filtrowania po strefach krajobrazowych
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const wybranaKategoria = btn.dataset.filter;
        if (wybranaKategoria === 'wszystkie') {
            renderujGalerie(wszystkieParki);
        } else {
            const przefiltrowane = wszystkieParki.filter(park => park.kategoria === wybranaKategoria);
            renderujGalerie(przefiltrowane);
        }
    });
});

// 6. Otwieranie i zamykanie podglądu powiększenia (Lightbox + blokada scrolla)
function otworzLightbox(park) {
    lightboxImg.onerror = function () {
        this.onerror = null;
        this.src = 'images/hero.jpg';
    };
    lightboxImg.src = park.zdjecie;
    lightboxImg.alt = park.nazwa;
    lightboxTitle.textContent = park.nazwa;
    lightboxMeta.textContent = `Województwo: ${park.wojewodztwo} | Siedziba: ${park.siedziba} | Powierzchnia: ${park.powierzchnia}`;
    lightboxDesc.textContent = park.opis;

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
}

function zamknijLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', zamknijLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            zamknijLightbox();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
        zamknijLightbox();
    }
});

zaladujDane();