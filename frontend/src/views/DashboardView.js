import auth from '../core/Auth.js';
import entryService from '../services/EntryService.js';
import { eventBus } from '../core/EventBus.js';
import { Calendar } from '../components/Calendar.js';
import { ImprovedChart } from '../components/Chart.js';
import { EntriesList } from '../components/EntriesList.js';
import { DateUtils } from '../utils/DateUtils.js';

export default class DashboardView {
    static isInitialized = false;
    static formSubmitHandler = null;
    static moodSliderHandler = null;
    static deleteButtonHandler = null;
    static logoutHandler = null;

    static render() {
        return `
            <div class="dashboard-wrapper">
                <div class="dashboard-container">
                    <header class="dashboard-header">
                        <h1>Terveyspäiväkirja</h1>
                        <div class="user-actions">
                            <span id="username-display">Käyttäjä</span>
                            <button id="logout-button" class="btn-logout">Kirjaudu ulos</button>
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

                    <!-- Merkintöjen muokkausmodaali -->
                    <div id="entry-modal" class="modal">
                        <div class="modal-content">
                            <span class="close">&times;</span>
                            <h2>Päiväkirjamerkintä</h2>
                            <form id="entry-form">
                                <!-- Piilotettu kenttä päivämäärälle -->
                                <input type="hidden" id="entry-date">
                                <input type="hidden" id="entry-id">

                                <div class="form-group mood-slider-container">
                                    <label for="mood-slider">Mieliala</label>
                                    <div class="mood-display">
                                        <div class="mood-icon" id="mood-icon">
                                            <box-icon name="confused" type="solid" color="#ffd166"></box-icon>
                                        </div>
                                        <div class="mood-label" id="mood-label">Neutraali</div>
                                    </div>
                                    <input type="range" id="mood-slider" min="1" max="5" value="3" class="mood-slider">
                                    <div class="mood-labels">
                                        <span>Surullinen</span>
                                        <span>Väsynyt</span>
                                        <span>Neutraali</span>
                                        <span>Tyytyväinen</span>
                                        <span>Iloinen</span>
                                    </div>
                                    <input type="hidden" id="mood">
                                </div>

                                <div class="form-group">
                                    <label for="weight">Paino (kg)</label>
                                    <input type="number" id="weight" step="0.1" min="0" max="300">
                                </div>

                                <div class="form-group">
                                    <label for="sleep">Unitunnit</label>
                                    <input type="number" id="sleep" step="0.5" min="0" max="24">
                                </div>

                                <div class="form-group">
                                    <label for="notes">Muistiinpanot</label>
                                    <textarea id="notes"></textarea>
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn">Tallenna</button>
                                    <button type="button" id="delete-entry" class="btn-delete">Poista</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Merkintälistan modaali -->
                    <div id="entries-list-modal" class="modal">
                        <div class="modal-content entries-list-modal-content">
                            <!-- EntriesList-komponentin sisältö tulee tähän -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static async initialize() {
        // Tarkista onko näkymä jo alustettu
        if (this.isInitialized) {
            console.log("DashboardView on jo alustettu, ohitetaan alustus");
            return;
        }

        // Merkitse näkymä alustetuksi
        this.isInitialized = true;

        // Näytä käyttäjänimi
        const user = auth.getUser();
        const usernameDisplay = document.getElementById('username-display');
        if (user) {
            usernameDisplay.textContent = user.username;
        }

        // Kirjaudu ulos -painike
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            // Poista aiemmat käsittelijät
            logoutButton.removeEventListener('click', this.logoutHandler);

            this.logoutHandler = () => {
                auth.logout();
                window.location.href = '/login';
            };

            logoutButton.addEventListener('click', this.logoutHandler);
        }

        // Alusta komponentit
        await this.initializeComponents();
        this.setupEventListeners();
        this.setupEntryForm();
    }

    static async initializeComponents() {
        // Alusta kalenteri ja kaavio
        Calendar.initialize();
        ImprovedChart.initialize();

        // Hae päiväkirjamerkinnät
        try {
            console.log("DashboardView: Haetaan merkinnät");
            const entries = await entryService.getAllEntries();
            console.log("DashboardView: Merkinnät haettu, päivitetään komponentit");
            eventBus.publish('entries:updated', entries);
        } catch (error) {
            console.error('Virhe haettaessa merkintöjä:', error);
            this.showErrorNotification('Merkintöjen lataaminen epäonnistui');
        }
    }

    static setupEventListeners() {
        // Modaalien sulkemispainikkeet
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            closeBtn?.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Sulje modaali klikattaessa sen ulkopuolelle
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Merkintöjen tapahtumat
        eventBus.subscribe('entry:selected', (entry) => this.showEntryModal(entry));
        eventBus.subscribe('date:selected', (date) => this.showNewEntryModal(date));
        eventBus.subscribe('entries:list', (data) => this.showEntriesListModal(data.date, data.entries));
    }

    static setupEntryForm() {
        const form = document.getElementById('entry-form');
        const moodSlider = document.getElementById('mood-slider');
        const deleteButton = document.getElementById('delete-entry');

        // Tarkista onko lomake jo alustettu
        if (form && !form.hasAttribute('data-initialized')) {
            // Merkitse lomake alustetuksi
            form.setAttribute('data-initialized', 'true');

            // Mieliala-sliderin päivitys
            if (moodSlider) {
                // Poista aiemmat käsittelijät
                moodSlider.removeEventListener('input', this.moodSliderHandler);

                // Luodaan nimetty käsittelijäfunktio
                this.moodSliderHandler = (e) => {
                    this.updateMoodIcon(e.target.value);
                };

                moodSlider.addEventListener('input', this.moodSliderHandler);
            }

            // Lomakkeen lähetys - erittäin tärkeä korjaus
            if (form.hasSubmitListener) {
                // Jos käsittelijä on jo rekisteröity, älä rekisteröi uutta
                console.log("Lomakkeen lähetyskäsittelijä on jo rekisteröity, ohitetaan rekisteröinti");
                return;
            }

            // Luodaan nimetty käsittelijäfunktio
            this.formSubmitHandler = async (e) => {
                e.preventDefault();

                // Estetään useita tallennuksia
                if (form.isSubmitting) {
                    console.log("Lomaketta käsitellään jo, ohitetaan");
                    return;
                }

                try {
                    // Merkitään lomake käsittelyyn
                    form.isSubmitting = true;

                    // Tallennuslogiikka
                    await this.saveEntry();

                } finally {
                    // Vapautetaan lomake käsittelystä
                    form.isSubmitting = false;
                }
            };

            form.addEventListener('submit', this.formSubmitHandler);
            form.hasSubmitListener = true;

            // Merkinnän poisto
            if (deleteButton) {
                deleteButton.removeEventListener('click', this.deleteButtonHandler);

                this.deleteButtonHandler = () => {
                    this.deleteEntry();
                };

                deleteButton.addEventListener('click', this.deleteButtonHandler);
            }
        }
    }

    static updateMoodIcon(value) {
        const moodIcon = document.getElementById('mood-icon');
        const moodLabel = document.getElementById('mood-label');
        const moodInput = document.getElementById('mood');

        const moodMap = [
            { value: 1, icon: '<box-icon name="sad" type="solid" color="#d62828"></box-icon>', label: 'Surullinen', code: 'Sad' },
            { value: 2, icon: '<box-icon name="tired" type="solid" color="#f77f00"></box-icon>', label: 'Väsynyt', code: 'Tired' },
            { value: 3, icon: '<box-icon name="confused" type="solid" color="#ffd166"></box-icon>', label: 'Neutraali', code: 'Neutral' },
            { value: 4, icon: '<box-icon name="smile" type="solid" color="#5fa8d3"></box-icon>', label: 'Tyytyväinen', code: 'Satisfied' },
            { value: 5, icon: '<box-icon name="happy" type="solid" color="#38b000"></box-icon>', label: 'Iloinen', code: 'Happy' }
        ];

        const mood = moodMap.find(m => m.value === parseInt(value)) || moodMap[2];

        if (moodIcon) moodIcon.innerHTML = mood.icon;
        if (moodLabel) moodLabel.textContent = mood.label;
        if (moodInput) moodInput.value = mood.code;
    }

    static showNewEntryModal(date) {
        console.log("showNewEntryModal kutsuttu päivämäärällä:", date);

        const modal = document.getElementById('entry-modal');
        if (!modal) return;

        // Varmista, että päivämäärä on ISO-muodossa
        const isoDate = DateUtils.toISODate(date);
        console.log("Varmistettu ISO-muotoinen päivämäärä:", isoDate);

        const dateInput = document.getElementById('entry-date');
        const entryIdInput = document.getElementById('entry-id');
        const moodSlider = document.getElementById('mood-slider');
        const weightInput = document.getElementById('weight');
        const sleepInput = document.getElementById('sleep');
        const notesTextarea = document.getElementById('notes');
        const deleteButton = document.getElementById('delete-entry');

        // Aseta lomakkeen arvot
        if (dateInput) dateInput.value = isoDate;
        if (entryIdInput) entryIdInput.value = '';

        // Muotoile päivämäärä näyttömuotoon
        const formattedDate = DateUtils.formatDisplayDate(isoDate);
        console.log("Muotoiltu näyttöpäivämäärä:", formattedDate);

        const heading = modal.querySelector('h2');
        if (heading) heading.textContent = `Uusi merkintä - ${formattedDate}`;

        // Tyhjennä lomake
        if (moodSlider) {
            moodSlider.value = 3;
            this.updateMoodIcon(3);
        }

        if (weightInput) weightInput.value = '';
        if (sleepInput) sleepInput.value = '';
        if (notesTextarea) notesTextarea.value = '';

        if (deleteButton) deleteButton.style.display = 'none';

        // Näytä modaali
        modal.style.display = 'block';
    }

    static showEntryModal(entry) {
        console.log("showEntryModal kutsuttu merkinnällä:", entry);

        const modal = document.getElementById('entry-modal');
        if (!modal) return;

        const dateInput = document.getElementById('entry-date');
        const entryIdInput = document.getElementById('entry-id');
        const moodSlider = document.getElementById('mood-slider');
        const weightInput = document.getElementById('weight');
        const sleepInput = document.getElementById('sleep');
        const notesTextarea = document.getElementById('notes');
        const deleteButton = document.getElementById('delete-entry');

        // Varmista, että päivämäärä on ISO-muodossa
        const isoDate = DateUtils.toISODate(entry.entry_date);
        console.log("Merkinnän ISO-muotoinen päivämäärä:", isoDate);

        // Aseta lomakkeen arvot
        if (dateInput) dateInput.value = isoDate;
        if (entryIdInput) entryIdInput.value = entry.entry_id || '';

        // Muotoile päivämäärä näyttömuotoon
        const formattedDate = DateUtils.formatDisplayDate(isoDate);
        console.log("Muotoiltu näyttöpäivämäärä:", formattedDate);

        const heading = modal.querySelector('h2');
        if (heading) heading.textContent = `Päiväkirjamerkintä - ${formattedDate}`;

        // Aseta mieliala
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

        // Aseta muut tiedot
        if (weightInput) weightInput.value = entry.weight || '';
        if (sleepInput) sleepInput.value = entry.sleep_hours || '';
        if (notesTextarea) notesTextarea.value = entry.notes || '';

        // Näytä poistopainike olemassa olevalle merkinnälle
        if (deleteButton) deleteButton.style.display = 'block';

        // Näytä modaali
        modal.style.display = 'block';
    }

    static showEntriesListModal(date, entries) {
        const modal = document.getElementById('entries-list-modal');
        if (!modal) return;

        const modalContent = modal.querySelector('.entries-list-modal-content');
        if (!modalContent) return;

        // Varmista, että päivämäärä on ISO-muodossa
        const isoDate = DateUtils.toISODate(date);

        // Renderöi merkintälista
        modalContent.innerHTML = EntriesList.render(isoDate, entries);

        // Alusta merkintälistan toiminnallisuus
        EntriesList.initialize(isoDate, entries);

        // Näytä modaali
        modal.style.display = 'block';
    }

    static async saveEntry() {
        try {
            const entryId = document.getElementById('entry-id')?.value;
            const entryDate = document.getElementById('entry-date')?.value;

            // Varmista, että päivämäärä on ISO-muodossa
            const isoDate = DateUtils.toISODate(entryDate);
            console.log("Tallennetaan merkintä, päivämäärä:", isoDate);

            const entryData = {
                entry_date: isoDate,
                mood: document.getElementById('mood')?.value,
                weight: document.getElementById('weight')?.value ? parseFloat(document.getElementById('weight').value) : null,
                sleep_hours: document.getElementById('sleep')?.value ? parseFloat(document.getElementById('sleep').value) : null,
                notes: document.getElementById('notes')?.value
            };

            console.log("Tallennetaan merkintä:", entryData);

            // Päivitä tai luo uusi merkintä
            if (entryId) {
                await entryService.updateEntry(entryId, entryData);
            } else {
                await entryService.createEntry(entryData);
            }

            // Päivitä näkymät
            await this.refreshData();

            // Sulje modaali
            document.getElementById('entry-modal').style.display = 'none';

            // Näytä ilmoitus
            this.showSuccessNotification(entryId ? 'Merkintä päivitetty' : 'Uusi merkintä lisätty');

        } catch (error) {
            console.error('Virhe tallennettaessa merkintää:', error);
            this.showErrorNotification('Merkinnän tallentaminen epäonnistui');
        }
    }

    static async deleteEntry() {
        const entryId = document.getElementById('entry-id')?.value;
        if (!entryId) return;

        if (confirm('Haluatko varmasti poistaa tämän merkinnän?')) {
            try {
                await entryService.deleteEntry(entryId);

                // Päivitä näkymät
                await this.refreshData();

                // Sulje modaali
                document.getElementById('entry-modal').style.display = 'none';

                // Näytä ilmoitus
                this.showSuccessNotification('Merkintä poistettu');

            } catch (error) {
                console.error('Virhe poistettaessa merkintää:', error);
                this.showErrorNotification('Merkinnän poistaminen epäonnistui');
            }
        }
    }

    static async refreshData() {
        // Tyhjennä välimuisti ja hae päivitetyt merkinnät
        entryService.clearCache();
        const entries = await entryService.getAllEntries();

        // Julkaise päivitystapahtuma - tämä riittää päivittämään kaikki komponentit
        eventBus.publish('entries:updated', entries);
    }

    static showSuccessNotification(message) {
        console.log("Success: " + message);
    }

    static showErrorNotification(message) {
        console.error("Error: " + message);
    }

    static cleanup() {
        // Merkitään näkymä ei-alustetuksi
        this.isInitialized = false;

        // Poista tapahtumankäsittelijät
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
