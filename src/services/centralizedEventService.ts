import { QueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { Event, EventStatus } from '@/types';

/**
 * Centralized Event Service - Single source of truth for all event operations
 * This service ensures consistent cache management and data flow across the app
 */
class CentralizedEventService {
  private queryClient: QueryClient | null = null;

  // Set the query client instance
  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  // Create event with immediate cache update
  async createEvent(date: string): Promise<Event> {
    console.log('CentralizedEventService: Creating event for date:', date);
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        date,
        status: EventStatus.PREPARATION,
        randomization_complete: false
      })
      .select()
      .single();

    if (error) {
      console.error('CentralizedEventService: Error creating event:', error);
      throw error;
    }

    const newEvent: Event = {
      id: data.id,
      date: data.date,
      status: data.status as EventStatus,
      productTypes: [],
      createdAt: data.created_at,
      randomizationComplete: data.randomization_complete
    };

    console.log('CentralizedEventService: Event created successfully:', newEvent);

    // Immediately update cache with the new event
    if (this.queryClient) {
      // Set the new event in cache immediately
      this.queryClient.setQueryData(['event', newEvent.id], newEvent);
      console.log('CentralizedEventService: Event cached with key:', ['event', newEvent.id]);
      
      // Invalidate events list to trigger refetch
      this.queryClient.invalidateQueries({ queryKey: ['events'] });
      console.log('CentralizedEventService: Events list invalidated');
    }

    return newEvent;
  }

  // Get single event with fallback logic
  async getEvent(eventId: string): Promise<Event | null> {
    console.log('CentralizedEventService: Fetching event with ID:', eventId);

    // First check cache if query client is available
    if (this.queryClient) {
      const cachedEvent = this.queryClient.getQueryData(['event', eventId]) as Event | undefined;
      if (cachedEvent) {
        console.log('CentralizedEventService: Found event in cache:', cachedEvent);
        return cachedEvent;
      }
    }

    // Fetch from database
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error || !data) {
        console.log('CentralizedEventService: Event not found in database:', eventId);
        return null;
      }

      const event: Event = {
        id: data.id,
        date: data.date,
        status: data.status as EventStatus,
        productTypes: [], // Will be loaded separately
        createdAt: data.created_at,
        randomizationComplete: data.randomization_complete
      };

      console.log('CentralizedEventService: Event fetched from database:', event);

      // Update cache
      if (this.queryClient) {
        this.queryClient.setQueryData(['event', eventId], event);
        console.log('CentralizedEventService: Event cached after database fetch');
      }

      return event;
    } catch (error) {
      console.error('CentralizedEventService: Error fetching event:', error);
      return null;
    }
  }

  // Get all events
  async getEvents(): Promise<Event[]> {
    console.log('CentralizedEventService: Fetching all events');

    try {
      // First get all events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (eventsError) throw eventsError;

      // For each event, get the count of product types and samples
      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (eventData: any) => {
          const { count: productCount } = await supabase
            .from('product_types')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventData.id);

          // Get samples count by joining product_types and samples
          const { count: samplesCount } = await supabase
            .from('samples')
            .select('*, product_types!inner(*)', { count: 'exact', head: true })
            .eq('product_types.event_id', eventData.id);

          const event: Event = {
            id: eventData.id,
            date: eventData.date,
            status: eventData.status as EventStatus,
            productTypes: [], // Keep empty array for compatibility
            productTypesCount: productCount || 0, // Add the actual count
            samplesCount: samplesCount || 0, // Add samples count
            createdAt: eventData.created_at,
            randomizationComplete: eventData.randomization_complete
          };

          // Update individual event cache
          if (this.queryClient) {
            this.queryClient.setQueryData(['event', event.id], event);
          }

          return event;
        })
      );

      console.log('CentralizedEventService: Fetched', eventsWithCounts.length, 'events');
      return eventsWithCounts;
    } catch (error) {
      console.error('CentralizedEventService: Error fetching events:', error);
      return [];
    }
  }

  // Update event status
  async updateEventStatus(eventId: string, status: EventStatus): Promise<boolean> {
    console.log('CentralizedEventService: Updating event status:', eventId, status);

    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId);

      if (error) {
        console.error('CentralizedEventService: Error updating event status:', error);
        return false;
      }

      // Update cache
      if (this.queryClient) {
        // Get current cached event and update its status
        const currentEvent = this.queryClient.getQueryData(['event', eventId]) as Event | undefined;
        if (currentEvent) {
          const updatedEvent = { ...currentEvent, status };
          this.queryClient.setQueryData(['event', eventId], updatedEvent);
          console.log('CentralizedEventService: Event status updated in cache');
        }

        // Invalidate events list
        this.queryClient.invalidateQueries({ queryKey: ['events'] });
      }

      console.log('CentralizedEventService: Event status updated successfully');
      return true;
    } catch (error) {
      console.error('CentralizedEventService: Error updating event status:', error);
      return false;
    }
  }

  // Delete event
  async deleteEvent(eventId: string): Promise<boolean> {
    console.log('CentralizedEventService: Deleting event:', eventId);

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('CentralizedEventService: Error deleting event:', error);
        return false;
      }

      // Remove from cache
      if (this.queryClient) {
        this.queryClient.removeQueries({ queryKey: ['event', eventId] });
        this.queryClient.invalidateQueries({ queryKey: ['events'] });
        console.log('CentralizedEventService: Event removed from cache');
      }

      console.log('CentralizedEventService: Event deleted successfully');
      return true;
    } catch (error) {
      console.error('CentralizedEventService: Error deleting event:', error);
      return false;
    }
  }

  // Check if event exists in cache
  isEventCached(eventId: string): boolean {
    if (!this.queryClient) return false;
    
    const cachedEvent = this.queryClient.getQueryData(['event', eventId]);
    return !!cachedEvent;
  }

  // Wait for event to be available in cache (with timeout)
  async waitForEventInCache(eventId: string, maxWaitMs: number = 2000): Promise<Event | null> {
    console.log('CentralizedEventService: Waiting for event in cache:', eventId);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      if (this.isEventCached(eventId)) {
        const event = this.queryClient?.getQueryData(['event', eventId]) as Event;
        console.log('CentralizedEventService: Event found in cache:', event);
        return event;
      }
      
      // Wait 50ms before checking again
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('CentralizedEventService: Timeout waiting for event in cache');
    return null;
  }
}

// Export singleton instance
export const centralizedEventService = new CentralizedEventService();