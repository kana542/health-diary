import { eventBus } from '../core/EventBus.js';
import Chart from 'chart.js/auto';
import { DateUtils } from '../utils/DateUtils.js';

export class ImprovedChart {
    static chart = null;
    static entries = [];
    static currentMetric = 'weight';  // Default value is weight
    static currentYear = new Date().getFullYear();
    static currentMonth = new Date().getMonth();

    // Mood values defined as numeric values for the chart
    static moodValues = {
        'Sad': 1,
        'Tired': 2,
        'Neutral': 3,
        'Satisfied': 4,
        'Happy': 5
    };

    // Mood names
    static moodNames = {
        'Sad': 'Sad',
        'Tired': 'Tired',
        'Neutral': 'Neutral',
        'Satisfied': 'Satisfied',
        'Happy': 'Happy'
    };

    /**
     * Renders the chart component HTML
     * @returns {string} HTML structure for the chart component
     */
    static render() {
        return `
        <div class="chart">
            <h2>Health Tracking</h2>
            <div class="chart-controls">
                <div class="control-group">
                    <label for="metric-select">Metric</label>
                    <div class="select-wrapper">
                        <select id="metric-select" class="control-select">
                            <option value="weight">Weight (kg)</option>
                            <option value="sleep">Sleep (hours)</option>
                            <option value="mood">Mood</option>
                        </select>
                        <box-icon name='chevron-down'></box-icon>
                    </div>
                </div>
            </div>

            <div class="chart-wrapper">
                <canvas id="mainChart"></canvas>
                <div id="no-data-message" class="no-data-message" style="display: none;">
                    No data available. Add entries from the calendar.
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Initializes the chart component and sets up event listeners
     */
    static initialize() {
        // Set up event handler for metric selection
        this.setupControls();

        // Initialize the chart
        this.setupChart();

        // Listen for calendar month changes
        eventBus.subscribe('calendar:month-changed', (data) => {
            console.log("Chart: Month changed", data.year, data.month);
            this.currentYear = data.year;
            this.currentMonth = data.month;
            this.entries = data.entries || [];
            this.updateChart();
        });
    }

    /**
     * Sets up control elements like the metric selector
     */
    static setupControls() {
        // Metric selection handler
        const metricSelect = document.getElementById("metric-select");

        if (metricSelect) {
            // Set current selection
            metricSelect.value = this.currentMetric;

            // Update chart when selection changes
            metricSelect.addEventListener("change", () => {
                this.currentMetric = metricSelect.value;
                this.updateChart();
            });
        }
    }

    /**
     * Sets up the Chart.js instance with initial configuration
     */
    static setupChart() {
        const ctx = document.getElementById('mainChart');
        const noDataMessage = document.getElementById('no-data-message');

        if (!ctx) return;

        // Hide "no data" message initially
        if (noDataMessage) noDataMessage.style.display = 'none';

        // Create Chart.js chart
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
                    // Reduced data point size
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
                                // Display date in format "March 1, 2025"
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
                                        // Display mood name in tooltip
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
                                        // Display value and unit
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
                                // Custom tick display for mood
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
                        display: false, // Hide x-axis completely
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

        // Update chart during initialization
        this.updateChart();
    }

    /**
     * Gets the display label for the selected metric
     * @param {string} metric - The metric identifier (weight, sleep, mood)
     * @returns {string} Human-readable label for the metric
     */
    static getMetricLabel(metric) {
        const labels = {
            sleep: 'Sleep (hours)',
            weight: 'Weight (kg)',
            mood: 'Mood'
        };
        return labels[metric] || 'Value';
    }

    /**
     * Determines appropriate y-axis range based on metric and data
     * @param {string} metric - The metric identifier
     * @returns {Object} Min and max values for the y-axis
     */
    static getYAxisRange(metric) {
        // Define y-axis min and max values based on metric
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

                        // Calculate appropriate scale so data is visible
                        const padding = Math.max(5, Math.ceil((maxWeight - minWeight) * 0.1));

                        return {
                            min: Math.max(0, Math.floor(minWeight - padding)),
                            max: Math.ceil(maxWeight + padding)
                        };
                    }
                }
                return { min: 50, max: 100 }; // Default scale for weight

            case 'mood':
                return { min: 0.5, max: 5.5 }; // Mood scale

            default:
                return { min: 0, max: 100 };
        }
    }

    /**
     * Updates the chart with current data and settings
     */
    static updateChart() {
        if (!this.chart) return;

        // Get current month data
        this.chartData = this.getMonthData(this.currentYear, this.currentMonth, this.currentMetric);

        const ctx = document.getElementById('mainChart');
        const noDataMessage = document.getElementById('no-data-message');

        // Check if data is available
        if (!this.chartData.values || this.chartData.values.length === 0) {
            if (noDataMessage) noDataMessage.style.display = 'block';
            if (ctx) ctx.style.display = 'none';
            return;
        }

        // Show chart, hide "no data" message
        if (noDataMessage) noDataMessage.style.display = 'none';
        if (ctx) ctx.style.display = 'block';

        // Update chart title
        this.chart.data.datasets[0].label = this.getMetricLabel(this.currentMetric);

        // Set y-axis scale
        const range = this.getYAxisRange(this.currentMetric);
        this.chart.options.scales.y.min = range.min;
        this.chart.options.scales.y.max = range.max;

        // If metric is mood, show y-axis ticks as mood names
        if (this.currentMetric === 'mood') {
            this.chart.options.scales.y.ticks.stepSize = 1;
        } else {
            this.chart.options.scales.y.ticks.stepSize = undefined;
        }

        // Update chart data
        this.chart.data.labels = this.chartData.labels;
        this.chart.data.datasets[0].data = this.chartData.values;

        // Update chart
        this.chart.update();
    }

    /**
     * Gets data for the selected month and metric
     * @param {number} year - Year (e.g., 2023)
     * @param {number} month - Month index (0-11)
     * @param {string} metric - The metric identifier
     * @returns {Object} Formatted data for the chart
     */
    static getMonthData(year, month, metric) {
        // Filter only current month entries
        const monthEntries = this.entries.filter(entry => {
            if (!entry.entry_date) return false;

            const entryDate = new Date(`${DateUtils.toISODate(entry.entry_date)}T12:00:00Z`);
            return entryDate.getFullYear() === year && entryDate.getMonth() === month;
        });

        console.log(`Chart: Fetching data for year ${year}, month ${month}, metric ${metric}`);
        console.log(`Chart: Found ${monthEntries.length} entries`);

        // If no entries, return empty data
        if (monthEntries.length === 0) {
            return { labels: [], values: [], days: [] };
        }

        // Organize entries by day (1-31)
        const entriesByDay = {};
        const fullDaysData = {};

        // Create array for all days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            // Create ISO-formatted date
            const dateStr = DateUtils.createDate(year, month, day);

            // Filter entries for this day
            const dayEntries = monthEntries.filter(entry =>
                DateUtils.isSameDay(entry.entry_date, dateStr)
            );

            if (dayEntries.length > 0) {
                // If day has entries, get metric value from latest entry
                const latestEntry = dayEntries.sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                )[0];

                const value = this.getMetricValueFromEntry(latestEntry, metric);

                if (value !== null) {
                    entriesByDay[day] = value;

                    // Format date for display
                    const fullDate = new Date(year, month, day, 12);
                    fullDaysData[day] = fullDate.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                }
            }
        }

        // Prepare final data for chart
        const days = Object.keys(entriesByDay).map(day => parseInt(day));
        const values = days.map(day => entriesByDay[day]);
        const dayLabels = days.map(day => day.toString()); // Only days for x-axis
        const fullDays = days.map(day => fullDaysData[day]); // Full dates for tooltips

        return {
            labels: dayLabels,
            values: values,
            days: fullDays
        };
    }

    /**
     * Extracts the metric value from an entry
     * @param {Object} entry - The diary entry object
     * @param {string} metric - The metric identifier
     * @returns {number|null} The value for the selected metric or null if not available
     */
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
                // Convert text mood to numeric value
                return entry.mood && this.moodValues[entry.mood]
                    ? this.moodValues[entry.mood]
                    : null;

            default:
                return null;
        }
    }
}
