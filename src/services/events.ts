
import { centralizedEventService } from './centralizedEventService';
import { Event, EventStatus } from '@/types';

// All event operations now go through the centralized service
export async function createEvent(date: string): Promise<Event> {
  return await centralizedEventService.createEvent(date);
}

export async function getEvent(eventId: string): Promise<Event | null> {
  return await centralizedEventService.getEvent(eventId);
}

export async function getEvents(): Promise<Event[]> {
  return await centralizedEventService.getEvents();
}

export async function updateEventStatus(eventId: string, status: EventStatus): Promise<boolean> {
  return await centralizedEventService.updateEventStatus(eventId, status);
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  return await centralizedEventService.deleteEvent(eventId);
}
