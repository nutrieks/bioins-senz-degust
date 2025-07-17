
import { supabase } from '@/integrations/supabase/client';
import { BaseProductType, ProductType, JARAttribute } from '@/types';
import { createBaseJARAttribute } from './jarAttributes';

export async function getAllProductTypes(): Promise<BaseProductType[]> {
  try {
    const { data, error } = await supabase
      .from('base_product_types')
      .select(`
        *,
        jar_attributes (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      productName: item.product_name,
      jarAttributes: (item.jar_attributes || []).map((attr: any) => ({
        id: attr.id,
        productTypeId: attr.base_product_type_id || attr.product_type_id,
        nameHR: attr.name_hr,
        nameEN: attr.name_en,
        scaleHR: attr.scale_hr as [string, string, string, string, string],
        scaleEN: attr.scale_en as [string, string, string, string, string]
      })),
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching base product types:', error);
    return [];
  }
}

export async function getBaseProductType(productTypeId: string): Promise<BaseProductType | null> {
  try {
    const { data, error } = await supabase
      .from('base_product_types')
      .select(`
        *,
        jar_attributes (*)
      `)
      .eq('id', productTypeId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      productName: data.product_name,
      jarAttributes: (data.jar_attributes || []).map((attr: any) => ({
        id: attr.id,
        productTypeId: attr.base_product_type_id || attr.product_type_id,
        nameHR: attr.name_hr,
        nameEN: attr.name_en,
        scaleHR: attr.scale_hr as [string, string, string, string, string],
        scaleEN: attr.scale_en as [string, string, string, string, string]
      })),
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error fetching base product type:', error);
    return null;
  }
}

export async function createBaseProductType(
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<BaseProductType> {
  try {
    console.log('=== CREATING BASE PRODUCT TYPE ===');
    console.log('Product name:', productName);
    console.log('JAR attributes count:', jarAttributes.length);

    // Create the base product type
    const { data: baseProductType, error: baseError } = await supabase
      .from('base_product_types')
      .insert({
        product_name: productName
      })
      .select()
      .single();

    if (baseError) {
      console.error('Error creating base product type:', baseError);
      throw baseError;
    }

    console.log('Base product type created:', baseProductType);

    // Create JAR attributes for the base product type
    const createdAttributes: JARAttribute[] = [];
    
    for (const attr of jarAttributes) {
      console.log('Creating JAR attribute:', attr.nameHR, attr.nameEN);
      
      const createdAttr = await createBaseJARAttribute(
        baseProductType.id,
        attr.nameHR,
        attr.nameEN,
        attr.scaleHR,
        attr.scaleEN
      );
      
      if (createdAttr) {
        createdAttributes.push(createdAttr);
        console.log('JAR attribute created successfully:', createdAttr.id);
      } else {
        console.error('Failed to create JAR attribute:', attr.nameHR);
        throw new Error(`Failed to create JAR attribute: ${attr.nameHR}`);
      }
    }

    console.log('All JAR attributes created successfully. Count:', createdAttributes.length);

    return {
      id: baseProductType.id,
      productName: baseProductType.product_name,
      jarAttributes: createdAttributes,
      createdAt: baseProductType.created_at
    };
  } catch (error) {
    console.error('=== ERROR createBaseProductType ===');
    console.error('Error details:', error);
    throw error;
  }
}

export async function updateBaseProductType(
  productTypeId: string,
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<boolean> {
  try {
    // Update the base product type
    const { error: updateError } = await supabase
      .from('base_product_types')
      .update({ product_name: productName })
      .eq('id', productTypeId);

    if (updateError) throw updateError;

    // Delete existing JAR attributes
    const { error: deleteError } = await supabase
      .from('jar_attributes')
      .delete()
      .eq('base_product_type_id', productTypeId);

    if (deleteError) throw deleteError;

    // Create new JAR attributes
    for (const attr of jarAttributes) {
      await createBaseJARAttribute(
        productTypeId,
        attr.nameHR,
        attr.nameEN,
        attr.scaleHR,
        attr.scaleEN
      );
    }

    return true;
  } catch (error) {
    console.error('Error updating base product type:', error);
    return false;
  }
}

export async function deleteProductType(productTypeId: string): Promise<boolean> {
  try {
    // Check if the product type is used in any events
    const { data: usedInEvents, error: checkError } = await supabase
      .from('product_types')
      .select('id')
      .eq('base_product_type_id', productTypeId)
      .limit(1);

    if (checkError) throw checkError;

    if (usedInEvents && usedInEvents.length > 0) {
      console.warn("Deleting a product type that is used in events. This could cause issues.");
    }

    // Delete JAR attributes first
    const { error: deleteAttrError } = await supabase
      .from('jar_attributes')
      .delete()
      .eq('base_product_type_id', productTypeId);

    if (deleteAttrError) throw deleteAttrError;

    // Delete the base product type
    const { error: deleteError } = await supabase
      .from('base_product_types')
      .delete()
      .eq('id', productTypeId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Error deleting product type:', error);
    return false;
  }
}

export async function getProductTypes(eventId: string): Promise<ProductType[]> {
  console.log('[getProductTypes] Starting with eventId:', eventId);
  console.log('[getProductTypes] EventId type:', typeof eventId);
  
  try {
    // Check current user auth
    const { data: user, error: authError } = await supabase.auth.getUser();
    console.log('[getProductTypes] Current user:', user?.user?.id, 'Role check needed');
    
    // First, verify event exists
    const { data: eventCheck, error: eventError } = await supabase
      .from('events')
      .select('id, date, status')
      .eq('id', eventId)
      .single();
    
    console.log('[getProductTypes] Event check:', { eventCheck, eventError });
    
    if (eventError || !eventCheck) {
      console.error('[getProductTypes] Event not found:', eventError);
      return [];
    }

    // Test RLS access to product_types
    const { count: rls_count, error: rls_error } = await supabase
      .from('product_types')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    
    console.log('[getProductTypes] RLS access test:', { rls_count, rls_error });

    const { data, error } = await supabase
      .from('product_types')
      .select(`
        *,
        jar_attributes (*),
        samples (*)
      `)
      .eq('event_id', eventId)
      .order('display_order');

    console.log('[getProductTypes] Main query result:', { data, error });
    console.log('[getProductTypes] Data length:', data?.length || 0);

    if (error) {
      console.error('[getProductTypes] Database error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('[getProductTypes] No product types found for event:', eventId);
      
      // Try simple query without joins
      const { data: simpleData, error: simpleError } = await supabase
        .from('product_types')
        .select('*')
        .eq('event_id', eventId);
      
      console.log('[getProductTypes] Simple fallback query:', { simpleData, simpleError });
      return [];
    }

    const result = (data || []).map(item => ({
      id: item.id,
      eventId: item.event_id,
      customerCode: item.customer_code,
      productName: item.product_name,
      baseCode: item.base_code,
      displayOrder: item.display_order,
      baseProductTypeId: item.base_product_type_id,
      hasRandomization: item.has_randomization, // Now properly mapping this field
      samples: (item.samples || []).map((sample: any) => ({
        id: sample.id,
        productTypeId: sample.product_type_id,
        brand: sample.brand,
        retailerCode: sample.retailer_code,
        blindCode: sample.blind_code,
        images: {
          prepared: sample.images_prepared,
          packaging: sample.images_packaging,
          details: sample.images_details || []
        }
      })),
      jarAttributes: (item.jar_attributes || []).map((attr: any) => ({
        id: attr.id,
        productTypeId: attr.product_type_id,
        nameHR: attr.name_hr,
        nameEN: attr.name_en,
        scaleHR: attr.scale_hr as [string, string, string, string, string],
        scaleEN: attr.scale_en as [string, string, string, string, string]
      }))
    }));

    console.log('[getProductTypes] Mapped result:', result);
    console.log('[getProductTypes] Result length:', result.length);
    return result;
  } catch (error) {
    console.error('[getProductTypes] Error in catch block:', error);
    return [];
  }
}

export async function createProductType(
  eventId: string, 
  customerCode: string, 
  baseProductTypeId: string, 
  baseCode: string,
  displayOrder: number
): Promise<ProductType> {
  try {
    // Get the base product type
    const baseType = await getBaseProductType(baseProductTypeId);
    if (!baseType) throw new Error("Base product type not found");
    
    // Create the product type
    const { data: productType, error: createError } = await supabase
      .from('product_types')
      .insert({
        event_id: eventId,
        customer_code: customerCode,
        product_name: baseType.productName,
        base_code: baseCode,
        display_order: displayOrder,
        base_product_type_id: baseProductTypeId
      })
      .select()
      .single();

    if (createError) throw createError;

    // Copy JAR attributes from base product type
    const jarAttributesCopy = [];
    for (const attr of baseType.jarAttributes) {
      const { data: newAttr, error: attrError } = await supabase
        .from('jar_attributes')
        .insert({
          product_type_id: productType.id,
          name_hr: attr.nameHR,
          name_en: attr.nameEN,
          scale_hr: attr.scaleHR,
          scale_en: attr.scaleEN
        })
        .select()
        .single();

      if (attrError) throw attrError;

      jarAttributesCopy.push({
        id: newAttr.id,
        productTypeId: newAttr.product_type_id,
        nameHR: newAttr.name_hr,
        nameEN: newAttr.name_en,
        scaleHR: newAttr.scale_hr as [string, string, string, string, string],
        scaleEN: newAttr.scale_en as [string, string, string, string, string]
      });
    }

    return {
      id: productType.id,
      eventId: productType.event_id,
      customerCode: productType.customer_code,
      productName: productType.product_name,
      baseCode: productType.base_code,
      samples: [],
      jarAttributes: jarAttributesCopy,
      displayOrder: productType.display_order,
      baseProductTypeId: productType.base_product_type_id
    };
  } catch (error) {
    console.error('Error creating product type:', error);
    throw error;
  }
}
