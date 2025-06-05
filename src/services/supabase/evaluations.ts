
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

    console.log('Evaluations fetched:', data?.length || 0);

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
    console.log('=== SUPABASE submitEvaluation ===');
    console.log('Evaluation data:', evaluation);
    
    const { error } = await supabase
      .from('evaluations')
      .insert({
        user_id: evaluation.userId,
        sample_id: evaluation.sampleId,
        product_type_id: evaluation.productTypeId,
        event_id: evaluation.eventId,
        hedonic_appearance: evaluation.hedonicRatings.appearance,
        hedonic_odor: evaluation.hedonicRatings.odor,
        hedonic_texture: evaluation.hedonicRatings.texture,
        hedonic_flavor: evaluation.hedonicRatings.flavor,
        hedonic_overall_liking: evaluation.hedonicRatings.overallLiking,
        jar_ratings: evaluation.jarRatings
      });

    if (error) {
      console.error('Error submitting evaluation:', error);
      throw error;
    }

    console.log('Evaluation submitted successfully');
    return true;
  } catch (error) {
    console.error('=== ERROR submitEvaluation ===');
    console.error('Error details:', error);
    return false;
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

    // Get all evaluations for this event
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('user_id, sample_id, product_type_id')
      .eq('event_id', eventId);

    if (evalError) {
      console.error('Error fetching evaluations:', evalError);
      throw evalError;
    }

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
