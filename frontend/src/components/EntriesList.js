import { eventBus } from "../core/EventBus.js";
import entryService from "../services/EntryService.js";
import { DateUtils } from "../utils/DateUtils.js";

/**
 * Class responsible for rendering and managing the list of diary entries for a specific date
 * Uses event bus system for communication with other components
 */
export class EntriesList {
   /**
    * Renders a list of entries for a specific date
    * @param {string} date - The date for which to display entries
    * @param {Array} entries - List of entry objects to display
    * @returns {string} HTML for the entries list
    */
   static render(date, entries) {
      // Ensure date is in ISO format for consistent handling
      const isoDate = DateUtils.toISODate(date);

      // Format date for user-friendly display (e.g., "January 15, 2025")
      const formattedDate = DateUtils.formatDisplayDate(isoDate);

      let entriesHtml = "";

      // Sort entries from newest to oldest based on creation timestamp
      // This ensures most recent entries appear at the top of the list
      const sortedEntries = [...entries].sort((a, b) => {
         return new Date(b.created_at) - new Date(a.created_at);
      });

      // Generate HTML for each entry in the list
      sortedEntries.forEach((entry) => {
         // Format creation time to show only hours and minutes (e.g., "14:30")
         const entryTime = entry.created_at
            ? new Date(entry.created_at).toLocaleTimeString("en-US", {
                 hour: "2-digit",
                 minute: "2-digit",
              })
            : "";

         // Determine appropriate mood icon and text based on mood value
         // Each mood has a specific icon and color for visual identification
         let moodIcon = "";
         let moodText = "";

         switch (entry.mood) {
            case "Happy":
               moodIcon =
                  '<box-icon name="happy" type="solid" color="#38b000"></box-icon>';
               moodText = "Happy";
               break;
            case "Satisfied":
               moodIcon =
                  '<box-icon name="smile" type="solid" color="#5fa8d3"></box-icon>';
               moodText = "Satisfied";
               break;
            case "Neutral":
               moodIcon =
                  '<box-icon name="confused" type="solid" color="#ffd166"></box-icon>';
               moodText = "Neutral";
               break;
            case "Tired":
               moodIcon =
                  '<box-icon name="tired" type="solid" color="#f77f00"></box-icon>';
               moodText = "Tired";
               break;
            case "Sad":
               moodIcon =
                  '<box-icon name="sad" type="solid" color="#d62828"></box-icon>';
               moodText = "Sad";
               break;
            default:
               // Fallback for undefined or unknown mood values
               moodIcon =
                  '<box-icon name="help" type="solid" color="#6c757d"></box-icon>';
               moodText = "Not defined";
         }

         // Create list item HTML with all entry details
         // Each entry shows time, mood, weight, sleep hours, and notes preview
         entriesHtml += `
                <div class="entry-item" data-entry-id="${entry.entry_id}">
                    <div class="entry-item-content">
                        <div class="entry-time">${entryTime}</div>
                        <div class="entry-mood">
                            ${moodIcon}
                            <span>${moodText}</span>
                        </div>
                        <div class="entry-stats">
                            ${
                               entry.weight
                                  ? `<div><box-icon name="trending-up" color="#777"></box-icon> ${entry.weight} kg</div>`
                                  : ""
                            }
                            ${
                               entry.sleep_hours
                                  ? `<div><box-icon name="moon" color="#777"></box-icon> ${entry.sleep_hours} h</div>`
                                  : ""
                            }
                        </div>
                        <div class="entry-preview">
                            ${
                               entry.notes
                                  ? entry.notes.length > 30
                                     ? entry.notes.substring(0, 30) + "..."
                                     : entry.notes
                                  : ""
                            }
                        </div>
                    </div>
                    <button class="delete-entry-button" data-entry-id="${
                       entry.entry_id
                    }">
                        <box-icon name="trash" color="white"></box-icon>
                    </button>
                </div>
            `;
      });

      // Create the complete entries list container with header, content, and footer
      return `
            <div class="entries-list-container">
                <div class="entries-list-header">
                    <h2>${formattedDate}</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="entries-list">
                    ${
                       entriesHtml ||
                       '<div class="no-entries">No entries for this day</div>'
                    }
                </div>
                <div class="entries-list-footer">
                    <button id="add-entry-button" class="btn-add">
                        <box-icon name="plus" color="white"></box-icon>
                    </button>
                </div>
            </div>
        `;
   }

   /**
    * Initializes event handlers for the entries list
    * Sets up click handlers for close button, entries, and delete buttons
    * @param {string} date - The date for which entries are displayed
    * @param {Array} entries - List of entry objects
    */
   static initialize(date, entries) {
      // Ensure date is in ISO format for consistent handling across components
      const isoDate = DateUtils.toISODate(date);

      // Set up close button handler to hide the modal when clicked
      const closeBtn = document.querySelector(".entries-list-container .close");
      if (closeBtn) {
         closeBtn.addEventListener("click", () => {
            document.getElementById("entries-list-modal").style.display =
               "none";
         });
      }

      // Set up "Add entry" button handler
      // When clicked, hide the list modal and trigger the new entry form
      const addEntryBtn = document.getElementById("add-entry-button");
      if (addEntryBtn) {
         addEntryBtn.addEventListener("click", () => {
            // Hide the entries list modal
            document.getElementById("entries-list-modal").style.display =
               "none";

            // Publish event to show the entry form for this date
            // Using DateUtils to ensure consistent date format
            eventBus.publish("date:selected", isoDate);
         });
      }

      // Set up handlers for entry items
      // When an entry is clicked, open it in edit mode
      const entryItems = document.querySelectorAll(".entry-item-content");
      entryItems.forEach((item) => {
         item.addEventListener("click", () => {
            // Get the entry ID from the parent element's data attribute
            const entryId = item.parentElement.getAttribute("data-entry-id");

            // Find the selected entry in the entries array
            const selectedEntry = entries.find(
               (entry) => entry.entry_id.toString() === entryId
            );

            if (selectedEntry) {
               // Hide the entries list modal
               document.getElementById("entries-list-modal").style.display =
                  "none";

               // Publish event to show the entry in edit mode
               eventBus.publish("entry:selected", selectedEntry);
            }
         });
      });

      // Set up handlers for delete buttons
      // When a delete button is clicked, confirm and delete the entry
      const deleteButtons = document.querySelectorAll(".delete-entry-button");
      deleteButtons.forEach((button) => {
         button.addEventListener("click", async (e) => {
            // Prevent the click event from bubbling up to the parent entry item
            // This ensures clicking delete doesn't also trigger the edit mode
            e.stopPropagation();

            // Get the entry ID from the button's data attribute
            const entryId = button.getAttribute("data-entry-id");

            // Confirm deletion with the user before proceeding
            if (confirm("Are you sure you want to delete this entry?")) {
               try {
                  // Call the API to delete the entry
                  await entryService.deleteEntry(entryId);

                  // Update the local entries array by filtering out the deleted entry
                  const updatedEntries = entries.filter(
                     (entry) => entry.entry_id.toString() !== entryId
                  );

                  if (updatedEntries.length > 0) {
                     // If there are still entries for this date, update the list
                     this.updateList(isoDate, updatedEntries);
                  } else {
                     // If no entries remain, close the modal
                     document.getElementById(
                        "entries-list-modal"
                     ).style.display = "none";
                  }

                  // Clear the service cache and refresh all entries
                  // This ensures all components have the latest data
                  entryService.clearCache();
                  const allEntries = await entryService.getAllEntries();

                  // Publish event to notify other components of the update
                  // This will refresh the calendar and charts
                  eventBus.publish("entries:updated", allEntries);
               } catch (error) {
                  // Log and display error if deletion fails
                  console.error("Error deleting entry:", error);
                  alert("Entry deletion failed: " + error.message);
               }
            }
         });
      });
   }

   /**
    * Updates the entries list with new entries without full page reload
    * Used after deleting an entry to refresh the list
    * @param {string} date - The date for which to update entries
    * @param {Array} entries - New list of entry objects
    */
   static updateList(date, entries) {
      // Get the modal content container element
      const modalContent = document.querySelector(
         ".entries-list-modal-content"
      );

      // Replace the HTML with a new rendering based on updated entries
      modalContent.innerHTML = this.render(date, entries);

      // Re-initialize event handlers for the updated content
      this.initialize(date, entries);
   }
}
