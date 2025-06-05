
import { supabase } from '@/integrations/supabase/client'
import { HedonicReport, JARReport, RetailerCode } from '@/types'

export async function generateHedonicReport(productTypeId: string): Promise<HedonicReport> {
  try {
    console.log('=== SUPABASE generateHedonicReport ===');
    console.log('Product Type ID:', productTypeId);
    
    // Get all evaluations for this product type with sample data including retailer_code
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select(`
        *,
        samples!inner(id, brand, blind_code, retailer_code)
      `)
      .eq('product_type_id', productTypeId);

    if (evalError) {
      console.error('Error fetching evaluations:', evalError);
      throw evalError;
    }

    console.log('Evaluations found:', evaluations?.length || 0);

    const report: HedonicReport = {};

    // Group evaluations by sample
    (evaluations || []).forEach(evaluation => {
      const sampleId = evaluation.sample_id;
      const sample = evaluation.samples;
      
      if (!report[sampleId]) {
        report[sampleId] = {
          sampleId,
          brand: sample.brand,
          blindCode: sample.blind_code || '',
          retailerCode: sample.retailer_code as RetailerCode,
          appearance: { ratings: [], mean: 0 },
          odor: { ratings: [], mean: 0 },
          texture: { ratings: [], mean: 0 },
          flavor: { ratings: [], mean: 0 },
          overallLiking: { ratings: [], mean: 0 }
        };
      }

      // Add ratings
      report[sampleId].appearance.ratings.push(evaluation.hedonic_appearance);
      report[sampleId].odor.ratings.push(evaluation.hedonic_odor);
      report[sampleId].texture.ratings.push(evaluation.hedonic_texture);
      report[sampleId].flavor.ratings.push(evaluation.hedonic_flavor);
      report[sampleId].overallLiking.ratings.push(evaluation.hedonic_overall_liking);
    });

    // Calculate means
    Object.values(report).forEach(sampleData => {
      sampleData.appearance.mean = sampleData.appearance.ratings.reduce((a, b) => a + b, 0) / sampleData.appearance.ratings.length || 0;
      sampleData.odor.mean = sampleData.odor.ratings.reduce((a, b) => a + b, 0) / sampleData.odor.ratings.length || 0;
      sampleData.texture.mean = sampleData.texture.ratings.reduce((a, b) => a + b, 0) / sampleData.texture.ratings.length || 0;
      sampleData.flavor.mean = sampleData.flavor.ratings.reduce((a, b) => a + b, 0) / sampleData.flavor.ratings.length || 0;
      sampleData.overallLiking.mean = sampleData.overallLiking.ratings.reduce((a, b) => a + b, 0) / sampleData.overallLiking.ratings.length || 0;
    });

    console.log('Hedonic report generated for', Object.keys(report).length, 'samples');
    return report;
  } catch (error) {
    console.error('=== ERROR generateHedonicReport ===');
    console.error('Error details:', error);
    return {};
  }
}

export async function generateJARReport(productTypeId: string): Promise<JARReport> {
  try {
    console.log('=== SUPABASE generateJARReport ===');
    console.log('Product Type ID:', productTypeId);
    
    // Get JAR attributes for this product type
    const { data: jarAttributes, error: jarError } = await supabase
      .from('jar_attributes')
      .select('*')
      .eq('product_type_id', productTypeId);

    if (jarError) {
      console.error('Error fetching JAR attributes:', jarError);
      throw jarError;
    }

    // Get all evaluations for this product type with sample data including retailer_code
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select(`
        *,
        samples!inner(id, brand, blind_code, retailer_code)
      `)
      .eq('product_type_id', productTypeId);

    if (evalError) {
      console.error('Error fetching evaluations:', evalError);
      throw evalError;
    }

    console.log('JAR attributes found:', jarAttributes?.length || 0);
    console.log('Evaluations found:', evaluations?.length || 0);

    const report: JARReport = {};

    // Initialize report structure
    (jarAttributes || []).forEach(attr => {
      // Ensure arrays have exactly 5 elements
      const scaleHR = Array.isArray(attr.scale_hr) && attr.scale_hr.length === 5 
        ? attr.scale_hr as [string, string, string, string, string]
        : ['', '', '', '', ''] as [string, string, string, string, string];
      const scaleEN = Array.isArray(attr.scale_en) && attr.scale_en.length === 5 
        ? attr.scale_en as [string, string, string, string, string]
        : ['', '', '', '', ''] as [string, string, string, string, string];

      report[attr.id] = {
        attributeId: attr.id,
        nameHR: attr.name_hr,
        nameEN: attr.name_en,
        scaleHR,
        scaleEN,
        samples: {}
      };
    });

    // Process evaluations
    (evaluations || []).forEach(evaluation => {
      const sampleId = evaluation.sample_id;
      const sample = evaluation.samples;
      const jarRatings = evaluation.jar_ratings || {};

      // Process each JAR rating
      Object.entries(jarRatings).forEach(([attrId, rating]) => {
        if (report[attrId]) {
          if (!report[attrId].samples[sampleId]) {
            report[attrId].samples[sampleId] = {
              sampleId,
              brand: sample.brand,
              blindCode: sample.blind_code || '',
              retailerCode: sample.retailer_code as RetailerCode,
              ratings: [],
              distribution: [0, 0, 0, 0, 0],
              mean: 0
            };
          }

          const numRating = Number(rating);
          if (numRating >= 1 && numRating <= 5) {
            report[attrId].samples[sampleId].ratings.push(numRating);
            report[attrId].samples[sampleId].distribution[numRating - 1]++;
          }
        }
      });
    });

    // Calculate means
    Object.values(report).forEach(attrData => {
      Object.values(attrData.samples).forEach(sampleData => {
        if (sampleData.ratings.length > 0) {
          sampleData.mean = sampleData.ratings.reduce((a, b) => a + b, 0) / sampleData.ratings.length;
        }
      });
    });

    console.log('JAR report generated for', Object.keys(report).length, 'attributes');
    return report;
  } catch (error) {
    console.error('=== ERROR generateJARReport ===');
    console.error('Error details:', error);
    return {};
  }
}

export async function getRawData(eventId: string): Promise<any[]> {
  try {
    console.log('=== SUPABASE getRawData ===');
    console.log('Event ID:', eventId);
    
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        users!inner(username, evaluator_position),
        samples!inner(brand, blind_code, retailer_code),
        product_types!inner(product_name, base_code, customer_code)
      `)
      .eq('event_id', eventId)
      .order('timestamp');

    if (error) {
      console.error('Error fetching raw data:', error);
      throw error;
    }

    console.log('Raw data fetched:', data?.length || 0, 'evaluations');

    return (data || []).map(evaluation => ({
      evaluationId: evaluation.id,
      timestamp: evaluation.timestamp,
      user: {
        username: evaluation.users.username,
        position: evaluation.users.evaluator_position
      },
      sample: {
        brand: evaluation.samples.brand,
        blindCode: evaluation.samples.blind_code,
        retailerCode: evaluation.samples.retailer_code
      },
      productType: {
        name: evaluation.product_types.product_name,
        baseCode: evaluation.product_types.base_code,
        customerCode: evaluation.product_types.customer_code
      },
      hedonic: {
        appearance: evaluation.hedonic_appearance,
        odor: evaluation.hedonic_odor,
        texture: evaluation.hedonic_texture,
        flavor: evaluation.hedonic_flavor,
        overallLiking: evaluation.hedonic_overall_liking
      },
      jar: evaluation.jar_ratings || {}
    }));
  } catch (error) {
    console.error('=== ERROR getRawData ===');
    console.error('Error details:', error);
    return [];
  }
}
