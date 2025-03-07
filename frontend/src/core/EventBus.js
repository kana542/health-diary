export default class EventBus {
   constructor() {
       this.events = {};
   }

   subscribe(event, callback) {
       if (!this.events[event]) {
           this.events[event] = [];
       }
       this.events[event].push(callback);

       return () => {
           this.events[event] = this.events[event].filter(cb => cb !== callback);
       };
   }

   publish(event, data) {
       if (this.events[event]) {
           this.events[event].forEach(callback => callback(data));
       }
   }
}

export const eventBus = new EventBus();
