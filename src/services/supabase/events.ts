
import { supabase } from '@/integrations/supabase/client'
import { Event, EventStatus } from '@/types'

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events' as any)
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    return data.map((eventData: any) => ({
      id: eventData.id,
      date: eventData.date,
      status: eventData.status as EventStatus,
      productTypes: [], // Will be loaded separately
      createdAt: eventData.created_at,
      randomizationComplete: eventData.randomization_complete
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events' as any)
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
    .from('events' as any)
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
      .from('events' as any)
      .update({ status })
      .eq('id', eventId)

    return !error
  } catch (error) {
    console.error('Error updating event status:', error)
    return false
  }
}
