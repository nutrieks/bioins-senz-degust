import { supabase } from '@/integrations/supabase/client'
import { Evaluation, EvaluationSubmission, EvaluationStatus } from '@/types'

export async function getCompletedEvaluations(
  eventId: string,
  userId?: string
): Promise<Evaluation[]> {
  try {
    console.log('=== SUPABASE getCompletedEvaluations ===');
    console.log('Event ID:', eventId);
    console.log('User ID:', userId);
    
    let query = supabase
      .from('evaluations')
      .select('*')
      .eq('event_id', eventId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }

    console.log('Evaluations fetched from database:', data?.length || 0);
    console.log('Raw evaluation data:', data);

    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      sampleId: item.sample_id,
      productTypeId: item.product_type_id,
      eventId: item.event_id,
      hedonic: {
        appearance: item.hedonic_appearance,
        odor: item.hedonic_odor,
        texture: item.hedonic_texture,
        flavor: item.hedonic_flavor,
        overallLiking: item.hedonic_overall_liking
      },
      jar: item.jar_ratings || {},
      timestamp: item.timestamp
    }));
  } catch (error) {
    console.error('=== ERROR getCompletedEvaluations ===');
    console.error('Error details:', error);
    return [];
  }
}

export async function submitEvaluation(evaluation: EvaluationSubmission): Promise<boolean> {
  try {
    console.log('=== SUPABASE submitEvaluation (with duplicate protection) ===');
    console.log('Evaluation data to insert:', evaluation);

    // Validate required fields
    if (!evaluation) {
      throw new Error('Evaluation data is missing');
    }

    const { userId, sampleId, productTypeId, eventId, hedonicRatings, jarRatings } = evaluation;

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!sampleId) {
      throw new Error('Sample ID is required');
    }

    if (!productTypeId) {
      throw new Error('Product Type ID is required');
    }

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    if (!hedonicRatings || typeof hedonicRatings !== 'object') {
      throw new Error('Hedonic ratings are required and must be an object');
    }

    // Validate hedonic ratings structure and values
    const requiredHedonicFields = ['appearance', 'odor', 'texture', 'flavor', 'overallLiking'];
    for (const field of requiredHedonicFields) {
      const value = hedonicRatings[field as keyof typeof hedonicRatings];
      if (typeof value !== 'number' || isNaN(value) || value < 1 || value > 9) {
        throw new Error(`Invalid hedonic rating for ${field}: ${value}. Must be a number between 1 and 9.`);
      }
    }

    // Validate JAR ratings if provided
    if (jarRatings && typeof jarRatings === 'object') {
      Object.entries(jarRatings).forEach(([attrId, value]) => {
        if (typeof value !== 'number' || isNaN(value) || value < 1 || value > 5) {
          console.warn(`Invalid JAR rating for ${attrId}: ${value}. Skipping this rating.`);
          delete jarRatings[attrId];
        }
      });
    }

    // Check for existing evaluation first (duplicate prevention)
    console.log('Checking for existing evaluation...');
    const { data: existing, error: checkError } = await supabase
      .from('evaluations')
      .select('id')
      .eq('user_id', userId)
      .eq('sample_id', sampleId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing evaluation:', checkError);
      throw new Error(`Database error during duplicate check: ${checkError.message}`);
    }

    if (existing) {
      console.log('Duplicate evaluation detected:', existing.id);
      throw new Error('Ovaj uzorak je već ocijenjen. Ne možete ga ocijeniti ponovno.');
    }

    const insertData = {
      user_id: userId,
      sample_id: sampleId,
      product_type_id: productTypeId,
      event_id: eventId,
      hedonic_appearance: hedonicRatings.appearance,
      hedonic_odor: hedonicRatings.odor,
      hedonic_texture: hedonicRatings.texture,
      hedonic_flavor: hedonicRatings.flavor,
      hedonic_overall_liking: hedonicRatings.overallLiking,
      jar_ratings: jarRatings || {}
    };

    console.log('Inserting validated data into evaluations table:', insertData);

    // Insert with detailed error handling
    const { data, error } = await supabase
      .from('evaluations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error submitting evaluation:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error message:', error.message);

      if (error.code === '42501') {
        throw new Error('Nemate dozvolu za spremanje ocjena. Molimo kontaktirajte administratora.');
      } else if (error.code === '23505' && error.message.includes('unique_user_sample_evaluation')) {
        // Handle unique constraint violation
        throw new Error('Ovaj uzorak je već ocijenjen. Molimo osvježite stranicu.');
      } else {
        throw new Error(`Greška pri spremanju: ${error.message}`);
      }
    }

    if (!data) {
      throw new Error('No data returned from database after insertion');
    }

    console.log('Evaluation submitted successfully:', data);
    return true;
  } catch (error) {
    console.error('=== ERROR submitEvaluation ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

export async function getEvaluationsStatus(eventId: string): Promise<EvaluationStatus[]> {
  try {
    console.log('=== SUPABASE getEvaluationsStatus ===');
    console.log('Event ID:', eventId);
    
    // Get all users who are evaluators
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'EVALUATOR')
      .eq('is_active', true)
      .order('evaluator_position');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    // Get all product types for this event with their samples
    const { data: productTypes, error: ptError } = await supabase
      .from('product_types')
      .select(`
        id,
        product_name,
        samples (*)
      `)
      .eq('event_id', eventId)
      .order('display_order');

    if (ptError) {
      console.error('Error fetching product types:', ptError);
      throw ptError;
    }

    // Get all evaluations for this event with real-time refresh
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('user_id, sample_id, product_type_id, timestamp')
      .eq('event_id', eventId)
      .order('timestamp', { ascending: false });

    if (evalError) {
      console.error('Error fetching evaluations:', evalError);
      throw evalError;
    }

    console.log('Fetched data for evaluation status:');
    console.log('Users:', users?.length);
    console.log('Product types:', productTypes?.length);
    console.log('Evaluations:', evaluations?.length);

    // Build evaluation status for each user
    const evaluationStatus: EvaluationStatus[] = (users || []).map(user => {
      const userEvaluations = (evaluations || []).filter(e => e.user_id === user.id);
      const completedSampleIds = new Set(userEvaluations.map(e => e.sample_id));

      const completedSamples = (productTypes || []).map(pt => ({
        productTypeName: pt.product_name,
        productTypeId: pt.id,
        samples: (pt.samples || []).map((sample: any) => ({
          sampleId: sample.id,
          blindCode: sample.blind_code || `${pt.product_name}-${sample.brand}`,
          isCompleted: completedSampleIds.has(sample.id)
        }))
      }));

      const totalSamples = completedSamples.reduce((sum, pt) => sum + pt.samples.length, 0);
      const totalCompleted = userEvaluations.length;

      return {
        userId: user.id,
        username: user.username,
        position: user.evaluator_position || 0,
        completedSamples,
        totalCompleted,
        totalSamples
      };
    });

    console.log('Evaluation status calculated for', evaluationStatus.length, 'users');
    return evaluationStatus;
  } catch (error) {
    console.error('=== ERROR getEvaluationsStatus ===');
    console.error('Error details:', error);
    return [];
  }
}
