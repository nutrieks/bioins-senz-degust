
import { supabase } from '@/integrations/supabase/client';
import { dataCache } from '@/utils/dataCache';
import { Event, ProductType, Sample, JARAttribute, EventStatus, RetailerCode } from '@/types';

interface EventWithData {
  event: Event;
  productTypes: ProductType[];
  allSamples: Sample[];
  jarAttributes: JARAttribute[];
}

export async function getEventWithAllData(eventId: string): Promise<EventWithData | null> {
  const cacheKey = `event-data-${eventId}`;
  
  // Check cache first
  const cached = dataCache.get<EventWithData>(cacheKey);
  if (cached) {
    console.log('Using cached event data for:', eventId);
    return cached;
  }

  try {
    console.log('=== OPTIMIZED: Fetching event data in parallel ===');
    
    // Fetch all data in parallel instead of sequentially
    const [eventResult, productTypesResult, samplesResult, jarAttributesResult] = await Promise.all([
      // Fetch event
      supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single(),
      
      // Fetch product types
      supabase
        .from('product_types')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order'),
      
      // Fetch all samples for this event
      supabase
        .from('samples')
        .select(`
          *,
          product_types!inner(event_id)
        `)
        .eq('product_types.event_id', eventId),
      
      // Fetch JAR attributes for all product types in this event
      supabase
        .from('jar_attributes')
        .select(`
          *,
          product_types!inner(event_id)
        `)
        .eq('product_types.event_id', eventId)
    ]);

    if (eventResult.error) throw eventResult.error;
    if (productTypesResult.error) throw productTypesResult.error;
    if (samplesResult.error) throw samplesResult.error;
    if (jarAttributesResult.error) throw jarAttributesResult.error;

    if (!eventResult.data) return null;

    const eventData: EventWithData = {
      event: {
        id: eventResult.data.id,
        date: eventResult.data.date,
        status: eventResult.data.status as EventStatus,
        randomizationComplete: eventResult.data.randomization_complete,
        productTypesCount: productTypesResult.data?.length || 0,
        productTypes: [],
        createdAt: eventResult.data.created_at
      },
      productTypes: (productTypesResult.data || []).map(pt => ({
        id: pt.id,
        eventId: pt.event_id,
        productName: pt.product_name,
        customerCode: pt.customer_code,
        baseCode: pt.base_code,
        baseProductTypeId: pt.base_product_type_id,
        displayOrder: pt.display_order,
        hasRandomization: pt.has_randomization,
        samples: [],
        jarAttributes: []
      })),
      allSamples: (samplesResult.data || []).map(sample => ({
        id: sample.id,
        productTypeId: sample.product_type_id,
        brand: sample.brand,
        retailerCode: sample.retailer_code as RetailerCode,
        blindCode: sample.blind_code,
        images: {
          packaging: sample.images_packaging,
          prepared: sample.images_prepared,
          details: sample.images_details || []
        }
      })),
      jarAttributes: (jarAttributesResult.data || []).map(attr => ({
        id: attr.id,
        productTypeId: attr.product_type_id,
        baseProductTypeId: attr.base_product_type_id,
        nameEN: attr.name_en,
        nameHR: attr.name_hr,
        scaleEN: attr.scale_en as [string, string, string, string, string],
        scaleHR: attr.scale_hr as [string, string, string, string, string]
      }))
    };

    // Cache the result
    dataCache.set(cacheKey, eventData, 3 * 60 * 1000); // Cache for 3 minutes
    
    console.log('=== OPTIMIZED: Event data fetched and cached ===');
    console.log('Product types:', eventData.productTypes.length);
    console.log('Samples:', eventData.allSamples.length);
    console.log('JAR attributes:', eventData.jarAttributes.length);
    
    return eventData;
  } catch (error) {
    console.error('=== ERROR: Optimized event data fetch ===', error);
    return null;
  }
}

export async function getCompletedEvaluationsOptimized(
  eventId: string,
  userId: string
): Promise<string[]> {
  const cacheKey = `completed-evaluations-${eventId}-${userId}`;
  
  // Check cache first (shorter TTL for evaluation data)
  const cached = dataCache.get<string[]>(cacheKey);
  if (cached) {
    console.log('Using cached completed evaluations for user:', userId);
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select('sample_id')
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    const completedSampleIds = (data || []).map(e => e.sample_id);
    
    // Cache for 30 seconds (evaluation data changes frequently)
    dataCache.set(cacheKey, completedSampleIds, 30 * 1000);
    
    return completedSampleIds;
  } catch (error) {
    console.error('Error fetching completed evaluations:', error);
    return [];
  }
}
