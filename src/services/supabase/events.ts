import { supabase } from '@/integrations/supabase/client'
import { Event, EventStatus } from '@/types'

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getEvents(): Promise<Event[]> {
  try {
    // First get all events
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })

    if (eventsError) throw eventsError

    // For each event, get the count of product types
    const eventsWithProductCount = await Promise.all(
      (eventsData || []).map(async (eventData: any) => {
        const { count: productCount } = await supabase
          .from('product_types')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventData.id)

        return {
          id: eventData.id,
          date: eventData.date,
          status: eventData.status as EventStatus,
          productTypes: [], // Keep empty array for compatibility
          productTypesCount: productCount || 0, // Add the actual count
          createdAt: eventData.created_at,
          randomizationComplete: eventData.randomization_complete
        }
      })
    )

    return eventsWithProductCount
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      date: data.date,
      status: data.status as EventStatus,
      productTypes: [], // Will be loaded separately
      createdAt: data.created_at,
      randomizationComplete: data.randomization_complete
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export async function createEvent(date: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      date,
      status: EventStatus.PREPARATION,
      randomization_complete: false
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    date: data.date,
    status: data.status as EventStatus,
    productTypes: [],
    createdAt: data.created_at,
    randomizationComplete: data.randomization_complete
  }
}

export async function updateEventStatus(eventId: string, status: EventStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', eventId)

    return !error
  } catch (error) {
    console.error('Error updating event status:', error)
    return false
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    console.log('Deleting event:', eventId);
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    console.log('Event deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}
