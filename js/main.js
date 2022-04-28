mapboxgl.accessToken =
            'pk.eyJ1IjoibXVsbGVwZCIsImEiOiJjbDJhcXJ2eHcwN3lhM2tsaHY2OWJwaXM5In0.LkmFGu5dcDQA7Sf8XggggA';
        let map = new mapboxgl.Map({
            container: 'map', 
            style: 'mapbox://styles/mapbox/light-v10',
            zoom: 4, 
            center: [-101, 40]
        });

        map.on('load', () => { 

            map.addSource('covid_rates', { 
                type: 'geojson',
                data: 'assets/us-covid-2020-rates.json'
            });

            map.addLayer({
                'id': 'rates-layer',
                'type': 'fill', 
                'source': 'covid_rates',
                'paint': {
                    'fill-color': [
                        'step', 
                        ['get', 'rates'],
                        '#edf8fb',   // symbology
                        5,           // 1st class range: 0<=5

                        '#bfd3e6',   // symbology
                        14,          // 2nd class range: 5<=14

                        '#9ebcda',   // symbology
                        29,          // 3rd class range: 14<=29

                        '#8c96c6',   // symbology
                        60,          // 4th class range: 29<=60

                        '#8856a7',   // symbology
                        120,         // 5th class range: 60<=120

                        '#810f7c',   // symbology
                        500,         // 6th class range: 120<=500
                        '#980043'
                    ],
                    'fill-outline-color': '#BBBBBB',
                    'fill-opacity': 0.7,
                }
            });

            map.on('mousemove', ({point}) => {
                const county = map.queryRenderedFeatures(point, {
                    layers: ['rates-layer']
            });
            document.getElementById('text-description').innerHTML = county.length ?
                `<h3>${county[0].properties.county}</h3><p><strong><em>${county[0].properties.rates}</strong> Cases/Population</em></p>` :
                `<p>Map by Parker Mullen</p><p>Date: 4/26/2022</p><p>Data Sources: New York Times and US Census Bureau</p>`;
            });
        });

        const layers = [
            '0-5',
            '6-14',
            '15-29',
            '30-60',
            '61-120',
            '121-500',
            '500+'
        ];

        const colors = [
            '#edf8fb70',
            '#bfd3e670',
            '#9ebcda70',
            '#8c96c670',
            '#8856a770',
            '#810f7c70',
            '#98004370'
        ];

        const legend = document.getElementById('legend');
        legend.innerHTML = "<b>COVID Rates<br>(cases/population)</br></b>";

        layers.forEach((layer, i) => {
            const color = colors[i];
            const item = document.createElement('div');
            const key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;

            const value = document.createElement('span');
            value.innerHTML = `${layer}`;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        });
        const stops = [100, 500, 2000, 5000, 10000, 20000],
            radius = [1, 2, 3.5, 5, 6.5, 8],
            colors2 = ['rgb(237,248,233)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(49,163,84)', 'rgb(0,109,44)']

        map.on('load', () => {
            map.addSource('covid-cases', {
                type: 'geojson',
                data: 'assets/us-covid-2020-counts.json'
            });

            map.addLayer({
                    'id': 'cases-point',
                    'type': 'circle',
                    'source': 'covid-cases',
                    'minzoom': 3,
                    'paint': {
                        'circle-color': {
                            'property': 'cases',
                            'stops': [
                                [100, '#edf8e9'],
                                [500, '#c7e9c0'],
                                [2000, '#a1d99b'],
                                [5000, '#74c476'],
                                [10000, '#31a354'],
                                [20000, '#006d2c']
                            ]
                        },
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#636363',
                        'circle-opacity': 0.5,
                        'circle-radius': {
                            'property': 'cases',
                            'stops': [
                                [100, 1],
                                [500, 2],
                                [2000, 3.5],
                                [5000, 5],
                                [10000, 6.5],
                                [20000, 8]
                            ]
                        }
                    }
                }
            );

            map.on('click', 'cases-point', (event) => {
                new mapboxgl.Popup()
                    .setLngLat(event.features[0].geometry.coordinates)
                    .setHTML(`<strong>Total Cases:</strong> ${event.features[0].properties.cases}`)
                    .addTo(map);
            });
        });

        const layers2 = [
            '0-100',
            '101-500',
            '501-2000',
            '2001-5000',
            '5001-10000',
            '10001-20000'
        ]

        const legend = document.getElementById('legend');
        var labels = ['<strong>Total Cases by County</strong>'], vbreak;
        for (var i = 0; i < layers2.length; i++) {
            vbreak = layers2[i]
            dot_radius = 2 * radius[i];
            labels.push(
                `<p class="break"><i class="dot" style="background:${colors2[i]}; width: ${dot_radius}px; height: ${dot_radius}px; "></i> <span class="dot-label" style="top: ${dot_radius / 2}px;">${vbreak}</span></p>`);
        }

        const source =
            '<p style="text-align: right; font-size:10pt">Source: <a href="https://github.com/nytimes/covid-19-data/blob/43d32dde2f87bd4dafbb7d23f5d9e878124018b8/live/us-counties.csv">New York Times</a></p>';
        legend.innerHTML = labels.join('') + source;