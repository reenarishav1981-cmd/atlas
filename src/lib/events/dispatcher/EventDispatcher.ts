import { EventEmitter } from "events";
import { DomainEvent } from "../types";

export type EventListenerCallback<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export interface IEventDispatcher {
  dispatch<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventName: string, listener: EventListenerCallback<T>): void;
  unsubscribe<T>(eventName: string, listener: EventListenerCallback<T>): void;
}

class LocalEventDispatcher implements IEventDispatcher {
  private emitter = new EventEmitter();

  constructor() {
    // Limit warnings check if subscription list grows
    this.emitter.setMaxListeners(50);
  }

  /**
   * Dispatches an event to all registered listeners asynchronously.
   * Safety: listener execution is isolated inside try-catch to prevent main request crashes.
   */
  async dispatch<T>(event: DomainEvent<T>): Promise<void> {
    const listeners = this.emitter.listeners(event.eventName);
    
    // Execute all listeners in parallel, isolated
    const promises = listeners.map(async (listenerFn) => {
      try {
        await (listenerFn as EventListenerCallback<T>)(event);
      } catch (err) {
        console.error(
          `[EventDispatcher] Listener error on event "${event.eventName}" for eventId "${event.eventId}":`,
          err
        );
      }
    });

    // Run concurrently without blocking or failing the orchestrating dispatch
    await Promise.allSettled(promises);
  }

  /**
   * Register a new listener for a given event name.
   */
  subscribe<T>(eventName: string, listener: EventListenerCallback<T>): void {
    this.emitter.on(eventName, listener);
  }

  /**
   * Deregister a listener from an event name.
   */
  unsubscribe<T>(eventName: string, listener: EventListenerCallback<T>): void {
    this.emitter.off(eventName, listener);
  }
}

// Export singleton dispatcher instance
export const eventDispatcher: IEventDispatcher = new LocalEventDispatcher();
