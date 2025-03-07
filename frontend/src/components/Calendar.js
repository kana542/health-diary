import entryService from '../services/EntryService.js';
import { eventBus } from '../core/EventBus.js';
import { DateUtils } from '../utils/DateUtils.js';

export class Calendar {
    static entries = [];
    static entriesLastLoaded = null;
    static currentDate = new Date();
    static updateCalendarFunction = null;
    static entriesUpdateUnsubscribe = null;
    static entriesUpdatedSubscribed = false;

    static render() {
        return `
        <div class="calendar">
            <div class="header">
                <button id="prevBtn">
                    <box-icon name='chevron-left'></box-icon>
                </button>
                <div class="monthYear"></div>
                <button id="nextBtn">
                    <box-icon name='chevron-right'></box-icon>
                </button>
            </div>
            <div class="days">
                <div class="day">Ma</div>
                <div class="day">Ti</div>
                <div class="day">Ke</div>
                <div class="day">To</div>
                <div class="day">Pe</div>
                <div class="day">La</div>
                <div class="day">Su</div>
            </div>
            <div class="dates" id="dates"></div>
        </div>
        `;
    }

    static initialize() {
        const monthYearElement = document.querySelector(".monthYear");
        const datesElement = document.querySelector("#dates");
        const prevBtn = document.querySelector("#prevBtn");
        const nextBtn = document.querySelector("#nextBtn");

        // Lataa merkinnät jos niitä ei ole vielä ladattu
        if (!this.entries || this.entries.length === 0) {
            this.loadEntries();
        }

        this.updateCalendarFunction = () => {
            const currentYear = this.currentDate.getFullYear();
            const currentMonth = this.currentDate.getMonth();

            // Hae kuukauden tiedot
            const { firstDay, lastDay, daysInMonth } = DateUtils.getMonthRange(currentYear, currentMonth);

            // Määritä kuukauden ensimmäisen päivän viikonpäivä (0 = ma, 6 = su)
            const firstDayDate = new Date(currentYear, currentMonth, 1);
            let firstDayIndex = firstDayDate.getDay() - 1;
            if (firstDayIndex < 0) firstDayIndex = 6;

            // Määritä kuukauden viimeisen päivän viikonpäivä
            let lastDayIndex = new Date(currentYear, currentMonth + 1, 0).getDay() - 1;
            if (lastDayIndex < 0) lastDayIndex = 6;

            // Näytä kuukausi ja vuosi
            const monthYearString = this.currentDate.toLocaleDateString(
                "fi-FI",
                { month: "long", year: "numeric" }
            );
            monthYearElement.textContent = monthYearString;

            let datesHTML = "";

            // Edellisen kuukauden päivät
            const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
            for (let i = 0; i < firstDayIndex; i++) {
                const dayNum = prevMonthLastDay - firstDayIndex + i + 1;
                datesHTML += `<div class="date inactive">${dayNum}</div>`;
            }

            const today = DateUtils.today();

            // Tämän kuukauden päivät
            for (let i = 1; i <= daysInMonth; i++) {
                // Käytä DateUtils-luokkaa päivämäärän luomiseen
                const dateString = DateUtils.createDate(currentYear, currentMonth, i);

                // Etsi päivän merkinnät
                const dayEntries = this.entries.filter(entry => {
                    if (!entry.entry_date) return false;
                    return DateUtils.isSameDay(entry.entry_date, dateString);
                });

                const entryCount = dayEntries.length;
                const isToday = DateUtils.isSameDay(dateString, today);
                const activeClass = isToday ? "active" : "";
                const entryClass = entryCount > 0 ? "has-entry" : "";
                const multiEntryClass = entryCount > 1 ? "multi-entry" : "";
                const entryCountHtml = entryCount > 1 ? `<span class="entry-count">${entryCount}</span>` : '';

                datesHTML += `
                    <div class="date ${activeClass} ${entryClass} ${multiEntryClass}" data-date="${dateString}" data-entries="${entryCount}">
                        ${i}
                        ${entryCountHtml}
                    </div>
                `;
            }

            // Seuraavan kuukauden päivät
            const nextDays = 7 - ((firstDayIndex + daysInMonth) % 7);
            if (nextDays < 7) {
                for (let i = 1; i <= nextDays; i++) {
                    datesHTML += `<div class="date inactive">${i}</div>`;
                }
            }

            datesElement.innerHTML = datesHTML;

            // Lisää tapahtumankäsittelijät kalenteripäiville
            document.querySelectorAll('.date:not(.inactive)').forEach(dateElement => {
                dateElement.addEventListener('click', () => {
                    const selectedDate = dateElement.getAttribute('data-date');
                    const entriesCount = parseInt(dateElement.getAttribute('data-entries') || '0');
                    this.handleDateClick(selectedDate, entriesCount);
                });
            });
        };

        // Päivitä kalenteri ensimmäistä kertaa
        this.updateCalendarFunction();

        // Julkaise tieto nykyisestä kuukaudesta
        this.publishCurrentMonth();

        // Lisää tapahtumankäsittelijät edellinen/seuraava-painikkeille
        prevBtn.addEventListener("click", () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateCalendarFunction();

            // Julkaise tieto kuukauden vaihdosta
            this.publishCurrentMonth();
        });

        nextBtn.addEventListener("click", () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateCalendarFunction();

            // Julkaise tieto kuukauden vaihdosta
            this.publishCurrentMonth();
        });

        // Rekisteröi merkintöjen päivityksen tapahtumankäsittelijä vain kerran
        if (!this.entriesUpdatedSubscribed) {
            // Poista aiemmat tilaukset jos niitä on
            if (this.entriesUpdateUnsubscribe) {
                this.entriesUpdateUnsubscribe();
            }

            // Rekisteröi uusi tilaaja ja tallenna unsubscribe-funktio
            this.entriesUpdateUnsubscribe = eventBus.subscribe('entries:updated', async (entries) => {
                if (entries) {
                    this.entries = entries;
                    console.log("Calendar: Merkinnät päivitetty, päivitetään kalenteri");
                } else {
                    await this.loadEntries();
                }
                this.updateCalendarFunction();

                // Päivitä myös kaavio uusilla merkinnöillä
                this.publishCurrentMonth();
            });

            this.entriesUpdatedSubscribed = true;
        }
    }

    // Uusi metodi kuukauden tietojen julkaisemiseen
    static publishCurrentMonth() {
        eventBus.publish('calendar:month-changed', {
            year: this.currentDate.getFullYear(),
            month: this.currentDate.getMonth(),
            entries: this.entries
        });
    }

    static async loadEntries() {
        const now = new Date();
        const cacheTime = 30 * 1000; // 30 sekuntia

        try {
            if (!this.entries || !this.entries.length || !this.entriesLastLoaded ||
                (now - this.entriesLastLoaded) > cacheTime) {
                console.log("Calendar: Ladataan merkinnät palvelimelta");
                this.entries = await entryService.getAllEntries();
                this.entriesLastLoaded = now;
            }
            return this.entries;
        } catch (error) {
            console.error('Virhe haettaessa merkintöjä:', error);
            this.entries = [];
            return [];
        }
    }

    static handleDateClick(date, entriesCount) {
        console.log("Kalenterissa klikattu päivä:", date);

        // Varmista, että päivämäärä on aina ISO-muodossa
        const isoDate = DateUtils.toISODate(date);

        // Etsi päivän merkinnät
        const dayEntries = this.entries.filter(entry => {
            if (!entry.entry_date) return false;
            return DateUtils.isSameDay(entry.entry_date, isoDate);
        });

        console.log("Päivämäärä ennen tapahtuman julkaisua:", isoDate);

        if (entriesCount >= 1) {
            // Jos päivällä on merkintöjä, näytä merkintälista
            eventBus.publish('entries:list', { date: isoDate, entries: dayEntries });
        } else {
            // Jos päivällä ei ole merkintöjä, näytä uuden merkinnän lomake
            eventBus.publish('date:selected', isoDate);
        }
    }

    static refreshCalendar() {
        if (this.updateCalendarFunction) {
            console.log("Calendar: Päivitetään kalenteri manuaalisesti");
            this.updateCalendarFunction();

            // Päivitä myös kuukauden tieto
            this.publishCurrentMonth();
        }
    }

    // Siivousfunktio komponenttien tuhoamisen yhteydessä
    static cleanup() {
        // Peruuta tapahtumankäsittelijät
        if (this.entriesUpdateUnsubscribe) {
            this.entriesUpdateUnsubscribe();
            this.entriesUpdateUnsubscribe = null;
        }

        this.entriesUpdatedSubscribed = false;
    }
}
