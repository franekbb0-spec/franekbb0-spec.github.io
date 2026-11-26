// ==========================================================================
// 1. OBSŁUGA HAMBURGER MENU Z OBROTEM 90° I PŁYNNYM ROZWIJANIEM (KAŻDA STRONA)
// ==========================================================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const navCollapse = document.getElementById('nav-collapse');

if (hamburgerBtn && navCollapse) {
    hamburgerBtn.addEventListener('click', () => {
        const czyOtwarte = navCollapse.classList.toggle('open');
        hamburgerBtn.classList.toggle('open', czyOtwarte);
        hamburgerBtn.setAttribute('aria-expanded', String(czyOtwarte));
    });
}

// ==========================================================================
// 2. KARUZELA, POGODA, MAPA I WYKRESY (INDEX.HTML)
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
const weatherForecastEl = document.getElementById('weather-forecast');
const mapContainer = document.getElementById('mapa');
const mapResetBtn = document.getElementById('map-reset-btn');

const wykresStatycznyCanvas = document.getElementById('wykresSlupkowy');
const wykresPowierzchniCanvas = document.getElementById('wykresPowierzchni');
const wykresTemperaturyCanvas = document.getElementById('wykresTemperatury');
const tempChartHeading = document.getElementById('temp-chart-heading');
const tempChartSubtitle = document.getElementById('temp-chart-subtitle');
const metricButtons = document.querySelectorAll('.chart-btn');
const sortButtons = document.querySelectorAll('.chart-sort-btn');

const etykietyStref = {
    gorskie: 'Park górski',
    pojezierne: 'Park pojezierny / nizinny',
    nadmorskie: 'Park nadmorski'
};

function formatujDzien(dataISO) {
    const dniTygodnia = [
        'Niedziela',
        'Poniedziałek',
        'Wtorek',
        'Środa',
        'Czwartek',
        'Piątek',
        'Sobota'
    ];
    const dataObj = new Date(`${dataISO}T12:00:00`);
    return `${dniTygodnia[dataObj.getDay()]} (${dataObj.toLocaleDateString('pl-PL')})`;
}

function opiszKodPogody(code) {
    if (code === 0) return 'Bezchmurnie';
    if (code >= 1 && code <= 3) return 'Częściowe zachmurzenie';
    if (code === 45 || code === 48) return 'Mgła';
    if (code >= 51 && code <= 57) return 'Mżawka';
    if (code >= 61 && code <= 67) return 'Opady deszczu';
    if (code >= 71 && code <= 77) return 'Opady śniegu';
    if (code >= 80 && code <= 82) return 'Przelotny deszcz';
    if (code >= 85 || code === 86) return 'Przelotny śnieg';
    if (code >= 95 && code <= 99) return 'Burza';
    return 'Zmienne warunki';
}

// --------------------------------------------------------------------------
// Statyczny wykres słupkowy horyzontalny
// --------------------------------------------------------------------------
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
    let wszystkieParki = [];
    let aktualnaKolejnoscWykresu = [];
    let aktywnyParkId = null;
    let aktywnaMetryka = 'powierzchnia_km';
    let aktywneSortowanie = 'alpha';
    let numerZapytaniaPogody = 0;

    let wykresJsonInstancja = null;
    let wykresTempInstancja = null;

    const markeryParkow = new Map();
    const kafelkiKaruzeli = new Map();

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

    // ----------------------------------------------------------------------
    // Wykres porównawczy parków
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
    // Wykres temperatury na najbliższe 24h dla wybranego parku
    // ----------------------------------------------------------------------
    function renderujWykresTemperatury(park, godziny, temperatury) {
        if (!wykresTemperaturyCanvas || typeof Chart === 'undefined') return;

        if (tempChartHeading) {
            tempChartHeading.textContent = `Prognoza temperatury (24h) – ${park.nazwa}`;
        }
        if (tempChartSubtitle) {
            tempChartSubtitle.textContent = `Współrzędne: ${park.lat.toFixed(3)}°N, ${park.lon.toFixed(3)}°E`;
        }

        if (wykresTempInstancja) {
            wykresTempInstancja.data.labels = godziny;
            wykresTempInstancja.data.datasets[0].data = temperatury;
            wykresTempInstancja.data.datasets[0].label = `Temperatura [°C] (${park.siedziba})`;
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
                        backgroundColor: 'rgba(46, 125, 50, 0.16)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.parsed.y} °C`
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Godzina'
                        },
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temperatura [°C]'
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

    async function pobierzPogode(park) {
        if (!weatherDataEl) return;

        const biezaceZapytanie = ++numerZapytaniaPogody;
        weatherDataEl.textContent = 'Ładowanie...';
        if (weatherForecastEl) {
            weatherForecastEl.innerHTML = '';
        }

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${park.lat}&longitude=${park.lon}&current_weather=true&hourly=temperature_2m&daily=temperature_2m_min,temperature_2m_max,precipitation_sum&forecast_days=3&timezone=Europe%2FWarsaw`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            const data = await response.json();
            if (biezaceZapytanie !== numerZapytaniaPogody) return;

            if (data.current_weather) {
                const { temperature, windspeed, weathercode, time } = data.current_weather;
                const opis = opiszKodPogody(weathercode);
                weatherDataEl.textContent = `${temperature} °C • Wiatr: ${windspeed} km/h • ${opis}`;

                if (weatherForecastEl && data.daily && Array.isArray(data.daily.time)) {
                    let wiersze = '';
                    for (let i = 0; i < Math.min(3, data.daily.time.length); i++) {
                        wiersze += `
                            <tr>
                                <td>${formatujDzien(data.daily.time[i])}</td>
                                <td>${data.daily.temperature_2m_min[i]} °C</td>
                                <td>${data.daily.temperature_2m_max[i]} °C</td>
                                <td>${data.daily.precipitation_sum[i]} mm</td>
                            </tr>
                        `;
                    }
                    weatherForecastEl.innerHTML = `
                        <table>
                            <thead>
                                <tr>
                                    <th>Prognoza na 3 dni</th>
                                    <th>Min</th>
                                    <th>Max</th>
                                    <th>Opady</th>
                                </tr>
                            </thead>
                            <tbody>${wiersze}</tbody>
                        </table>
                    `;
                }

                if (data.hourly && Array.isArray(data.hourly.time) && Array.isArray(data.hourly.temperature_2m)) {
                    const biezacaGodzina = time ? time.slice(0, 13) : '';
                    let startIdx = data.hourly.time.findIndex(t => t.startsWith(biezacaGodzina));
                    if (startIdx < 0) startIdx = 0;

                    const godziny24h = data.hourly.time
                        .slice(startIdx, startIdx + 24)
                        .map(t => t.slice(11, 16));
                    const temp24h = data.hourly.temperature_2m.slice(startIdx, startIdx + 24);

                    renderujWykresTemperatury(park, godziny24h, temp24h);
                }
            } else {
                weatherDataEl.textContent = 'Brak aktualnych danych pogodowych.';
            }
        } catch (error) {
            if (biezaceZapytanie !== numerZapytaniaPogody) return;
            weatherDataEl.textContent = 'Nie udało się pobrać danych pogodowych.';
            if (tempChartSubtitle) {
                tempChartSubtitle.textContent = 'Nie udało się pobrać prognozy temperatury.';
            }
            console.error('Błąd pobierania pogody:', error);
        }
    }

    function zaktualizujMarkerNaMapie(park, wycentrujMape = true) {
        if (!mapa) return;

        if (aktywnyParkId !== null && markeryParkow.has(aktywnyParkId)) {
            const poprzedni = markeryParkow.get(aktywnyParkId);
            poprzedni.marker.setIcon(utworzIkoneMarkera(poprzedni.park.kategoria, false));
            poprzedni.marker.setZIndexOffset(0);
        }

        if (markeryParkow.has(park.id)) {
            const aktualny = markeryParkow.get(park.id);
            aktualny.marker.setIcon(utworzIkoneMarkera(park.kategoria, true));
            aktualny.marker.setZIndexOffset(1000);

            if (wycentrujMape) {
                mapa.setView([park.lat, park.lon], 10);
                aktualny.marker.openPopup();
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

        const strefa = etykietyStref[park.kategoria] || park.kategoria;
        detailBadge.textContent = `#${park.id} • ${strefa}`;
        detailTitle.textContent = park.nazwa;
        detailMeta.textContent = `Województwo: ${park.wojewodztwo} | Siedziba: ${park.siedziba} | Rok utworzenia: ${park.rok_utworzenia} | Powierzchnia: ${park.powierzchnia}`;
        detailDesc.textContent = park.opis;

        zaktualizujMarkerNaMapie(park, wycentrujMape);
        aktywnyParkId = park.id;
        zaktualizujPodswietlenieWykresu();
        pobierzPogode(park);
    }

    async function zaladujKaruzelaJSON() {
        try {
            const response = await fetch('parki.json');
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }
            wszystkieParki = await response.json();

            carouselTrack.innerHTML = '';

            wszystkieParki.forEach(park => {
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

            if (wszystkieParki.length > 0) {
                aktywnyParkId = wszystkieParki[0].id;
                renderujWykresJSON();
                pokazSzczegolyParku(wszystkieParki[0], { wycentrujMape: false, przewinKaruzela: false });
            }
        } catch (error) {
            carouselTrack.innerHTML = `<p class="error-msg">Nie udało się wczytać listy parków.</p>`;
            console.error('Błąd ładowania danych:', error);
        }
    }

    zaladujKaruzelaJSON();
}