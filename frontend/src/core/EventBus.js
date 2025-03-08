/**
 * EventBus implementation for publisher-subscriber pattern
 * Allows components to communicate without direct dependencies
 * Used for cross-component communication throughout the application
 */
export default class EventBus {
   /**
    * Creates a new EventBus instance
    * Initializes empty events storage
    */
   constructor() {
      // Storage for event callbacks, organized by event name
      this.events = {};
   }

   /**
    * Subscribes a callback function to a specific event
    * @param {string} event - The event name to subscribe to
    * @param {Function} callback - The function to be called when event is published
    * @returns {Function} Unsubscribe function to remove this specific subscription
    */
   subscribe(event, callback) {
      // Initialize array for this event if it doesn't exist yet
      if (!this.events[event]) {
         this.events[event] = [];
      }

      // Add callback to the array of subscribers for this event
      this.events[event].push(callback);

      // Return an unsubscribe function that removes this specific callback
      return () => {
         // Filter out this callback from the array when unsubscribe is called
         this.events[event] = this.events[event].filter(
            (cb) => cb !== callback
         );
      };
   }

   /**
    * Publishes an event with optional data to all subscribers
    * @param {string} event - The event name to publish
    * @param {*} data - Optional data to pass to subscribers
    */
   publish(event, data) {
      // Check if there are any subscribers for this event
      if (this.events[event]) {
         // Call each subscriber callback with the provided data
         this.events[event].forEach((callback) => callback(data));
      }
   }
}

/**
 * Singleton instance of EventBus
 * Used throughout the application for consistent event handling
 */
export const eventBus = new EventBus();
