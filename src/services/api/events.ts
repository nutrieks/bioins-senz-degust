
import { Event, EventStatus } from "../../types";
import { events } from "../mock";

// Helper function for delaying operations (for simulating network requests)
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Event Management
export async function getEvents(): Promise<Event[]> {
  return [...events];
}

export async function getEvent(eventId: string): Promise<Event | null> {
  return events.find(e => e.id === eventId) || null;
}

export async function createEvent(date: string): Promise<Event> {
  const newEvent: Event = {
    id: `event_${Date.now()}`,
    date,
    status: EventStatus.PREPARATION,
    productTypes: [],
    createdAt: new Date().toISOString(),
    randomizationComplete: false
  };
  
  events.push(newEvent);
  return newEvent;
}

export async function updateEventStatus(eventId: string, status: EventStatus): Promise<boolean> {
  const event = events.find(e => e.id === eventId);
  if (!event) return false;
  
  event.status = status;
  return true;
}
