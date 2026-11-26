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
// 2. KARUZELA 23 PARKÓW, POGODA OPEN-METEO I MAPA LEAFLET (INDEX.HTML)
// ==========================================================================
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');

const detailImg = document.getElementById('detail-img');
const detailBadge = document.getElementById('detail-badge');
const detailTitle = document.getElementById('detail-title');
const detailMeta = document.getElementById('detail-meta');
const detailDesc = document.getElementById('detail-desc');
const weatherDataEl = document.getElementById('weather-data');
const mapContainer = document.getElementById('mapa');
const mapResetBtn = document.getElementById('map-reset-btn');

const etykietyStref = {
    gorskie: 'Park górski',
    pojezierne: 'Park pojezierny / nizinny',
    nadmorskie: 'Park nadmorski'
};

// Mapowanie kodów pogodowych WMO (Open-Meteo) na opisy po polsku
function opiszKodPogody(code) {
    if (code === 0) return 'Bezchmurnie';
    if (code >= 1 && code <= 3) return 'Częściowe zachmurzenie';
    if (code === 45 || code === 48) return 'Mgła';
    if (code >= 51 && code <= 57) return 'Mżawka';
    if (code >= 61 && code <= 67) return 'Opady deszczu';
    if (code >= 71 && code <= 77) return 'Opady śniegu';
    if (code >= 80 && code <= 82) return 'Przelotny deszcz';
    if (code === 85 || code === 86) return 'Przelotny śnieg';
    if (code >= 95 && code <= 99) return 'Burza';
    return 'Zmienne warunki';
}

if (carouselTrack) {
    // Obsługa przycisków strzałek karuzeli
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

    // ----------------------------------------------------------------------
    // Inicjalizacja mapy Leaflet przed pobraniem danych JSON (Krok 4)
    // ----------------------------------------------------------------------
    let mapa = null;
    const markeryParkow = new Map();
    const kafelkiKaruzeli = new Map();
    let aktywnyParkId = null;
    let numerZapytaniaPogody = 0;

    if (mapContainer && typeof L !== 'undefined') {
        mapa = L.map('mapa').setView([52.0, 19.0], 6);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(mapa);

        if (mapResetBtn) {
            mapResetBtn.addEventListener('click', () => {
                mapa.closePopup();
                mapa.setView([52.0, 19.0], 6);
            });
        }
    }

    // Tworzenie własnej ikony markera w zależności od strefy i stanu aktywności
    function utworzIkoneMarkera(kategoria, czyAktywny = false) {
        const klasaStrefy = ['gorskie', 'pojezierne', 'nadmorskie'].includes(kategoria)
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

    // Generowanie rozszerzonego okna informacyjnego markera (Krok 7 + zdjęcie)
    function zbudujTrescPopupu(park) {
        return `
            <div class="popup-card">
                <img class="popup-img" src="${park.zdjecie}" alt="${park.nazwa}" onerror="this.onerror=null; this.src='images/hero.jpg';">
                <strong class="popup-title">${park.nazwa}</strong>
                <div class="popup-meta">
                    <strong>Województwo:</strong> ${park.wojewodztwo}<br>
                    <strong>Siedziba:</strong> ${park.siedziba}<br>
                    <strong>Powierzchnia:</strong> ${park.powierzchnia}
                </div>
            </div>
        `;
    }

    // Pobieranie aktualnej pogody z API Open-Meteo dla współrzędnych parku
    async function pobierzPogode(park) {
        if (!weatherDataEl) return;

        const biezaceZapytanie = ++numerZapytaniaPogody;
        weatherDataEl.textContent = 'Pobieranie danych pogodowych...';

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${park.lat}&longitude=${park.lon}&current_weather=true`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            const data = await response.json();
            if (biezaceZapytanie !== numerZapytaniaPogody) return;

            if (data.current_weather) {
                const { temperature, windspeed, weathercode } = data.current_weather;
                const opis = opiszKodPogody(weathercode);
                weatherDataEl.textContent = `${temperature} °C • Wiatr: ${windspeed} km/h • ${opis}`;
            } else {
                weatherDataEl.textContent = 'Brak aktualnych danych pogodowych.';
            }
        } catch (error) {
            if (biezaceZapytanie !== numerZapytaniaPogody) return;
            weatherDataEl.textContent = 'Nie udało się pobrać pogody (sprawdź połączenie z internetem).';
            console.error('Błąd Open-Meteo:', error);
        }
    }

    // Podświetlenie wybranego markera na mapie oraz centrowanie (Kroki 5 i 6)
    function zaktualizujMarkerNaMapie(park, wycentrujMape = true) {
        if (!mapa) return;

        // Przywrócenie normalnego wyglądu poprzednio wybranego markera
        if (aktywnyParkId !== null && markeryParkow.has(aktywnyParkId)) {
            const poprzedni = markeryParkow.get(aktywnyParkId);
            poprzedni.marker.setIcon(utworzIkoneMarkera(poprzedni.park.kategoria, false));
            poprzedni.marker.setZIndexOffset(0);
        }

        // Wyróżnienie aktualnie wybranego markera
        if (markeryParkow.has(park.id)) {
            const aktualny = markeryParkow.get(park.id);
            aktualny.marker.setIcon(utworzIkoneMarkera(park.kategoria, true));
            aktualny.marker.setZIndexOffset(1000);

            if (wycentrujMape) {
                mapa.setView([park.lat, park.lon], 10);
                aktualny.marker.openPopup();
            }
        }

        aktywnyParkId = park.id;
    }

    // Aktualizacja panelu szczegółów, pogody oraz synchronizacja karuzeli i mapy
    function pokazSzczegolyParku(park, opcje = {}) {
        const { wycentrujMape = true, przewinKaruzela = false } = opcje;

        // Podświetlenie aktywnego kafelka w karuzeli
        document.querySelectorAll('.carousel-item').forEach(el => el.classList.remove('active'));
        const aktywnyKafelek = kafelkiKaruzeli.get(park.id);
        if (aktywnyKafelek) {
            aktywnyKafelek.classList.add('active');
            if (przewinKaruzela) {
                aktywnyKafelek.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }

        // Wypełnienie karty szczegółów parku
        detailImg.onerror = function () {
            this.onerror = null;
            this.src = 'images/hero.jpg';
        };
        detailImg.src = park.zdjecie;
        detailImg.alt = park.nazwa;

        const strefa = etykietyStref[park.kategoria] || park.kategoria;
        detailBadge.textContent = `#${park.id} • ${strefa}`;
        detailTitle.textContent = park.nazwa;
        detailMeta.textContent = `Województwo: ${park.wojewodztwo} | Siedziba: ${park.siedziba} | Powierzchnia: ${park.powierzchnia}`;
        detailDesc.textContent = park.opis;

        // Pobranie danych pogodowych i aktualizacja mapy
        pobierzPogode(park);
        zaktualizujMarkerNaMapie(park, wycentrujMape);
    }

    // Pobranie 23 parków z parki.json i wyrenderowanie karuzeli + markerów
    async function zaladujKaruzelaJSON() {
        try {
            const response = await fetch('parki.json');
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }
            const parki = await response.json();

            carouselTrack.innerHTML = '';

            parki.forEach(park => {
                // 1. Kafelek w karuzeli
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'carousel-item';
                item.innerHTML = `
                    <img src="${park.zdjecie}" alt="${park.nazwa}" loading="lazy" onerror="this.onerror=null; this.src='images/hero.jpg';">
                    <span class="carousel-item-title">${park.nazwa}</span>
                `;

                item.addEventListener('click', () => {
                    pokazSzczegolyParku(park, { wycentrujMape: true, przewinKaruzela: false });
                });

                carouselTrack.appendChild(item);
                kafelkiKaruzeli.set(park.id, item);

                // 2. Marker na mapie Leaflet (wszystkie 23 parki widoczne od startu)
                if (mapa && typeof park.lat === 'number' && typeof park.lon === 'number') {
                    const marker = L.marker([park.lat, park.lon], {
                        icon: utworzIkoneMarkera(park.kategoria, false)
                    })
                        .addTo(mapa)
                        .bindPopup(zbudujTrescPopupu(park));

                    marker.on('click', () => {
                        pokazSzczegolyParku(park, { wycentrujMape: true, przewinKaruzela: true });
                    });

                    markeryParkow.set(park.id, { marker, park });
                }
            });

            // Domyślnie wyświetl dane pierwszego parku, zostawiając widok mapy na całą Polskę
            if (parki.length > 0) {
                pokazSzczegolyParku(parki[0], { wycentrujMape: false, przewinKaruzela: false });
            }
        } catch (error) {
            carouselTrack.innerHTML = `<p class="error-msg">Nie udało się pobrać pliku <strong>parki.json</strong>. Uruchom projekt przez Live Server lub GitHub Pages.</p>`;
            console.error('Błąd karuzeli JSON:', error);
        }
    }

    zaladujKaruzelaJSON();
}