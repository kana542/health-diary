import { eventBus } from '../core/EventBus.js';
import Chart from 'chart.js/auto';
import { DateUtils } from '../utils/DateUtils.js';

export class ImprovedChart {
    static chart = null;
    static entries = [];
    static currentMetric = 'weight';  // Oletusarvo on paino
    static currentYear = new Date().getFullYear();
    static currentMonth = new Date().getMonth();

    // Mielialojen määrittely numeroarvoiksi kaaviota varten
    static moodValues = {
        'Sad': 1,        // Surullinen
        'Tired': 2,      // Väsynyt
        'Neutral': 3,    // Neutraali
        'Satisfied': 4,  // Tyytyväinen
        'Happy': 5       // Iloinen
    };

    // Mielialojen nimet suomeksi
    static moodNames = {
        'Sad': 'Surullinen',
        'Tired': 'Väsynyt',
        'Neutral': 'Neutraali',
        'Satisfied': 'Tyytyväinen',
        'Happy': 'Iloinen'
    };

    static render() {
        return `
        <div class="chart">
            <h2>Terveyden seuranta</h2>
            <div class="chart-controls">
                <div class="control-group">
                    <label for="metric-select">Mittari</label>
                    <div class="select-wrapper">
                        <select id="metric-select" class="control-select">
                            <option value="weight">Paino (kg)</option>
                            <option value="sleep">Uni (tuntia)</option>
                            <option value="mood">Mieliala</option>
                        </select>
                        <box-icon name='chevron-down'></box-icon>
                    </div>
                </div>
            </div>

            <div class="chart-wrapper">
                <canvas id="mainChart"></canvas>
                <div id="no-data-message" class="no-data-message" style="display: none;">
                    Ei dataa saatavilla. Lisää merkintöjä kalenterista.
                </div>
            </div>
        </div>
        `;
    }

    static initialize() {
        // Aseta tapahtumankäsittelijä mittarivalinnalle
        this.setupControls();

        // Alusta kaavio
        this.setupChart();

        // Kuuntele kalenterin kuukauden muutoksia
        eventBus.subscribe('calendar:month-changed', (data) => {
            console.log("Chart: Kuukausi vaihtui", data.year, data.month);
            this.currentYear = data.year;
            this.currentMonth = data.month;
            this.entries = data.entries || [];
            this.updateChart();
        });
    }

    static setupControls() {
        // Mittarivalinnan käsittelijä
        const metricSelect = document.getElementById("metric-select");

        if (metricSelect) {
            // Aseta nykyinen valinta
            metricSelect.value = this.currentMetric;

            // Päivitä kaavio kun valinta muuttuu
            metricSelect.addEventListener("change", () => {
                this.currentMetric = metricSelect.value;
                this.updateChart();
            });
        }
    }

    static setupChart() {
        const ctx = document.getElementById('mainChart');
        const noDataMessage = document.getElementById('no-data-message');

        if (!ctx) return;

        // Piilota "ei dataa" -viesti aluksi
        if (noDataMessage) noDataMessage.style.display = 'none';

        // Luo Chart.js kaavio
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: this.getMetricLabel(this.currentMetric),
                    data: [],
                    borderColor: '#ff5869',
                    backgroundColor: 'rgba(255, 88, 105, 0.1)',
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#ff5869',
                    // Pienennetty datapisteiden koko
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                // Näytä päivämäärä muodossa "1. maaliskuuta 2025"
                                const index = tooltipItems[0].dataIndex;
                                const day = this.chartData?.days[index] || '';
                                return day;
                            },
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }

                                if (context.parsed.y !== null) {
                                    if (this.currentMetric === 'mood') {
                                        // Näytä mielialan nimi tooltipissä
                                        const moodValue = context.parsed.y;
                                        const moodKey = Object.keys(this.moodValues).find(
                                            key => this.moodValues[key] === moodValue
                                        );
                                        if (moodKey) {
                                            label += this.moodNames[moodKey];
                                        } else {
                                            label += moodValue;
                                        }
                                    } else {
                                        // Näytä arvo ja yksikkö
                                        const units = {
                                            sleep: 'h',
                                            weight: 'kg'
                                        };
                                        label += context.parsed.y + (units[this.currentMetric] || '');
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            },
                            color: '#777',
                            padding: 10,
                            callback: (value) => {
                                // Mukautettu tikkujen näyttö mielialalle
                                if (this.currentMetric === 'mood') {
                                    const moodKey = Object.keys(this.moodValues).find(
                                        key => this.moodValues[key] === value
                                    );
                                    return moodKey ? this.moodNames[moodKey] : value;
                                }
                                return value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        display: false, // Piilota x-akseli kokonaan
                    }
                },
                layout: {
                    padding: {
                        top: 15,
                        right: 15,
                        bottom: 15,
                        left: 15
                    }
                }
            }
        });

        // Päivitä kaavio alustuksessa
        this.updateChart();
    }

    static getMetricLabel(metric) {
        const labels = {
            sleep: 'Uni (tuntia)',
            weight: 'Paino (kg)',
            mood: 'Mieliala'
        };
        return labels[metric] || 'Arvo';
    }

    static getYAxisRange(metric) {
        // Määritä y-akselin min ja max arvot metriikan mukaan
        switch (metric) {
            case 'sleep':
                return { min: 0, max: 12 };

            case 'weight':
                if (this.entries && this.entries.length > 0) {
                    const validEntries = this.entries.filter(entry =>
                        entry.weight !== null && entry.weight !== undefined);

                    if (validEntries.length > 0) {
                        const weights = validEntries.map(entry => entry.weight);
                        const minWeight = Math.min(...weights);
                        const maxWeight = Math.max(...weights);

                        // Laske sopiva asteikko niin että data näkyy hyvin
                        const padding = Math.max(5, Math.ceil((maxWeight - minWeight) * 0.1));

                        return {
                            min: Math.max(0, Math.floor(minWeight - padding)),
                            max: Math.ceil(maxWeight + padding)
                        };
                    }
                }
                return { min: 50, max: 100 }; // Oletusasteikko painolle

            case 'mood':
                return { min: 0.5, max: 5.5 }; // Mieliala-asteikko

            default:
                return { min: 0, max: 100 };
        }
    }

    static updateChart() {
        if (!this.chart) return;

        // Hae nykyisen kuukauden tiedot
        this.chartData = this.getMonthData(this.currentYear, this.currentMonth, this.currentMetric);

        const ctx = document.getElementById('mainChart');
        const noDataMessage = document.getElementById('no-data-message');

        // Tarkista onko dataa saatavilla
        if (!this.chartData.values || this.chartData.values.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'block';
            if (ctx) ctx.style.display = 'none';
            return;
        }

        // Näytä kaavio, piilota "ei dataa" -viesti
        if (noDataMessage) noDataMessage.style.display = 'none';
        if (ctx) ctx.style.display = 'block';

        // Päivitä kaavion otsikko
        this.chart.data.datasets[0].label = this.getMetricLabel(this.currentMetric);

        // Aseta y-akselin asteikko
        const range = this.getYAxisRange(this.currentMetric);
        this.chart.options.scales.y.min = range.min;
        this.chart.options.scales.y.max = range.max;

        // Jos metriikka on mieliala, näytä y-akselin tikit mielialoina
        if (this.currentMetric === 'mood') {
            this.chart.options.scales.y.ticks.stepSize = 1;
        } else {
            this.chart.options.scales.y.ticks.stepSize = undefined;
        }

        // Päivitä kaavion data
        this.chart.data.labels = this.chartData.labels;
        this.chart.data.datasets[0].data = this.chartData.values;

        // Päivitä kaavio
        this.chart.update();
    }

    static getMonthData(year, month, metric) {
        // Suodatetaan vain nykyisen kuukauden merkinnät
        const monthEntries = this.entries.filter(entry => {
            if (!entry.entry_date) return false;

            const entryDate = new Date(`${DateUtils.toISODate(entry.entry_date)}T12:00:00Z`);
            return entryDate.getFullYear() === year && entryDate.getMonth() === month;
        });

        console.log(`Chart: Haetaan data vuodelle ${year}, kuukaudelle ${month}, metriikalle ${metric}`);
        console.log(`Chart: Löydettiin ${monthEntries.length} merkintää`);

        // Jos ei ole merkintöjä, palauta tyhjä data
        if (monthEntries.length === 0) {
            return { labels: [], values: [], days: [] };
        }

        // Järjestä merkinnät päivän mukaan (1-31)
        const entriesByDay = {};
        const fullDaysData = {};

        // Luo taulukko kaikille kuukauden päiville
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            // Luodaan ISO-muotoinen päivämäärä
            const dateStr = DateUtils.createDate(year, month, day);

            // Suodatetaan merkinnät tälle päivälle
            const dayEntries = monthEntries.filter(entry =>
                DateUtils.isSameDay(entry.entry_date, dateStr)
            );

            if (dayEntries.length > 0) {
                // Jos päivällä on merkintöjä, hae metriikan arvo viimeisimmästä merkinnästä
                const latestEntry = dayEntries.sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                )[0];

                const value = this.getMetricValueFromEntry(latestEntry, metric);

                if (value !== null) {
                    entriesByDay[day] = value;

                    // Muotoile päivämäärä näyttöä varten
                    const fullDate = new Date(year, month, day, 12);
                    fullDaysData[day] = fullDate.toLocaleDateString('fi-FI', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                }
            }
        }

        // Muodosta lopullinen data kaaviolle
        const days = Object.keys(entriesByDay).map(day => parseInt(day));
        const values = days.map(day => entriesByDay[day]);
        const dayLabels = days.map(day => day.toString()); // Vain päivät x-akselille
        const fullDays = days.map(day => fullDaysData[day]); // Täydelliset päivämäärät tooltippejä varten

        return {
            labels: dayLabels,
            values: values,
            days: fullDays
        };
    }

    static getMetricValueFromEntry(entry, metric) {
        if (!entry) return null;

        switch (metric) {
            case 'weight':
                return entry.weight !== null && entry.weight !== undefined
                    ? parseFloat(entry.weight)
                    : null;

            case 'sleep':
                return entry.sleep_hours !== null && entry.sleep_hours !== undefined
                    ? parseFloat(entry.sleep_hours)
                    : null;

            case 'mood':
                // Muunna tekstimuotoinen mieliala numeroarvoksi
                return entry.mood && this.moodValues[entry.mood]
                    ? this.moodValues[entry.mood]
                    : null;

            default:
                return null;
        }
    }
}
