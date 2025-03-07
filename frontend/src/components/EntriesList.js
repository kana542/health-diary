import { eventBus } from '../core/EventBus.js';
import entryService from '../services/EntryService.js';
import { DateUtils } from '../utils/DateUtils.js';

export class EntriesList {
    static render(date, entries) {
        // Varmista, että päivämäärä on ISO-muodossa
        const isoDate = DateUtils.toISODate(date);

        // Muotoile päivämäärä näyttömuotoon
        const formattedDate = DateUtils.formatDisplayDate(isoDate);

        let entriesHtml = '';

        // Järjestä merkinnät uusimmasta vanhimpaan
        const sortedEntries = [...entries].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        sortedEntries.forEach(entry => {
            // Näytä luontiaika
            const entryTime = entry.created_at
                ? new Date(entry.created_at).toLocaleTimeString('fi-FI', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '';

            // Määritä mieliala-ikonit ja tekstit
            let moodIcon = '';
            let moodText = '';

            switch(entry.mood) {
                case 'Happy':
                    moodIcon = '<box-icon name="happy" type="solid" color="#38b000"></box-icon>';
                    moodText = 'Iloinen';
                    break;
                case 'Satisfied':
                    moodIcon = '<box-icon name="smile" type="solid" color="#5fa8d3"></box-icon>';
                    moodText = 'Tyytyväinen';
                    break;
                case 'Neutral':
                    moodIcon = '<box-icon name="confused" type="solid" color="#ffd166"></box-icon>';
                    moodText = 'Neutraali';
                    break;
                case 'Tired':
                    moodIcon = '<box-icon name="tired" type="solid" color="#f77f00"></box-icon>';
                    moodText = 'Väsynyt';
                    break;
                case 'Sad':
                    moodIcon = '<box-icon name="sad" type="solid" color="#d62828"></box-icon>';
                    moodText = 'Surullinen';
                    break;
                default:
                    moodIcon = '<box-icon name="help" type="solid" color="#6c757d"></box-icon>';
                    moodText = 'Ei määritelty';
            }

            // Muodosta listanimike
            entriesHtml += `
                <div class="entry-item" data-entry-id="${entry.entry_id}">
                    <div class="entry-item-content">
                        <div class="entry-time">${entryTime}</div>
                        <div class="entry-mood">
                            ${moodIcon}
                            <span>${moodText}</span>
                        </div>
                        <div class="entry-stats">
                            ${entry.weight ? `<div><box-icon name="trending-up" color="#777"></box-icon> ${entry.weight} kg</div>` : ''}
                            ${entry.sleep_hours ? `<div><box-icon name="moon" color="#777"></box-icon> ${entry.sleep_hours} h</div>` : ''}
                        </div>
                        <div class="entry-preview">
                            ${entry.notes ? (entry.notes.length > 30 ? entry.notes.substring(0, 30) + '...' : entry.notes) : ''}
                        </div>
                    </div>
                    <button class="delete-entry-button" data-entry-id="${entry.entry_id}">
                        <box-icon name="trash" color="white"></box-icon>
                    </button>
                </div>
            `;
        });

        return `
            <div class="entries-list-container">
                <div class="entries-list-header">
                    <h2>${formattedDate}</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="entries-list">
                    ${entriesHtml || '<div class="no-entries">Ei merkintöjä tälle päivälle</div>'}
                </div>
                <div class="entries-list-footer">
                    <button id="add-entry-button" class="btn-add">
                        <box-icon name="plus" color="white"></box-icon>
                    </button>
                </div>
            </div>
        `;
    }

    static initialize(date, entries) {
        // Varmista, että päivämäärä on ISO-muodossa
        const isoDate = DateUtils.toISODate(date);

        // Sulkemispainike
        const closeBtn = document.querySelector('.entries-list-container .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('entries-list-modal').style.display = 'none';
            });
        }

        // "Lisää merkintä" -painike
        const addEntryBtn = document.getElementById('add-entry-button');
        if (addEntryBtn) {
            addEntryBtn.addEventListener('click', () => {
                document.getElementById('entries-list-modal').style.display = 'none';
                // Käytä DateUtils.toISODate-metodia varmistamaan oikea päivämäärän muoto
                eventBus.publish('date:selected', isoDate);
            });
        }

        // Merkintöjen klikkaus avaa muokkausnäkymän
        const entryItems = document.querySelectorAll('.entry-item-content');
        entryItems.forEach(item => {
            item.addEventListener('click', () => {
                const entryId = item.parentElement.getAttribute('data-entry-id');
                const selectedEntry = entries.find(entry => entry.entry_id.toString() === entryId);

                if (selectedEntry) {
                    document.getElementById('entries-list-modal').style.display = 'none';
                    eventBus.publish('entry:selected', selectedEntry);
                }
            });
        });

        // Poistopainikkeet
        const deleteButtons = document.querySelectorAll('.delete-entry-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();

                const entryId = button.getAttribute('data-entry-id');

                if (confirm('Haluatko varmasti poistaa tämän merkinnän?')) {
                    try {
                        await entryService.deleteEntry(entryId);

                        const updatedEntries = entries.filter(entry => entry.entry_id.toString() !== entryId);

                        if (updatedEntries.length > 0) {
                            this.updateList(isoDate, updatedEntries);
                        } else {
                            document.getElementById('entries-list-modal').style.display = 'none';
                        }

                        entryService.clearCache();
                        const allEntries = await entryService.getAllEntries();
                        eventBus.publish('entries:updated', allEntries);
                    } catch (error) {
                        console.error('Virhe poistettaessa merkintää:', error);
                        alert('Merkinnän poistaminen epäonnistui: ' + error.message);
                    }
                }
            });
        });
    }

    static updateList(date, entries) {
      const modalContent = document.querySelector('.entries-list-modal-content');

      modalContent.innerHTML = this.render(date, entries);

      this.initialize(date, entries);
    }
}
