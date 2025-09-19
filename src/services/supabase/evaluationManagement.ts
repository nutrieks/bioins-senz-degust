import { supabase } from "@/integrations/supabase/client";

export interface EvaluationUpdate {
  hedonic_appearance?: number;
  hedonic_odor?: number;
  hedonic_texture?: number;
  hedonic_flavor?: number;
  hedonic_overall_liking?: number;
  jar_ratings?: Record<string, number>;
}

export interface EvaluationHistory {
  id: string;
  original_evaluation_id: string;
  original_values: any;
  modified_values: any;
  modified_by: string;
  modified_at: string;
  reason?: string;
}

// Create backup before updating evaluation
async function createEvaluationBackup(
  evaluationId: string, 
  originalValues: Record<string, any>,
  modifiedValues: Record<string, any>,
  reason?: string
): Promise<void> {
  const { error } = await supabase
    .from('evaluation_history')
    .insert({
      original_evaluation_id: evaluationId,
      original_values: originalValues,
      modified_values: modifiedValues,
      modified_by: (await supabase.auth.getUser()).data.user?.id,
      reason
    });

  if (error) {
    throw new Error(`Failed to create backup: ${error.message}`);
  }
}

// Update evaluation with backup
export async function updateEvaluation(
  evaluationId: string, 
  updates: EvaluationUpdate,
  reason?: string
): Promise<boolean> {
  try {
    // First, get the original evaluation
    const { data: originalEvaluation, error: fetchError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch original evaluation: ${fetchError.message}`);
    }

    // Create backup
    await createEvaluationBackup(
      evaluationId,
      originalEvaluation,
      updates,
      reason
    );

    // Update the evaluation
    const { error: updateError } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', evaluationId);

    if (updateError) {
      throw new Error(`Failed to update evaluation: ${updateError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating evaluation:', error);
    throw error;
  }
}

// Hide/unhide sample from reports
export async function toggleSampleVisibility(
  sampleId: string, 
  hidden: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('samples')
      .update({ hidden_from_reports: hidden })
      .eq('id', sampleId);

    if (error) {
      throw new Error(`Failed to toggle sample visibility: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error toggling sample visibility:', error);
    throw error;
  }
}

// Get evaluation history
export async function getEvaluationHistory(evaluationId: string): Promise<EvaluationHistory[]> {
  try {
    const { data, error } = await supabase
      .from('evaluation_history')
      .select('*')
      .eq('original_evaluation_id', evaluationId)
      .order('modified_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch evaluation history: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching evaluation history:', error);
    throw error;
  }
}

// Revert evaluation to original values
export async function revertEvaluation(historyId: string): Promise<boolean> {
  try {
    // Get the history record
    const { data: historyRecord, error: fetchError } = await supabase
      .from('evaluation_history')
      .select('*')
      .eq('id', historyId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch history record: ${fetchError.message}`);
    }

    // Revert to original values
    const { error: revertError } = await supabase
      .from('evaluations')
      .update(historyRecord.original_values as any)
      .eq('id', historyRecord.original_evaluation_id);

    if (revertError) {
      throw new Error(`Failed to revert evaluation: ${revertError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error reverting evaluation:', error);
    throw error;
  }
}

// Get evaluations for a product type
export async function getEvaluationsByProductType(productTypeId: string) {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        users!evaluations_user_id_fkey(username),
        samples!evaluations_sample_id_fkey(brand, retailer_code, blind_code)
      `)
      .eq('product_type_id', productTypeId);

    if (error) {
      throw new Error(`Failed to fetch evaluations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching evaluations by product type:', error);
    throw error;
  }
}

// Get samples for a product type (including hidden status)
export async function getSamplesWithVisibility(productTypeId: string) {
  try {
    const { data, error } = await supabase
      .from('samples')
      .select('*')
      .eq('product_type_id', productTypeId)
      .order('retailer_code');

    if (error) {
      throw new Error(`Failed to fetch samples: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching samples with visibility:', error);
    throw error;
  }
}