
import { supabase } from '@/integrations/supabase/client'
import { Evaluation, EvaluationSubmission } from '@/types'

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
      hedonicRatings: {
        appearance: item.hedonic_appearance,
        odor: item.hedonic_odor,
        texture: item.hedonic_texture,
        flavor: item.hedonic_flavor,
        overallLiking: item.hedonic_overall_liking
      },
      jarRatings: item.jar_ratings || {},
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

export async function getEvaluationsStatus(eventId: string): Promise<{
  totalEvaluations: number;
  completedEvaluations: number;
  evaluationsByProductType: Record<string, { completed: number; total: number }>;
}> {
  try {
    console.log('=== SUPABASE getEvaluationsStatus ===');
    console.log('Event ID:', eventId);
    
    // Get all evaluations for this event
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('product_type_id')
      .eq('event_id', eventId);

    if (evalError) {
      console.error('Error fetching evaluations:', evalError);
      throw evalError;
    }

    // Get all product types for this event
    const { data: productTypes, error: ptError } = await supabase
      .from('product_types')
      .select('id, samples(*)')
      .eq('event_id', eventId);

    if (ptError) {
      console.error('Error fetching product types:', ptError);
      throw ptError;
    }

    // Get total number of users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'EVALUATOR')
      .eq('is_active', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    const totalUsers = users?.length || 0;
    const evaluationsByProductType: Record<string, { completed: number; total: number }> = {};
    let totalPossibleEvaluations = 0;

    // Calculate stats per product type
    (productTypes || []).forEach(pt => {
      const samplesCount = pt.samples?.length || 0;
      const totalForProductType = samplesCount * totalUsers;
      const completedForProductType = (evaluations || []).filter(e => e.product_type_id === pt.id).length;
      
      evaluationsByProductType[pt.id] = {
        completed: completedForProductType,
        total: totalForProductType
      };
      
      totalPossibleEvaluations += totalForProductType;
    });

    const completedEvaluations = evaluations?.length || 0;

    console.log('Evaluations status calculated:', {
      totalEvaluations: totalPossibleEvaluations,
      completedEvaluations,
      evaluationsByProductType
    });

    return {
      totalEvaluations: totalPossibleEvaluations,
      completedEvaluations,
      evaluationsByProductType
    };
  } catch (error) {
    console.error('=== ERROR getEvaluationsStatus ===');
    console.error('Error details:', error);
    return {
      totalEvaluations: 0,
      completedEvaluations: 0,
      evaluationsByProductType: {}
    };
  }
}
