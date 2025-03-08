import entryService from "../services/EntryService.js";
import { eventBus } from "../core/EventBus.js";
import { DateUtils } from "../utils/DateUtils.js";

export class Calendar {
   static entries = [];
   static entriesLastLoaded = null;
   static currentDate = new Date();
   static updateCalendarFunction = null;
   static entriesUpdateUnsubscribe = null;
   static entriesUpdatedSubscribed = false;

   /**
    * Renders the calendar HTML structure
    * @returns {string} HTML structure for the calendar
    */
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
                <div class="day">Mon</div>
                <div class="day">Tue</div>
                <div class="day">Wed</div>
                <div class="day">Thu</div>
                <div class="day">Fri</div>
                <div class="day">Sat</div>
                <div class="day">Sun</div>
            </div>
            <div class="dates" id="dates"></div>
        </div>
        `;
   }

   /**
    * Initializes the calendar component and sets up event listeners
    * Creates the calendar UI and registers event handlers
    */
   static initialize() {
      const monthYearElement = document.querySelector(".monthYear");
      const datesElement = document.querySelector("#dates");
      const prevBtn = document.querySelector("#prevBtn");
      const nextBtn = document.querySelector("#nextBtn");

      // Load entries if they haven't been loaded yet
      if (!this.entries || this.entries.length === 0) {
         this.loadEntries();
      }

      this.updateCalendarFunction = () => {
         const currentYear = this.currentDate.getFullYear();
         const currentMonth = this.currentDate.getMonth();

         // Get month information
         const { firstDay, lastDay, daysInMonth } = DateUtils.getMonthRange(
            currentYear,
            currentMonth
         );

         // Determine the weekday of the first day of the month (0 = Mon, 6 = Sun)
         const firstDayDate = new Date(currentYear, currentMonth, 1);
         let firstDayIndex = firstDayDate.getDay() - 1;
         if (firstDayIndex < 0) firstDayIndex = 6;

         // Determine the weekday of the last day of the month
         let lastDayIndex =
            new Date(currentYear, currentMonth + 1, 0).getDay() - 1;
         if (lastDayIndex < 0) lastDayIndex = 6;

         // Display month and year
         const monthYearString = this.currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
         });
         monthYearElement.textContent = monthYearString;

         let datesHTML = "";

         // Previous month's days
         const prevMonthLastDay = new Date(
            currentYear,
            currentMonth,
            0
         ).getDate();
         for (let i = 0; i < firstDayIndex; i++) {
            const dayNum = prevMonthLastDay - firstDayIndex + i + 1;
            datesHTML += `<div class="date inactive">${dayNum}</div>`;
         }

         const today = DateUtils.today();

         // Current month's days
         for (let i = 1; i <= daysInMonth; i++) {
            // Use DateUtils class to create date
            const dateString = DateUtils.createDate(
               currentYear,
               currentMonth,
               i
            );

            // Find entries for the day
            const dayEntries = this.entries.filter((entry) => {
               if (!entry.entry_date) return false;
               return DateUtils.isSameDay(entry.entry_date, dateString);
            });

            const entryCount = dayEntries.length;
            const isToday = DateUtils.isSameDay(dateString, today);
            const activeClass = isToday ? "active" : "";
            const entryClass = entryCount > 0 ? "has-entry" : "";
            const multiEntryClass = entryCount > 1 ? "multi-entry" : "";
            const entryCountHtml =
               entryCount > 1
                  ? `<span class="entry-count">${entryCount}</span>`
                  : "";

            datesHTML += `
                    <div class="date ${activeClass} ${entryClass} ${multiEntryClass}" data-date="${dateString}" data-entries="${entryCount}">
                        ${i}
                        ${entryCountHtml}
                    </div>
                `;
         }

         // Next month's days
         const nextDays = 7 - ((firstDayIndex + daysInMonth) % 7);
         if (nextDays < 7) {
            for (let i = 1; i <= nextDays; i++) {
               datesHTML += `<div class="date inactive">${i}</div>`;
            }
         }

         datesElement.innerHTML = datesHTML;

         // Add event handlers to calendar days
         document
            .querySelectorAll(".date:not(.inactive)")
            .forEach((dateElement) => {
               dateElement.addEventListener("click", () => {
                  const selectedDate = dateElement.getAttribute("data-date");
                  const entriesCount = parseInt(
                     dateElement.getAttribute("data-entries") || "0"
                  );
                  this.handleDateClick(selectedDate, entriesCount);
               });
            });
      };

      // Update calendar for the first time
      this.updateCalendarFunction();

      // Publish current month information
      this.publishCurrentMonth();

      // Add event handlers for previous/next buttons
      prevBtn.addEventListener("click", () => {
         this.currentDate.setMonth(this.currentDate.getMonth() - 1);
         this.updateCalendarFunction();

         // Publish month change information
         this.publishCurrentMonth();
      });

      nextBtn.addEventListener("click", () => {
         this.currentDate.setMonth(this.currentDate.getMonth() + 1);
         this.updateCalendarFunction();

         // Publish month change information
         this.publishCurrentMonth();
      });

      // Register entries update event handler only once
      if (!this.entriesUpdatedSubscribed) {
         // Remove previous subscriptions if they exist
         if (this.entriesUpdateUnsubscribe) {
            this.entriesUpdateUnsubscribe();
         }

         // Register new subscriber and store unsubscribe function
         this.entriesUpdateUnsubscribe = eventBus.subscribe(
            "entries:updated",
            async (entries) => {
               if (entries) {
                  this.entries = entries;
                  console.log("Calendar: Entries updated, refreshing calendar");
               } else {
                  await this.loadEntries();
               }
               this.updateCalendarFunction();

               // Update chart with new entries as well
               this.publishCurrentMonth();
            }
         );

         this.entriesUpdatedSubscribed = true;
      }
   }

   /**
    * Publishes current month information to the event bus
    * Allows other components to react to month changes
    */
   static publishCurrentMonth() {
      eventBus.publish("calendar:month-changed", {
         year: this.currentDate.getFullYear(),
         month: this.currentDate.getMonth(),
         entries: this.entries,
      });
   }

   /**
    * Loads entries from the server with caching
    * @returns {Promise<Array>} Array of entries
    */
   static async loadEntries() {
      const now = new Date();
      const cacheTime = 30 * 1000; // 30 seconds

      try {
         if (
            !this.entries ||
            !this.entries.length ||
            !this.entriesLastLoaded ||
            now - this.entriesLastLoaded > cacheTime
         ) {
            console.log("Calendar: Loading entries from server");
            this.entries = await entryService.getAllEntries();
            this.entriesLastLoaded = now;
         }
         return this.entries;
      } catch (error) {
         console.error("Error fetching entries:", error);
         this.entries = [];
         return [];
      }
   }

   /**
    * Handles date click events in the calendar
    * Triggers appropriate events based on whether the date has entries
    * @param {string} date - The selected date
    * @param {number} entriesCount - Number of entries for the selected date
    */
   static handleDateClick(date, entriesCount) {
      console.log("Date clicked in calendar:", date);

      // Ensure date is always in ISO format
      const isoDate = DateUtils.toISODate(date);

      // Find entries for the day
      const dayEntries = this.entries.filter((entry) => {
         if (!entry.entry_date) return false;
         return DateUtils.isSameDay(entry.entry_date, isoDate);
      });

      console.log("Date before publishing event:", isoDate);

      if (entriesCount >= 1) {
         // If the day has entries, show the entry list
         eventBus.publish("entries:list", {
            date: isoDate,
            entries: dayEntries,
         });
      } else {
         // If the day has no entries, show the new entry form
         eventBus.publish("date:selected", isoDate);
      }
   }

   /**
    * Manually refreshes the calendar display
    * Updates both the calendar UI and publishes the current month
    */
   static refreshCalendar() {
      if (this.updateCalendarFunction) {
         console.log("Calendar: Manually refreshing calendar");
         this.updateCalendarFunction();

         // Update month information as well
         this.publishCurrentMonth();
      }
   }

   /**
    * Cleans up event listeners when the component is destroyed
    * Prevents memory leaks by properly unsubscribing from events
    */
   static cleanup() {
      // Cancel event handlers
      if (this.entriesUpdateUnsubscribe) {
         this.entriesUpdateUnsubscribe();
         this.entriesUpdateUnsubscribe = null;
      }

      this.entriesUpdatedSubscribed = false;
   }
}
