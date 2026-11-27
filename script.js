// ==========================================================================
// 1. WSPÓLNA NAWIGACJA: HAMBURGER MENU (90°), ZAMYKANIE POZA MENU I ESCAPE
// ==========================================================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const navCollapse = document.getElementById('nav-collapse');
const heroWrapper = document.querySelector('.hero-wrapper');

function zamknijMenuMobilne() {
    if (!hamburgerBtn || !navCollapse) return;
    navCollapse.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
}

if (hamburgerBtn && navCollapse) {
    hamburgerBtn.addEventListener('click', () => {
        const czyOtwarte = navCollapse.classList.toggle('open');
        hamburgerBtn.classList.toggle('open', czyOtwarte);
        hamburgerBtn.setAttribute('aria-expanded', String(czyOtwarte));
    });

    document.addEventListener('click', (e) => {
        if (!navCollapse.classList.contains('open')) return;
        const klikWewnatrz = heroWrapper
            ? heroWrapper.contains(e.target)
            : (navCollapse.contains(e.target) || hamburgerBtn.contains(e.target));
        if (!klikWewnatrz) {
            zamknijMenuMobilne();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navCollapse.classList.contains('open')) {
            zamknijMenuMobilne();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navCollapse.classList.contains('open')) {
            zamknijMenuMobilne();
        }
    }, { passive: true });
}

// ==========================================================================
// 2. PŁYNNE PRZYCIEMNIENIE SZKLANEGO MENU PO PRZYKLEJENIU DO GÓRY (DESKTOP)
// ==========================================================================
const mainNav = document.querySelector('nav.main-nav');
const heroHeader = document.querySelector('header.hero-header');

if (mainNav && heroHeader) {
    const aktualizujStanNav = () => {
        const rect = heroHeader.getBoundingClientRect();
        const navHeight = mainNav.offsetHeight || 64;
        mainNav.classList.toggle('is-stuck', rect.bottom <= navHeight + 2);
    };

    window.addEventListener('scroll', aktualizujStanNav, { passive: true });
    window.addEventListener('resize', aktualizujStanNav, { passive: true });
    aktualizujStanNav();
}

// ==========================================================================
// 3. PRZYCISK POWROTU NA GÓRĘ STRONY (DZIAŁA NA KAŻDEJ PODSTRONIE)
// ==========================================================================
function inicjalizujPrzyciskPowrotuNaGore() {
    if (document.getElementById('scroll-top-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'scroll-top-btn';
    btn.className = 'scroll-top-btn';
    btn.setAttribute('aria-label', 'Wróć na górę strony');
    btn.setAttribute('title', 'Wróć na górę');
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 19V5"></path>
            <path d="M5 12l7-7 7 7"></path>
        </svg>
    `;

    document.body.appendChild(btn);

    const aktualizujWidocznosc = () => {
        btn.classList.toggle('visible', window.scrollY > 300);
    };

    window.addEventListener('scroll', aktualizujWidocznosc, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    aktualizujWidocznosc();
}

inicjalizujPrzyciskPowrotuNaGore();

// ==========================================================================
// 4. FORMULARZ KONTAKTOWY Z INTEGRACJĄ WEB3FORMS (KONTAKT.HTML)
// ==========================================================================
const WEB3FORMS_ACCESS_KEY = 'TUTAJ_WKLEJ_SWOJ_KLUCZ_WEB3FORMS';

const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');

if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.submit-btn');
        const imie = document.getElementById('name')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const temat = document.getElementById('subject')?.value.trim() || '';
        const wiadomosc = document.getElementById('message')?.value.trim() || '';

        formFeedback.classList.remove('is-error');

        if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'TUTAJ_WKLEJ_SWOJ_KLUCZ_WEB3FORMS') {
            formFeedback.textContent = imie
                ? `Dziękujemy, ${imie}! Formularz zadziałał w trybie podglądu (wklej klucz Web3Forms w script.js, aby wysyłać realne maile).`
                : 'Formularz zadziałał w trybie podglądu.';
            contactForm.reset();
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Wysyłanie...';
        }
        formFeedback.textContent = 'Wysyłanie wiadomości...';

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    name: imie,
                    email: email,
                    subject: `[Parki Narodowe Polski] ${temat}`,
                    message: wiadomosc
                })
            });

            const wynik = await response.json();
            if (response.ok && wynik.success) {
                formFeedback.textContent = `Dziękujemy, ${imie}! Twoja wiadomość została pomyślnie wysłana.`;
                contactForm.reset();
            } else {
                throw new Error(wynik.message || 'Błąd wysyłki formularza');
            }
        } catch (error) {
            formFeedback.classList.add('is-error');
            formFeedback.textContent = 'Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.';
            console.error('Błąd Web3Forms:', error);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Wyślij wiadomość';
            }
        }
    });
}

// Wspólne etykiety i kolory stref krajobrazowych
const etykietyStrefPelne = {
    gorskie: 'Park górski',
    wyzynne: 'Park wyżynny',
    pojezierne: 'Park pojezierny / nizinny',
    nadmorskie: 'Park nadmorski'
};

const etykietyStrefKrotkie = {
    gorskie: 'Górski',
    wyzynne: 'Wyżynny',
    pojezierne: 'Pojezierny / Nizinny',
    nadmorskie: 'Nadmorski'
};

const etykietyPrzyciskowStref = {
    wszystkie: 'Wszystkie',
    gorskie: 'Górskie',
    wyzynne: 'Wyżynne',
    pojezierne: 'Pojezierne i nizinne',
    nadmorskie: 'Nadmorskie'
};

const koloryStref = {
    gorskie: '#6d4c41',
    wyzynne: '#d97706',
    pojezierne: '#2e7d32',
    nadmorskie: '#0277bd'
};

function aktualizujLicznikiPrzyciskow(przyciski, listaParkow) {
    przyciski.forEach(btn => {
        const klucz = btn.dataset.filter;
        const bazowaNazwa = etykietyPrzyciskowStref[klucz];
        if (!bazowaNazwa) return;
        const liczba = klucz === 'wszystkie'
            ? listaParkow.length
            : listaParkow.filter(p => p.kategoria === klucz).length;
        btn.textContent = `${bazowaNazwa} (${liczba})`;
    });
}

// Normalizacja nazwy parku do automatycznego dopasowywania GeoJSON (GDOŚ / OSM)
function normalizujNazweParku(tekst) {
    return String(tekst || '')
        .toLowerCase()
        .replace(/ł/g, 'l')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\bpark\s+narodowy\b/g, ' ')
        .replace(/\bpn\b/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function pobierzNazweZProperties(props) {
    if (!props || typeof props !== 'object') return '';

    const priorytetKluczy = [
        'nazwa',
        'name:pl',
        'name',
        'nazwa_obiektu',
        'nazwa_ob',
        'nazwa_pl',
        'park',
        'title',
        'label'
    ];

    const mapaKluczy = new Map(
        Object.keys(props).map(k => [k.toLowerCase(), k])
    );

    for (const szukany of priorytetKluczy) {
        const oryginalnyKlucz = mapaKluczy.get(szukany);
        if (oryginalnyKlucz && typeof props[oryginalnyKlucz] === 'string' && props[oryginalnyKlucz].trim()) {
            return props[oryginalnyKlucz].trim();
        }
    }

    return '';
}

// ==========================================================================
// 5. IKONY SVG I FORMATOWANIE DANYCH POGODOWYCH (WMO / OPEN-METEO)
// ==========================================================================
function formatujLiczbePL(wartosc, miejsca = 1) {
    if (typeof wartosc !== 'number' || Number.isNaN(wartosc)) return '–';
    return wartosc.toFixed(miejsca).replace('.', ',');
}

function opiszKodPogody(code) {
    if (code === 0) return 'Bezchmurnie';
    if (code === 1) return 'Przeważnie słonecznie';
    if (code === 2) return 'Częściowe zachmurzenie';
    if (code === 3) return 'Pochmurno';
    if (code === 45 || code === 48) return 'Mgła';
    if (code >= 51 && code <= 57) return 'Mżawka';
    if (code >= 61 && code <= 67) return 'Opady deszczu';
    if (code >= 71 && code <= 77) return 'Opady śniegu';
    if (code >= 80 && code <= 82) return 'Przelotny deszcz';
    if (code >= 85 || code === 86) return 'Przelotny śnieg';
    if (code >= 95 && code <= 99) return 'Burza';
    return 'Zmienne warunki';
}

function pobierzIkonePogodySVG(code, czyDzien = 1) {
    if (code === 0) {
        if (czyDzien === 0) {
            return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M31.5 29.5A12.5 12.5 0 0 1 18.5 11a12.5 12.5 0 1 0 17 17.5 12.3 12.3 0 0 1-4 1z" fill="#5c6bc0" stroke="#3949ab" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="33" cy="14" r="2" fill="#ffd54f"/>
                <circle cx="38" cy="20" r="1.4" fill="#ffe082"/>
            </svg>`;
        }
        return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="9.5" fill="#ffb300" stroke="#f57c00" stroke-width="2"/>
            <g stroke="#f9a825" stroke-width="2.6" stroke-linecap="round">
                <line x1="24" y1="6" x2="24" y2="10.5"/>
                <line x1="24" y1="37.5" x2="24" y2="42"/>
                <line x1="6" y1="24" x2="10.5" y2="24"/>
                <line x1="37.5" y1="24" x2="42" y2="24"/>
                <line x1="11.3" y1="11.3" x2="14.5" y2="14.5"/>
                <line x1="33.5" y1="33.5" x2="36.7" y2="36.7"/>
                <line x1="36.7" y1="11.3" x2="33.5" y2="14.5"/>
                <line x1="14.5" y1="33.5" x2="11.3" y2="36.7"/>
            </g>
        </svg>`;
    }

    if (code === 1 || code === 2) {
        const tloNieba = czyDzien === 0
            ? `<path d="M23 20a7.5 7.5 0 0 1-7-10.2 8 8 0 1 0 10.2 10.2A7.5 7.5 0 0 1 23 20z" fill="#5c6bc0"/>`
            : `<circle cx="19" cy="18" r="7" fill="#ffb300" stroke="#f57c00" stroke-width="1.6"/>
               <g stroke="#f9a825" stroke-width="2.1" stroke-linecap="round">
                   <line x1="19" y1="6.5" x2="19" y2="9"/>
                   <line x1="7.5" y1="18" x2="10" y2="18"/>
                   <line x1="10.9" y1="9.9" x2="12.7" y2="11.7"/>
                   <line x1="27.1" y1="9.9" x2="25.3" y2="11.7"/>
               </g>`;
        return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            ${tloNieba}
            <path d="M16 36h20a7 7 0 0 0 1.2-13.9A9.5 9.5 0 0 0 19 20.5a7.5 7.5 0 0 0-3 15.5z" fill="#e3f2fd" stroke="#78909c" stroke-width="2" stroke-linejoin="round"/>
        </svg>`;
    }

    if (code === 3) {
        return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M12 31h18a6 6 0 0 0 1-11.9 8 8 0 0 0-15.2-1.2A6.5 6.5 0 0 0 12 31z" fill="#cfd8dc" stroke="#78909c" stroke-width="1.8"/>
            <path d="M15 36h21a6.5 6.5 0 0 0 1.1-12.9A9 9 0 0 0 19.8 21a7 7 0 0 0-4.8 15z" fill="#eceff1" stroke="#607d8b" stroke-width="2" stroke-linejoin="round"/>
        </svg>`;
    }

    if (code === 45 || code === 48) {
        return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M13 27h22a6 6 0 0 0 1-11.9 8.5 8.5 0 0 0-16.3-1.6A6.5 6.5 0 0 0 13 27z" fill="#cfd8dc" stroke="#78909c" stroke-width="2" stroke-linejoin="round"/>
            <g stroke="#78909c" stroke-width="2.5" stroke-linecap="round">
                <line x1="10" y1="33" x2="36" y2="33"/>
                <line x1="14" y1="39" x2="38" y2="39"/>
            </g>
        </svg>`;
    }

    if (code >= 95 && code <= 99) {
        return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M13 28h22a6.5 6.5 0 0 0 1.1-12.9 9 9 0 0 0-17.2-1.8A7 7 0 0 0 13 28z" fill="#90a4ae" stroke="#455a64" stroke-width="2" stroke-linejoin="round"/>
            <polygon points="25,25 19,35 24,35 21.5,43 30,32 25,32" fill="#ffb300" stroke="#e65100" stroke-width="1.2" stroke-linejoin="round"/>
            <line x1="14" y1="33" x2="12" y2="38" stroke="#0288d1" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="34" y1="33" x2="32" y2="38" stroke="#0288d1" stroke-width="2.2" stroke-linecap="round"/>
        </svg>`;
    }

    if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
        return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M13 28h22a6.5 6.5 0 0 0 1.1-12.9 9 9 0 0 0-17.2-1.8A7 7 0 0 0 13 28z" fill="#e1f5fe" stroke="#607d8b" stroke-width="2" stroke-linejoin="round"/>
            <g fill="#0288d1">
                <circle cx="16" cy="35" r="2.2"/>
                <circle cx="24" cy="38" r="2.2"/>
                <circle cx="32" cy="35" r="2.2"/>
                <circle cx="20" cy="41" r="1.7"/>
                <circle cx="29" cy="41" r="1.7"/>
            </g>
        </svg>`;
    }

    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M13 28h22a6.5 6.5 0 0 0 1.1-12.9 9 9 0 0 0-17.2-1.8A7 7 0 0 0 13 28z" fill="#cfd8dc" stroke="#546e7a" stroke-width="2" stroke-linejoin="round"/>
            <g stroke="#0288d1" stroke-width="2.4" stroke-linecap="round">
                <line x1="17" y1="33" x2="14.5" y2="39.5"/>
                <line x1="25" y1="33" x2="22.5" y2="41"/>
                <line x1="33" y1="33" x2="30.5" y2="39.5"/>
            </g>
        </svg>`;
    }

    return `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M13 33h22a6.5 6.5 0 0 0 1.1-12.9 9 9 0 0 0-17.2-1.8A7 7 0 0 0 13 33z" fill="#eceff1" stroke="#607d8b" stroke-width="2" stroke-linejoin="round"/>
    </svg>`;
}

function formatujEtykieteDnia(dataISO, indeks) {
    const dniKrotkie = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const dataObj = new Date(`${dataISO}T12:00:00`);
    const dzien = String(dataObj.getDate()).padStart(2, '0');
    const miesiac = String(dataObj.getMonth() + 1).padStart(2, '0');

    let nazwa = dniKrotkie[dataObj.getDay()];
    if (indeks === 0) nazwa = 'Dziś';
    else if (indeks === 1) nazwa = 'Jutro';

    return { nazwa, dataKrotka: `${dzien}.${miesiac}` };
}

// ==========================================================================
// 6. STRONA GŁÓWNA: WYSZUKIWARKA, FILTRY, KARUZELA, POGODA, MAPA, WYKRESY
// ==========================================================================
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');

const parkSearchInput = document.getElementById('park-search');
const indexFilterButtons = document.querySelectorAll('.index-filter-btn');
const filterStatusEl = document.getElementById('filter-status');

const parkDetailsBox = document.getElementById('park-details-box');
const detailImg = document.getElementById('detail-img');
const detailBadge = document.getElementById('detail-badge');
const detailTitle = document.getElementById('detail-title');
const detailMeta = document.getElementById('detail-meta');
const detailDesc = document.getElementById('detail-desc');
const parkWeatherBox = document.getElementById('park-weather');
const mapContainer = document.getElementById('mapa');
const mapResetBtn = document.getElementById('map-reset-btn');

const wykresStatycznyCanvas = document.getElementById('wykresSlupkowy');
const wykresPowierzchniCanvas = document.getElementById('wykresPowierzchni');
const wykresTemperaturyCanvas = document.getElementById('wykresTemperatury');
const tempChartHeading = document.getElementById('temp-chart-heading');
const tempChartSubtitle = document.getElementById('temp-chart-subtitle');
const hourlyScrollEl = document.getElementById('hourly-chart-scroll');
const hourlyPrevBtn = document.getElementById('hourly-prev');
const hourlyNextBtn = document.getElementById('hourly-next');
const metricButtons = document.querySelectorAll('.chart-btn');
const sortButtons = document.querySelectorAll('.chart-sort-btn');

// Obsługa przewijania wykresu godzinowego (przyciski + przeciąganie myszą)
if (hourlyScrollEl) {
    if (hourlyPrevBtn) {
        hourlyPrevBtn.addEventListener('click', () => {
            hourlyScrollEl.scrollBy({ left: -240, behavior: 'smooth' });
        });
    }
    if (hourlyNextBtn) {
        hourlyNextBtn.addEventListener('click', () => {
            hourlyScrollEl.scrollBy({ left: 240, behavior: 'smooth' });
        });
    }

    let przeciaganie = false;
    let startX = 0;
    let startScrollLeft = 0;

    hourlyScrollEl.addEventListener('mousedown', (e) => {
        przeciaganie = true;
        startX = e.pageX - hourlyScrollEl.offsetLeft;
        startScrollLeft = hourlyScrollEl.scrollLeft;
        hourlyScrollEl.classList.add('is-dragging');
    });

    const zakonczPrzeciaganie = () => {
        przeciaganie = false;
        hourlyScrollEl.classList.remove('is-dragging');
    };

    hourlyScrollEl.addEventListener('mouseleave', zakonczPrzeciaganie);
    window.addEventListener('mouseup', zakonczPrzeciaganie);

    hourlyScrollEl.addEventListener('mousemove', (e) => {
        if (!przeciaganie) return;
        e.preventDefault();
        const x = e.pageX - hourlyScrollEl.offsetLeft;
        hourlyScrollEl.scrollLeft = startScrollLeft - (x - startX) * 1.2;
    });
}

// Statyczny wykres słupkowy horyzontalny
function inicjalizujWykresStatyczny() {
    if (!wykresStatycznyCanvas || typeof Chart === 'undefined') return;

    new Chart(wykresStatycznyCanvas, {
        type: 'bar',
        data: {
            labels: ['1955', '1965', '1975', '1990', '1996', '2001–2026'],
            datasets: [
                {
                    label: 'Liczba parków narodowych',
                    data: [5, 10, 13, 17, 22, 23],
                    backgroundColor: 'rgba(54, 162, 235, 0.72)',
                    borderColor: '#1565c0',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    suggestedMax: 25,
                    title: {
                        display: true,
                        text: 'Liczba parków'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Rok'
                    }
                }
            }
        }
    });
}

inicjalizujWykresStatyczny();

if (carouselTrack) {
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

    let mapa = null;
    let warstwaMarkerow = null;
    let warstwaGranic = null;
    let daneGeoJSON = null;

    let wszystkieParki = [];
    let przefiltrowaneParki = [];
    let aktualnaKolejnoscWykresu = [];
    let aktywnyParkId = null;
    let aktywnaStrefa = 'wszystkie';
    let aktywnaFraza = '';
    let aktywnaMetryka = 'powierzchnia_km';
    let aktywneSortowanie = 'alpha';
    let numerZapytaniaPogody = 0;

    let wykresJsonInstancja = null;
    let wykresTempInstancja = null;

    const parkiPoId = new Map();
    const parkiPoNazwieNorm = new Map();
    const markeryParkow = new Map();
    const poligonyParkow = new Map();
    const kafelkiKaruzeli = new Map();

    // Inicjalizacja mapy Leaflet z przełącznikiem podkładów (OSM + OpenTopoMap) i warstwą GeoJSON
    if (mapContainer && typeof L !== 'undefined') {
        mapa = L.map('mapa').setView([52.0, 19.0], 6);

        const warstwaOSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        });

        const warstwaTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: '&copy; OpenStreetMap, SRTM | Styl: &copy; OpenTopoMap'
        });

        warstwaOSM.addTo(mapa);

        warstwaMarkerow = L.layerGroup().addTo(mapa);
        warstwaGranic = L.layerGroup().addTo(mapa);

        L.control.layers(
            {
                'Mapa drogowa (OSM)': warstwaOSM,
                'Mapa topograficzna': warstwaTopo
            },
            {
                'Znaczniki parków': warstwaMarkerow,
                'Granice parków (GeoJSON)': warstwaGranic
            },
            { collapsed: true }
        ).addTo(mapa);

        if (mapResetBtn) {
            mapResetBtn.addEventListener('click', () => {
                mapa.closePopup();
                mapa.setView([52.0, 19.0], 6);
            });
        }
    }

    function utworzIkoneMarkera(kategoria, czyAktywny = false) {
        const klasaStrefy = ['gorskie', 'wyzynne', 'pojezierne', 'nadmorskie'].includes(kategoria)
            ? kategoria
            : 'pojezierne';
        const klasaAktywna = czyAktywny ? ' active' : '';

        return L.divIcon({
            className: 'custom-park-icon',
            html: `<div class="park-marker-pin ${klasaStrefy}${klasaAktywna}"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -14]
        });
    }

    function stylPoligonuGeoJSON(kategoria, czyAktywny = false) {
        if (czyAktywny) {
            return {
                color: '#e65100',
                weight: 3,
                fillColor: '#f9a825',
                fillOpacity: 0.36
            };
        }
        const kolor = koloryStref[kategoria] || '#2e7d32';
        return {
            color: kolor,
            weight: 2,
            fillColor: kolor,
            fillOpacity: 0.22
        };
    }

    function zbudujTrescPopupu(park) {
        return `
            <div class="popup-card">
                <img class="popup-img" src="${park.zdjecie}" alt="${park.nazwa}" onerror="this.onerror=null; this.src='images/hero.jpg';">
                <strong class="popup-title">${park.nazwa}</strong>
                <div class="popup-meta">
                    <strong>Województwo:</strong> ${park.wojewodztwo}<br>
                    <strong>Siedziba:</strong> ${park.siedziba}<br>
                    <strong>Rok utworzenia:</strong> ${park.rok_utworzenia}<br>
                    <strong>Powierzchnia:</strong> ${park.powierzchnia}
                </div>
            </div>
        `;
    }

    function dopasujParkDoFeature(feature) {
        const typGeometrii = feature?.geometry?.type;
        if (typGeometrii !== 'Polygon' && typGeometrii !== 'MultiPolygon') {
            return null;
        }

        const props = feature.properties || {};
        const surowaNazwa = pobierzNazweZProperties(props);

        if (surowaNazwa) {
            const znormalizowana = normalizujNazweParku(surowaNazwa);

            if (!znormalizowana || znormalizowana.includes('otulin')) {
                return null;
            }

            if (parkiPoNazwieNorm.has(znormalizowana)) {
                return parkiPoNazwieNorm.get(znormalizowana);
            }

            if (znormalizowana.length >= 5) {
                for (const [kluczNorm, park] of parkiPoNazwieNorm.entries()) {
                    if (znormalizowana.includes(kluczNorm) || kluczNorm.includes(znormalizowana)) {
                        return park;
                    }
                }
            }
        }

        if (Number.isInteger(props.id) && parkiPoId.has(props.id)) {
            return parkiPoId.get(props.id);
        }

        return null;
    }

    function renderujGraniceGeoJSON(widoczneIds) {
        if (!mapa || !warstwaGranic || !daneGeoJSON) return;

        warstwaGranic.clearLayers();
        poligonyParkow.clear();

        L.geoJSON(daneGeoJSON, {
            filter: (feature) => {
                const park = dopasujParkDoFeature(feature);
                return Boolean(park && widoczneIds.has(park.id));
            },
            style: (feature) => {
                const park = dopasujParkDoFeature(feature);
                if (!park) return {};
                return stylPoligonuGeoJSON(park.kategoria, park.id === aktywnyParkId);
            },
            onEachFeature: (feature, layer) => {
                const park = dopasujParkDoFeature(feature);
                if (!park) return;

                if (!poligonyParkow.has(park.id)) {
                    poligonyParkow.set(park.id, { layers: [], park });
                }
                poligonyParkow.get(park.id).layers.push(layer);

                layer.bindTooltip(park.nazwa, { sticky: true });
                layer.on('click', () => {
                    pokazSzczegolyParku(park, { wycentrujMape: true, przewinKaruzela: true });
                });
            }
        }).addTo(warstwaGranic);
    }

    // ----------------------------------------------------------------------
    // Filtrowanie i wyszukiwanie (synchronizuje karuzelę, markery i GeoJSON)
    // ----------------------------------------------------------------------
    function renderujWidokFiltrowany(dopasujWidokMapy = false) {
        const fraza = aktywnaFraza.trim().toLowerCase();

        przefiltrowaneParki = wszystkieParki.filter(park => {
            const pasujeStrefa = aktywnaStrefa === 'wszystkie' || park.kategoria === aktywnaStrefa;
            if (!pasujeStrefa) return false;
            if (!fraza) return true;
            const tekst = `${park.nazwa} ${park.wojewodztwo} ${park.siedziba}`.toLowerCase();
            return tekst.includes(fraza);
        });

        const widoczneIds = new Set(przefiltrowaneParki.map(p => p.id));

        if (filterStatusEl) {
            filterStatusEl.textContent = `Wyświetlono: ${przefiltrowaneParki.length} z ${wszystkieParki.length} parków`;
        }

        carouselTrack.innerHTML = '';
        kafelkiKaruzeli.clear();

        if (przefiltrowaneParki.length === 0) {
            carouselTrack.innerHTML = `
                <div class="empty-filter-box">
                    <p>Brak parków spełniających wpisane kryteria.</p>
                    <button type="button" id="clear-filters-btn">Wyczyść filtry</button>
                </div>
            `;
            const clearBtn = document.getElementById('clear-filters-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', zresetujFiltry);
            }
        } else {
            przefiltrowaneParki.forEach(park => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'carousel-item';
                if (park.id === aktywnyParkId) {
                    item.classList.add('active');
                }
                item.innerHTML = `
                    <img src="${park.zdjecie}" alt="${park.nazwa}" loading="lazy" onerror="this.onerror=null; this.src='images/hero.jpg';">
                    <span class="carousel-item-title">${park.nazwa}</span>
                `;

                item.addEventListener('click', () => {
                    pokazSzczegolyParku(park, { wycentrujMape: true, przewinKaruzela: false });
                });

                carouselTrack.appendChild(item);
                kafelkiKaruzeli.set(park.id, item);
            });
        }

        if (mapa && warstwaMarkerow) {
            warstwaMarkerow.clearLayers();
            const wspolrzedne = [];

            przefiltrowaneParki.forEach(park => {
                const wpis = markeryParkow.get(park.id);
                if (wpis) {
                    wpis.marker.setIcon(utworzIkoneMarkera(park.kategoria, park.id === aktywnyParkId));
                    wpis.marker.setZIndexOffset(park.id === aktywnyParkId ? 1000 : 0);
                    warstwaMarkerow.addLayer(wpis.marker);
                    wspolrzedne.push([park.lat, park.lon]);
                }
            });

            renderujGraniceGeoJSON(widoczneIds);

            if (dopasujWidokMapy) {
                if (aktywnaStrefa === 'wszystkie' && !fraza) {
                    mapa.closePopup();
                    mapa.setView([52.0, 19.0], 6);
                } else if (wspolrzedne.length === 1) {
                    mapa.setView(wspolrzedne[0], 10);
                } else if (wspolrzedne.length > 1) {
                    mapa.fitBounds(wspolrzedne, { padding: [40, 40], maxZoom: 9 });
                }
            }
        }
    }

    function zresetujFiltry() {
        aktywnaStrefa = 'wszystkie';
        aktywnaFraza = '';
        if (parkSearchInput) parkSearchInput.value = '';
        indexFilterButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.filter === 'wszystkie');
        });
        renderujWidokFiltrowany(true);
    }

    indexFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            indexFilterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aktywnaStrefa = btn.dataset.filter;
            renderujWidokFiltrowany(true);
        });
    });

    if (parkSearchInput) {
        parkSearchInput.addEventListener('input', (e) => {
            aktywnaFraza = e.target.value;
            renderujWidokFiltrowany(false);
        });
    }

    // ----------------------------------------------------------------------
    // Wykres porównawczy parków (Chart.js)
    // ----------------------------------------------------------------------
    function posortujParkiDoWykresu(lista) {
        const kopia = [...lista];
        if (aktywneSortowanie === 'desc') {
            kopia.sort((a, b) => b[aktywnaMetryka] - a[aktywnaMetryka]);
        } else if (aktywneSortowanie === 'asc') {
            kopia.sort((a, b) => a[aktywnaMetryka] - b[aktywnaMetryka]);
        } else {
            kopia.sort((a, b) => a.nazwa.localeCompare(b.nazwa, 'pl'));
        }
        return kopia;
    }

    function renderujWykresJSON() {
        if (!wykresPowierzchniCanvas || typeof Chart === 'undefined' || wszystkieParki.length === 0) {
            return;
        }

        aktualnaKolejnoscWykresu = posortujParkiDoWykresu(wszystkieParki);

        const nazwy = aktualnaKolejnoscWykresu.map(park => park.nazwa);
        const wartosci = aktualnaKolejnoscWykresu.map(park => park[aktywnaMetryka]);

        const czyRok = aktywnaMetryka === 'rok_utworzenia';
        const etykietaSerii = czyRok ? 'Rok utworzenia' : 'Powierzchnia [km²]';
        const tytulWykresu = czyRok
            ? 'Rok utworzenia parków narodowych w Polsce'
            : 'Powierzchnia parków narodowych w Polsce';
        const tytulOsiX = czyRok ? 'Rok utworzenia' : 'Powierzchnia [km²]';

        const koloryTla = aktualnaKolejnoscWykresu.map(park =>
            park.id === aktywnyParkId
                ? 'rgba(249, 168, 37, 0.9)'
                : 'rgba(46, 204, 113, 0.72)'
        );
        const koloryObramowania = aktualnaKolejnoscWykresu.map(park =>
            park.id === aktywnyParkId ? '#e65100' : 'darkgreen'
        );

        if (wykresJsonInstancja) {
            wykresJsonInstancja.destroy();
        }

        wykresJsonInstancja = new Chart(wykresPowierzchniCanvas, {
            type: 'bar',
            data: {
                labels: nazwy,
                datasets: [
                    {
                        label: etykietaSerii,
                        data: wartosci,
                        backgroundColor: koloryTla,
                        borderColor: koloryObramowania,
                        borderWidth: 1,
                        borderRadius: 3
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const indeks = elements[0].index;
                        const kliknietyPark = aktualnaKolejnoscWykresu[indeks];
                        if (kliknietyPark) {
                            if (!kafelkiKaruzeli.has(kliknietyPark.id)) {
                                zresetujFiltry();
                            }
                            pokazSzczegolyParku(kliknietyPark, {
                                wycentrujMape: true,
                                przewinKaruzela: true
                            });
                        }
                    }
                },
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                },
                plugins: {
                    title: {
                        display: true,
                        text: tytulWykresu,
                        font: {
                            size: 15
                        },
                        color: '#1b5e20'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const val = context.parsed.x;
                                return czyRok
                                    ? ` Rok utworzenia: ${val}`
                                    : ` Powierzchnia: ${val.toLocaleString('pl-PL')} km²`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: !czyRok,
                        min: czyRok ? 1920 : 0,
                        max: czyRok ? 2010 : undefined,
                        title: {
                            display: true,
                            text: tytulOsiX
                        }
                    },
                    y: {
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    function zaktualizujPodswietlenieWykresu() {
        if (!wykresJsonInstancja || aktualnaKolejnoscWykresu.length === 0) return;

        const dataset = wykresJsonInstancja.data.datasets[0];
        dataset.backgroundColor = aktualnaKolejnoscWykresu.map(park =>
            park.id === aktywnyParkId
                ? 'rgba(249, 168, 37, 0.9)'
                : 'rgba(46, 204, 113, 0.72)'
        );
        dataset.borderColor = aktualnaKolejnoscWykresu.map(park =>
            park.id === aktywnyParkId ? '#e65100' : 'darkgreen'
        );
        wykresJsonInstancja.update('none');
    }

    // ----------------------------------------------------------------------
    // Przesuwny wykres temperatury 24h (styl mobilny z wartościami nad krzywą)
    // ----------------------------------------------------------------------
    const etykietyTemperaturyPlugin = {
        id: 'etykietyTemperatury',
        afterDatasetsDraw(chart) {
            const { ctx, data } = chart;
            const meta = chart.getDatasetMeta(0);
            if (!meta || !meta.data) return;

            ctx.save();
            ctx.font = 'bold 11px Arial, Helvetica, sans-serif';
            ctx.fillStyle = '#1b5e20';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            meta.data.forEach((punkt, i) => {
                const wartosc = data.datasets[0].data[i];
                if (typeof wartosc !== 'number' || Number.isNaN(wartosc)) return;
                ctx.fillText(`${formatujLiczbePL(wartosc, 1)}°`, punkt.x, punkt.y - 8);
            });

            ctx.restore();
        }
    };

    function renderujWykresTemperatury(park, godziny, temperatury) {
        if (!wykresTemperaturyCanvas || typeof Chart === 'undefined' || temperatury.length === 0) return;

        if (tempChartHeading) {
            tempChartHeading.textContent = 'Prognoza godzinowa (24h)';
        }
        if (tempChartSubtitle) {
            tempChartSubtitle.textContent = `${park.siedziba} • Przesuń w bok`;
        }
        if (hourlyScrollEl) {
            hourlyScrollEl.scrollLeft = 0;
        }

        const minT = Math.min(...temperatury);
        const maxT = Math.max(...temperatury);
        const rozpietosc = Math.max(maxT - minT, 2);
        const yMin = Math.floor(minT - rozpietosc * 0.25);
        const yMax = Math.ceil(maxT + rozpietosc * 0.45);

        if (wykresTempInstancja) {
            wykresTempInstancja.data.labels = godziny;
            wykresTempInstancja.data.datasets[0].data = temperatury;
            wykresTempInstancja.data.datasets[0].label = `Temperatura [°C] (${park.siedziba})`;
            wykresTempInstancja.options.scales.y.min = yMin;
            wykresTempInstancja.options.scales.y.max = yMax;
            wykresTempInstancja.update();
            return;
        }

        wykresTempInstancja = new Chart(wykresTemperaturyCanvas, {
            type: 'line',
            data: {
                labels: godziny,
                datasets: [
                    {
                        label: `Temperatura [°C] (${park.siedziba})`,
                        data: temperatury,
                        borderColor: '#2e7d32',
                        borderWidth: 2.5,
                        backgroundColor: (context) => {
                            const { ctx, chartArea } = context.chart;
                            if (!chartArea) return 'rgba(46, 125, 50, 0.16)';
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(46, 125, 50, 0.28)');
                            gradient.addColorStop(1, 'rgba(46, 125, 50, 0.02)');
                            return gradient;
                        },
                        fill: true,
                        tension: 0.38,
                        pointRadius: 3.5,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#2e7d32',
                        pointBorderWidth: 2
                    }
                ]
            },
            plugins: [etykietyTemperaturyPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 22,
                        right: 18,
                        bottom: 2,
                        left: 18
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        displayColors: false,
                        callbacks: {
                            title: (items) => `Godzina ${items[0].label}`,
                            label: (context) => `Temperatura: ${formatujLiczbePL(context.parsed.y, 1)} °C`
                        }
                    }
                },
                scales: {
                    x: {
                        border: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(46, 125, 50, 0.08)',
                            drawTicks: false
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 0,
                            padding: 6,
                            color: '#455a64',
                            font: {
                                size: 11,
                                weight: 'bold'
                            }
                        }
                    },
                    y: {
                        min: yMin,
                        max: yMax,
                        border: {
                            display: false
                        },
                        ticks: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(46, 125, 50, 0.06)'
                        }
                    }
                }
            }
        });
    }

    metricButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            metricButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aktywnaMetryka = btn.dataset.metric;
            renderujWykresJSON();
        });
    });

    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sortButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aktywneSortowanie = btn.dataset.sort;
            renderujWykresJSON();
        });
    });

    // ----------------------------------------------------------------------
    // Nowoczesny widżet pogodowy (ikony SVG + kafelki 3-dniowej prognozy)
    // ----------------------------------------------------------------------
    function renderujKartePogody(data) {
        if (!parkWeatherBox) return;

        const cur = data.current;
        const daily = data.daily;

        const ikonaTeraz = pobierzIkonePogodySVG(cur.weather_code, cur.is_day);
        const opisTeraz = opiszKodPogody(cur.weather_code);
        const tempTeraz = formatujLiczbePL(cur.temperature_2m, 1);
        const tempOdcz = formatujLiczbePL(cur.apparent_temperature, 1);
        const wiatr = formatujLiczbePL(cur.wind_speed_10m, 1);
        const wilgotnosc = typeof cur.relative_humidity_2m === 'number'
            ? `${Math.round(cur.relative_humidity_2m)}%`
            : '–';

        let kafelkiDniHTML = '';

        if (daily && Array.isArray(daily.time) && daily.time.length > 0) {
            const liczbaDni = Math.min(3, daily.time.length);
            const mins = daily.temperature_2m_min.slice(0, liczbaDni);
            const maxs = daily.temperature_2m_max.slice(0, liczbaDni);
            const minAll = Math.min(...mins);
            const maxAll = Math.max(...maxs);
            const zakres = Math.max(maxAll - minAll, 1);

            for (let i = 0; i < liczbaDni; i++) {
                const { nazwa, dataKrotka } = formatujEtykieteDnia(daily.time[i], i);
                const kodDnia = Array.isArray(daily.weather_code) ? daily.weather_code[i] : cur.weather_code;
                const tMin = daily.temperature_2m_min[i];
                const tMax = daily.temperature_2m_max[i];
                const opady = daily.precipitation_sum[i] ?? 0;

                const leftPct = Math.max(0, ((tMin - minAll) / zakres) * 100);
                const widthPct = Math.max(14, ((tMax - tMin) / zakres) * 100);
                const clampedWidth = Math.min(100 - leftPct, widthPct);

                const czyPada = opady > 0;

                kafelkiDniHTML += `
                    <div class="weather-day-card" title="${opiszKodPogody(kodDnia)}">
                        <div class="weather-day-head">
                            <span class="weather-day-name">${nazwa}</span>
                            <span class="weather-day-date">${dataKrotka}</span>
                        </div>
                        <div class="weather-day-icon">
                            ${pobierzIkonePogodySVG(kodDnia, 1)}
                        </div>
                        <div class="weather-day-temps">
                            <span class="temp-max" title="Temperatura maksymalna">${formatujLiczbePL(tMax, 1)}°</span>
                            <span class="temp-min" title="Temperatura minimalna">${formatujLiczbePL(tMin, 1)}°</span>
                        </div>
                        <div class="weather-temp-bar" aria-hidden="true">
                            <span class="weather-temp-fill" style="left:${leftPct.toFixed(1)}%; width:${clampedWidth.toFixed(1)}%;"></span>
                        </div>
                        <span class="weather-day-rain${czyPada ? ' has-rain' : ''}" title="Suma opadów">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                            </svg>
                            ${formatujLiczbePL(opady, 1)} mm
                        </span>
                    </div>
                `;
            }
        }

        parkWeatherBox.innerHTML = `
            <div class="weather-now">
                <div class="weather-now-main">
                    <div class="weather-icon-lg">${ikonaTeraz}</div>
                    <div class="weather-now-temp-wrap">
                        <span class="weather-now-temp">${tempTeraz} °C</span>
                        <span class="weather-now-desc">${opisTeraz}</span>
                    </div>
                </div>
                <div class="weather-now-metrics">
                    <span class="weather-pill" title="Temperatura odczuwalna">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                        </svg>
                        Odczuwalna: <strong>${tempOdcz} °C</strong>
                    </span>
                    <span class="weather-pill" title="Prędkość wiatru">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
                        </svg>
                        Wiatr: <strong>${wiatr} km/h</strong>
                    </span>
                    <span class="weather-pill" title="Wilgotność względna">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                        </svg>
                        Wilgotność: <strong>${wilgotnosc}</strong>
                    </span>
                </div>
            </div>
            ${kafelkiDniHTML ? `<div class="weather-forecast-grid">${kafelkiDniHTML}</div>` : ''}
        `;
    }

    async function pobierzPogode(park) {
        if (!parkWeatherBox) return;

        const biezaceZapytanie = ++numerZapytaniaPogody;
        parkWeatherBox.innerHTML = `<div class="weather-loading">Pobieranie aktualnej pogody i prognozy...</div>`;
        if (tempChartSubtitle) {
            tempChartSubtitle.textContent = 'Ładowanie prognozy 24h...';
        }

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${park.lat}&longitude=${park.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m&daily=weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum&forecast_days=3&timezone=Europe%2FWarsaw`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            const data = await response.json();
            if (biezaceZapytanie !== numerZapytaniaPogody) return;

            if (data.current) {
                renderujKartePogody(data);

                if (data.hourly && Array.isArray(data.hourly.time) && Array.isArray(data.hourly.temperature_2m)) {
                    const biezacaGodzina = data.current.time ? data.current.time.slice(0, 13) : '';
                    let startIdx = data.hourly.time.findIndex(t => t.startsWith(biezacaGodzina));
                    if (startIdx < 0) startIdx = 0;

                    const godziny24h = data.hourly.time
                        .slice(startIdx, startIdx + 24)
                        .map(t => t.slice(11, 16));
                    const temp24h = data.hourly.temperature_2m.slice(startIdx, startIdx + 24);

                    renderujWykresTemperatury(park, godziny24h, temp24h);
                }
            } else {
                parkWeatherBox.innerHTML = `<div class="weather-error">Brak aktualnych danych pogodowych.</div>`;
                if (tempChartSubtitle) {
                    tempChartSubtitle.textContent = 'Brak danych godzinowych.';
                }
            }
        } catch (error) {
            if (biezaceZapytanie !== numerZapytaniaPogody) return;
            parkWeatherBox.innerHTML = `<div class="weather-error">Nie udało się pobrać danych pogodowych.</div>`;
            if (tempChartSubtitle) {
                tempChartSubtitle.textContent = 'Nie udało się pobrać prognozy.';
            }
            console.error('Błąd pobierania pogody:', error);
        }
    }

    function zaktualizujMarkerIGranice(park, wycentrujMape = true) {
        if (!mapa) return;

        if (aktywnyParkId !== null) {
            if (markeryParkow.has(aktywnyParkId)) {
                const poprzedni = markeryParkow.get(aktywnyParkId);
                poprzedni.marker.setIcon(utworzIkoneMarkera(poprzedni.park.kategoria, false));
                poprzedni.marker.setZIndexOffset(0);
            }
            if (poligonyParkow.has(aktywnyParkId)) {
                const poprzedniPoligon = poligonyParkow.get(aktywnyParkId);
                const stylNieaktywny = stylPoligonuGeoJSON(poprzedniPoligon.park.kategoria, false);
                poprzedniPoligon.layers.forEach(l => l.setStyle(stylNieaktywny));
            }
        }

        if (poligonyParkow.has(park.id)) {
            const aktualnyPoligon = poligonyParkow.get(park.id);
            const stylAktywny = stylPoligonuGeoJSON(park.kategoria, true);
            aktualnyPoligon.layers.forEach(l => {
                l.setStyle(stylAktywny);
                l.bringToFront();
            });
        }

        if (markeryParkow.has(park.id)) {
            const aktualny = markeryParkow.get(park.id);
            aktualny.marker.setIcon(utworzIkoneMarkera(park.kategoria, true));
            aktualny.marker.setZIndexOffset(1000);

            if (wycentrujMape) {
                mapa.setView([park.lat, park.lon], 10);
                if (warstwaMarkerow && warstwaMarkerow.hasLayer(aktualny.marker)) {
                    aktualny.marker.openPopup();
                }
            }
        }
    }

    function pokazSzczegolyParku(park, opcje = {}) {
        const { wycentrujMape = true, przewinKaruzela = false } = opcje;

        document.querySelectorAll('.carousel-item').forEach(el => el.classList.remove('active'));
        const aktywnyKafelek = kafelkiKaruzeli.get(park.id);
        if (aktywnyKafelek) {
            aktywnyKafelek.classList.add('active');
            if (przewinKaruzela) {
                aktywnyKafelek.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }

        detailImg.onerror = function () {
            this.onerror = null;
            this.src = 'images/hero.jpg';
        };
        detailImg.src = park.zdjecie;
        detailImg.alt = park.nazwa;

        const strefa = etykietyStrefPelne[park.kategoria] || park.kategoria;
        detailBadge.textContent = `#${park.id} • ${strefa}`;
        detailTitle.textContent = park.nazwa;
        detailMeta.textContent = `Województwo: ${park.wojewodztwo} | Siedziba: ${park.siedziba} | Rok utworzenia: ${park.rok_utworzenia} | Powierzchnia: ${park.powierzchnia}`;
        detailDesc.textContent = park.opis;

        zaktualizujMarkerIGranice(park, wycentrujMape);
        aktywnyParkId = park.id;
        zaktualizujPodswietlenieWykresu();
        pobierzPogode(park);
    }

    async function zaladujStroneGlowna() {
        try {
            const response = await fetch('parki.json');
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }
            wszystkieParki = await response.json();

            wszystkieParki.forEach(park => {
                parkiPoId.set(park.id, park);
                parkiPoNazwieNorm.set(normalizujNazweParku(park.nazwa), park);

                if (mapa && typeof park.lat === 'number' && typeof park.lon === 'number') {
                    const marker = L.marker([park.lat, park.lon], {
                        icon: utworzIkoneMarkera(park.kategoria, false)
                    }).bindPopup(zbudujTrescPopupu(park));

                    marker.on('click', () => {
                        pokazSzczegolyParku(park, { wycentrujMape: true, przewinKaruzela: true });
                    });

                    markeryParkow.set(park.id, { marker, park });
                }
            });

            try {
                const geoResp = await fetch('granice-parkow.geojson');
                if (geoResp.ok) {
                    daneGeoJSON = await geoResp.json();
                }
            } catch (geoError) {
                console.warn('Nie wczytano warstwy granice-parkow.geojson:', geoError);
            }

            aktualizujLicznikiPrzyciskow(indexFilterButtons, wszystkieParki);

            const params = new URLSearchParams(window.location.search);
            const parkIdZAdresu = parseInt(params.get('park'), 10);
            const wybranyZAdresu = !Number.isNaN(parkIdZAdresu) ? parkiPoId.get(parkIdZAdresu) : null;

            const startowyPark = wybranyZAdresu || wszystkieParki[0];
            if (startowyPark) {
                aktywnyParkId = startowyPark.id;
                renderujWidokFiltrowany(false);
                renderujWykresJSON();
                pokazSzczegolyParku(startowyPark, {
                    wycentrujMape: Boolean(wybranyZAdresu),
                    przewinKaruzela: Boolean(wybranyZAdresu)
                });

                if (daneGeoJSON) {
                    const brakujace = wszystkieParki
                        .filter(p => !poligonyParkow.has(p.id))
                        .map(p => p.nazwa);
                    console.info(`GeoJSON: dopasowano granice dla ${poligonyParkow.size}/${wszystkieParki.length} parków.`);
                    if (brakujace.length > 0) {
                        console.warn('Brakujące granice w granice-parkow.geojson:', brakujace);
                    }
                }

                if (wybranyZAdresu && parkDetailsBox) {
                    setTimeout(() => {
                        parkDetailsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 180);
                }
            }
        } catch (error) {
            carouselTrack.innerHTML = `<p class="error-msg">Nie udało się wczytać listy parków.</p>`;
            console.error('Błąd ładowania danych:', error);
        }
    }

    zaladujStroneGlowna();
}

// ==========================================================================
// 7. PODSTRONA GALERIA: FILTROWANIE Z LICZNIKAMI + LIGHTBOX ZE STRZAŁKAMI
// ==========================================================================
const galleryGrid = document.getElementById('gallery-grid');

if (galleryGrid) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxMeta = document.getElementById('lightbox-meta');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxMapLink = document.getElementById('lightbox-map-link');

    let wszystkieParkiGalerii = [];
    let aktualnaListaGalerii = [];
    let aktualnyIndeksLightbox = 0;

    function wyswietlSlajdLightbox(indeks) {
        if (aktualnaListaGalerii.length === 0) return;

        const liczba = aktualnaListaGalerii.length;
        aktualnyIndeksLightbox = ((indeks % liczba) + liczba) % liczba;
        const park = aktualnaListaGalerii[aktualnyIndeksLightbox];

        lightboxImg.onerror = function () {
            this.onerror = null;
            this.src = 'images/hero.jpg';
        };
        lightboxImg.src = park.zdjecie;
        lightboxImg.alt = park.nazwa;
        lightboxTitle.textContent = park.nazwa;
        lightboxMeta.textContent = `Województwo: ${park.wojewodztwo} | Siedziba: ${park.siedziba} | Rok utworzenia: ${park.rok_utworzenia} | Powierzchnia: ${park.powierzchnia}`;
        lightboxDesc.textContent = park.opis;

        if (lightboxCounter) {
            lightboxCounter.textContent = `${aktualnyIndeksLightbox + 1} / ${liczba}`;
        }
        if (lightboxMapLink) {
            lightboxMapLink.href = `index.html?park=${park.id}`;
        }
        if (lightboxPrev && lightboxNext) {
            const ukryjStrzalki = liczba <= 1;
            lightboxPrev.classList.toggle('hidden', ukryjStrzalki);
            lightboxNext.classList.toggle('hidden', ukryjStrzalki);
        }
    }

    function otworzLightbox(indeks) {
        wyswietlSlajdLightbox(indeks);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function zamknijLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    function renderujGalerie(listaParkow) {
        aktualnaListaGalerii = listaParkow;
        galleryGrid.innerHTML = '';

        listaParkow.forEach((park, index) => {
            const card = document.createElement('article');
            card.className = 'gallery-card';
            const etykieta = etykietyStrefKrotkie[park.kategoria] || park.kategoria;

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

            card.addEventListener('click', () => otworzLightbox(index));
            galleryGrid.appendChild(card);
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const wybranaKategoria = btn.dataset.filter;
            if (wybranaKategoria === 'wszystkie') {
                renderujGalerie(wszystkieParkiGalerii);
            } else {
                const przefiltrowane = wszystkieParkiGalerii.filter(park => park.kategoria === wybranaKategoria);
                renderujGalerie(przefiltrowane);
            }
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', zamknijLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            wyswietlSlajdLightbox(aktualnyIndeksLightbox - 1);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            wyswietlSlajdLightbox(aktualnyIndeksLightbox + 1);
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                zamknijLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') {
            zamknijLightbox();
        } else if (e.key === 'ArrowLeft') {
            wyswietlSlajdLightbox(aktualnyIndeksLightbox - 1);
        } else if (e.key === 'ArrowRight') {
            wyswietlSlajdLightbox(aktualnyIndeksLightbox + 1);
        }
    });

    async function zaladujGalerie() {
        try {
            const response = await fetch('parki.json');
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }
            wszystkieParkiGalerii = await response.json();
            aktualizujLicznikiPrzyciskow(filterButtons, wszystkieParkiGalerii);
            renderujGalerie(wszystkieParkiGalerii);
        } catch (error) {
            galleryGrid.innerHTML = `<p class="error-msg">Nie udało się wczytać galerii parków.</p>`;
            console.error('Błąd ładowania galerii:', error);
        }
    }

    zaladujGalerie();
}