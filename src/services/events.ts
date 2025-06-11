
import { 
  createEvent as createEventSupabase, 
  getEvents as getEventsSupabase, 
  getEvent as getEventSupabase,
  updateEventStatus as updateEventStatusSupabase,
  deleteEvent as deleteEventSupabase
} from './supabase/events';
import { Event, EventStatus } from '@/types';

export async function createEvent(date: string): Promise<Event> {
  return await createEventSupabase(date);
}

export async function getEvent(eventId: string): Promise<Event | null> {
  return await getEventSupabase(eventId);
}

export async function getEvents(): Promise<Event[]> {
  return await getEventsSupabase();
}

export async function updateEventStatus(eventId: string, status: EventStatus): Promise<boolean> {
  return await updateEventStatusSupabase(eventId, status);
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  return await deleteEventSupabase(eventId);
}
