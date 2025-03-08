import auth from '../core/Auth.js';
import entryService from '../services/EntryService.js';
import { eventBus } from '../core/EventBus.js';
import { Calendar } from '../components/Calendar.js';
import { ImprovedChart } from '../components/Chart.js';
import { EntriesList } from '../components/EntriesList.js';
import { DateUtils } from '../utils/DateUtils.js';

/**
 * Dashboard view component for health diary application
 * Manages the main user interface, entry forms, and component integration
 */
export default class DashboardView {
    static isInitialized = false;
    static formSubmitHandler = null;
    static moodSliderHandler = null;
    static deleteButtonHandler = null;
    static logoutHandler = null;

    /**
     * Renders the dashboard HTML structure
     * @returns {string} HTML markup for the dashboard
     */
    static render() {
        return `
            <div class="dashboard-wrapper">
                <div class="dashboard-container">
                    <header class="dashboard-header">
                        <h1>Health Diary</h1>
                        <div class="user-actions">
                            <span id="username-display">User</span>
                            <button id="logout-button" class="btn-logout">Log out</button>
                        </div>
                    </header>

                    <div class="dashboard-content">
                        <div class="calendar-container">
                            ${Calendar.render()}
                        </div>
                        <div class="chart-container">
                            ${ImprovedChart.render()}
                        </div>
                    </div>

                    <!-- Entry editing modal -->
                    <div id="entry-modal" class="modal">
                        <div class="modal-content">
                            <span class="close">&times;</span>
                            <h2>Diary Entry</h2>
                            <form id="entry-form">
                                <!-- Hidden fields for date and ID -->
                                <input type="hidden" id="entry-date">
                                <input type="hidden" id="entry-id">

                                <div class="form-group mood-slider-container">
                                    <label for="mood-slider">Mood</label>
                                    <div class="mood-display">
                                        <div class="mood-icon" id="mood-icon">
                                            <box-icon name="confused" type="solid" color="#ffd166"></box-icon>
                                        </div>
                                        <div class="mood-label" id="mood-label">Neutral</div>
                                    </div>
                                    <input type="range" id="mood-slider" min="1" max="5" value="3" class="mood-slider">
                                    <div class="mood-labels">
                                        <span>Sad</span>
                                        <span>Tired</span>
                                        <span>Neutral</span>
                                        <span>Satisfied</span>
                                        <span>Happy</span>
                                    </div>
                                    <input type="hidden" id="mood">
                                </div>

                                <div class="form-group">
                                    <label for="weight">Weight (kg)</label>
                                    <input type="number" id="weight" step="0.1" min="0" max="300">
                                </div>

                                <div class="form-group">
                                    <label for="sleep">Sleep hours</label>
                                    <input type="number" id="sleep" step="0.5" min="0" max="24">
                                </div>

                                <div class="form-group">
                                    <label for="notes">Notes</label>
                                    <textarea id="notes"></textarea>
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn">Save</button>
                                    <button type="button" id="delete-entry" class="btn-delete">Delete</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Entries list modal -->
                    <div id="entries-list-modal" class="modal">
                        <div class="modal-content entries-list-modal-content">
                            <!-- EntriesList component content will be placed here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initializes the dashboard components and event handlers
     * @returns {Promise<void>}
     */
    static async initialize() {
        // Check if view is already initialized
        if (this.isInitialized) {
            console.log("DashboardView is already initialized, skipping initialization");
            return;
        }

        // Mark view as initialized
        this.isInitialized = true;

        // Display username
        const user = auth.getUser();
        const usernameDisplay = document.getElementById('username-display');
        if (user) {
            usernameDisplay.textContent = user.username;
        }

        // Logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            // Remove previous handlers
            logoutButton.removeEventListener('click', this.logoutHandler);

            this.logoutHandler = () => {
                auth.logout();
                window.location.href = '/login';
            };

            logoutButton.addEventListener('click', this.logoutHandler);
        }

        // Initialize components
        await this.initializeComponents();
        this.setupEventListeners();
        this.setupEntryForm();
    }

    /**
     * Initializes the calendar and chart components and loads entries
     * @returns {Promise<void>}
     */
    static async initializeComponents() {
        // Initialize calendar and chart
        Calendar.initialize();
        ImprovedChart.initialize();

        // Fetch diary entries
        try {
            console.log("DashboardView: Fetching entries");
            const entries = await entryService.getAllEntries();
            console.log("DashboardView: Entries fetched, updating components");
            eventBus.publish('entries:updated', entries);
        } catch (error) {
            console.error('Error fetching entries:', error);
            this.showErrorNotification('Failed to load entries');
        }
    }

    /**
     * Sets up event listeners for modals and entry-related events
     */
    static setupEventListeners() {
        // Modal close buttons
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            closeBtn?.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Close modal when clicking outside of it
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Entry-related events
        eventBus.subscribe('entry:selected', (entry) => this.showEntryModal(entry));
        eventBus.subscribe('date:selected', (date) => this.showNewEntryModal(date));
        eventBus.subscribe('entries:list', (data) => this.showEntriesListModal(data.date, data.entries));
    }

    /**
     * Sets up the entry form and its event handlers
     */
    static setupEntryForm() {
        const form = document.getElementById('entry-form');
        const moodSlider = document.getElementById('mood-slider');
        const deleteButton = document.getElementById('delete-entry');

        // Check if form is already initialized
        if (form && !form.hasAttribute('data-initialized')) {
            // Mark form as initialized
            form.setAttribute('data-initialized', 'true');

            // Mood slider update
            if (moodSlider) {
                // Remove previous handlers
                moodSlider.removeEventListener('input', this.moodSliderHandler);

                // Create named handler function
                this.moodSliderHandler = (e) => {
                    this.updateMoodIcon(e.target.value);
                };

                moodSlider.addEventListener('input', this.moodSliderHandler);
            }

            // Form submission - critical fix
            if (form.hasSubmitListener) {
                // If handler is already registered, don't register a new one
                console.log("Form submit handler is already registered, skipping registration");
                return;
            }

            // Create named handler function
            this.formSubmitHandler = async (e) => {
                e.preventDefault();

                // Prevent multiple saves
                if (form.isSubmitting) {
                    console.log("Form is already processing, skipping");
                    return;
                }

                try {
                    // Mark form as processing
                    form.isSubmitting = true;

                    // Save logic
                    await this.saveEntry();

                } finally {
                    // Release form from processing
                    form.isSubmitting = false;
                }
            };

            form.addEventListener('submit', this.formSubmitHandler);
            form.hasSubmitListener = true;

            // Entry deletion
            if (deleteButton) {
                deleteButton.removeEventListener('click', this.deleteButtonHandler);

                this.deleteButtonHandler = () => {
                    this.deleteEntry();
                };

                deleteButton.addEventListener('click', this.deleteButtonHandler);
            }
        }
    }

    /**
     * Updates the mood icon and label based on slider value
     * @param {number} value - Slider value (1-5)
     */
    static updateMoodIcon(value) {
        const moodIcon = document.getElementById('mood-icon');
        const moodLabel = document.getElementById('mood-label');
        const moodInput = document.getElementById('mood');

        const moodMap = [
            { value: 1, icon: '<box-icon name="sad" type="solid" color="#d62828"></box-icon>', label: 'Sad', code: 'Sad' },
            { value: 2, icon: '<box-icon name="tired" type="solid" color="#f77f00"></box-icon>', label: 'Tired', code: 'Tired' },
            { value: 3, icon: '<box-icon name="confused" type="solid" color="#ffd166"></box-icon>', label: 'Neutral', code: 'Neutral' },
            { value: 4, icon: '<box-icon name="smile" type="solid" color="#5fa8d3"></box-icon>', label: 'Satisfied', code: 'Satisfied' },
            { value: 5, icon: '<box-icon name="happy" type="solid" color="#38b000"></box-icon>', label: 'Happy', code: 'Happy' }
        ];

        const mood = moodMap.find(m => m.value === parseInt(value)) || moodMap[2];

        if (moodIcon) moodIcon.innerHTML = mood.icon;
        if (moodLabel) moodLabel.textContent = mood.label;
        if (moodInput) moodInput.value = mood.code;
    }

    /**
     * Shows the modal for creating a new entry on the selected date
     * @param {string} date - The selected date
     */
    static showNewEntryModal(date) {
        console.log("showNewEntryModal called with date:", date);

        const modal = document.getElementById('entry-modal');
        if (!modal) return;

        // Ensure date is in ISO format
        const isoDate = DateUtils.toISODate(date);
        console.log("Confirmed ISO-formatted date:", isoDate);

        const dateInput = document.getElementById('entry-date');
        const entryIdInput = document.getElementById('entry-id');
        const moodSlider = document.getElementById('mood-slider');
        const weightInput = document.getElementById('weight');
        const sleepInput = document.getElementById('sleep');
        const notesTextarea = document.getElementById('notes');
        const deleteButton = document.getElementById('delete-entry');

        // Set form values
        if (dateInput) dateInput.value = isoDate;
        if (entryIdInput) entryIdInput.value = '';

        // Format date for display
        const formattedDate = DateUtils.formatDisplayDate(isoDate);
        console.log("Formatted display date:", formattedDate);

        const heading = modal.querySelector('h2');
        if (heading) heading.textContent = `New Entry - ${formattedDate}`;

        // Clear form
        if (moodSlider) {
            moodSlider.value = 3;
            this.updateMoodIcon(3);
        }

        if (weightInput) weightInput.value = '';
        if (sleepInput) sleepInput.value = '';
        if (notesTextarea) notesTextarea.value = '';

        if (deleteButton) deleteButton.style.display = 'none';

        // Show modal
        modal.style.display = 'block';
    }

    /**
     * Shows the modal for editing an existing entry
     * @param {Object} entry - The entry object to edit
     */
    static showEntryModal(entry) {
        console.log("showEntryModal called with entry:", entry);

        const modal = document.getElementById('entry-modal');
        if (!modal) return;

        const dateInput = document.getElementById('entry-date');
        const entryIdInput = document.getElementById('entry-id');
        const moodSlider = document.getElementById('mood-slider');
        const weightInput = document.getElementById('weight');
        const sleepInput = document.getElementById('sleep');
        const notesTextarea = document.getElementById('notes');
        const deleteButton = document.getElementById('delete-entry');

        // Ensure date is in ISO format
        const isoDate = DateUtils.toISODate(entry.entry_date);
        console.log("Entry's ISO-formatted date:", isoDate);

        // Set form values
        if (dateInput) dateInput.value = isoDate;
        if (entryIdInput) entryIdInput.value = entry.entry_id || '';

        // Format date for display
        const formattedDate = DateUtils.formatDisplayDate(isoDate);
        console.log("Formatted display date:", formattedDate);

        const heading = modal.querySelector('h2');
        if (heading) heading.textContent = `Diary Entry - ${formattedDate}`;

        // Set mood
        if (moodSlider) {
            const moodValues = {
                'Sad': 1,
                'Tired': 2,
                'Neutral': 3,
                'Satisfied': 4,
                'Happy': 5
            };

            const sliderValue = moodValues[entry.mood] || 3;
            moodSlider.value = sliderValue;
            this.updateMoodIcon(sliderValue);
        }

        // Set other information
        if (weightInput) weightInput.value = entry.weight || '';
        if (sleepInput) sleepInput.value = entry.sleep_hours || '';
        if (notesTextarea) notesTextarea.value = entry.notes || '';

        // Show delete button for existing entries
        if (deleteButton) deleteButton.style.display = 'block';

        // Show modal
        modal.style.display = 'block';
    }

    /**
     * Shows the modal listing all entries for a specific date
     * @param {string} date - The date to show entries for
     * @param {Array} entries - Array of entry objects for the date
     */
    static showEntriesListModal(date, entries) {
        const modal = document.getElementById('entries-list-modal');
        if (!modal) return;

        const modalContent = modal.querySelector('.entries-list-modal-content');
        if (!modalContent) return;

        // Ensure date is in ISO format
        const isoDate = DateUtils.toISODate(date);

        // Render entries list
        modalContent.innerHTML = EntriesList.render(isoDate, entries);

        // Initialize entries list functionality
        EntriesList.initialize(isoDate, entries);

        // Show modal
        modal.style.display = 'block';
    }

    /**
     * Saves the current entry form data (create or update)
     * @returns {Promise<void>}
     */
    static async saveEntry() {
        try {
            const entryId = document.getElementById('entry-id')?.value;
            const entryDate = document.getElementById('entry-date')?.value;

            // Ensure date is in ISO format
            const isoDate = DateUtils.toISODate(entryDate);
            console.log("Saving entry, date:", isoDate);

            const entryData = {
                entry_date: isoDate,
                mood: document.getElementById('mood')?.value,
                weight: document.getElementById('weight')?.value ? parseFloat(document.getElementById('weight').value) : null,
                sleep_hours: document.getElementById('sleep')?.value ? parseFloat(document.getElementById('sleep').value) : null,
                notes: document.getElementById('notes')?.value
            };

            console.log("Saving entry:", entryData);

            // Update or create new entry
            if (entryId) {
                await entryService.updateEntry(entryId, entryData);
            } else {
                await entryService.createEntry(entryData);
            }

            // Update views
            await this.refreshData();

            // Close modal
            document.getElementById('entry-modal').style.display = 'none';

            // Show notification
            this.showSuccessNotification(entryId ? 'Entry updated' : 'New entry added');

        } catch (error) {
            console.error('Error saving entry:', error);
            this.showErrorNotification('Failed to save entry');
        }
    }

    /**
     * Deletes the current entry after confirmation
     * @returns {Promise<void>}
     */
    static async deleteEntry() {
        const entryId = document.getElementById('entry-id')?.value;
        if (!entryId) return;

        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                await entryService.deleteEntry(entryId);

                // Update views
                await this.refreshData();

                // Close modal
                document.getElementById('entry-modal').style.display = 'none';

                // Show notification
                this.showSuccessNotification('Entry deleted');

            } catch (error) {
                console.error('Error deleting entry:', error);
                this.showErrorNotification('Failed to delete entry');
            }
        }
    }

    /**
     * Refreshes all data in the dashboard
     * Clears cache and fetches updated entries
     * @returns {Promise<void>}
     */
    static async refreshData() {
        // Clear cache and fetch updated entries
        entryService.clearCache();
        const entries = await entryService.getAllEntries();

        // Publish update event - this is enough to update all components
        eventBus.publish('entries:updated', entries);
    }

    /**
     * Shows a success notification with the given message
     * @param {string} message - The success message to display
     */
    static showSuccessNotification(message) {
        console.log("Success: " + message);
    }

    /**
     * Shows an error notification with the given message
     * @param {string} message - The error message to display
     */
    static showErrorNotification(message) {
        console.error("Error: " + message);
    }

    /**
     * Cleans up event listeners and resets state when component is unmounted
     */
    static cleanup() {
        // Mark view as not initialized
        this.isInitialized = false;

        // Remove event handlers
        const form = document.getElementById('entry-form');
        if (form) {
            form.removeAttribute('data-initialized');
            form.hasSubmitListener = false;

            if (this.formSubmitHandler) {
                form.removeEventListener('submit', this.formSubmitHandler);
            }
        }

        const moodSlider = document.getElementById('mood-slider');
        if (moodSlider && this.moodSliderHandler) {
            moodSlider.removeEventListener('input', this.moodSliderHandler);
        }

        const deleteButton = document.getElementById('delete-entry');
        if (deleteButton && this.deleteButtonHandler) {
            deleteButton.removeEventListener('click', this.deleteButtonHandler);
        }

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton && this.logoutHandler) {
            logoutButton.removeEventListener('click', this.logoutHandler);
        }
    }
}
