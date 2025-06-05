import { supabase } from '@/integrations/supabase/client'
import { BaseProductType, ProductType, JARAttribute } from '@/types'

// Base Product Type Management
export async function getAllProductTypes(): Promise<BaseProductType[]> {
  try {
    const { data, error } = await supabase
      .from('base_product_types')
      .select('*')
      .order('product_name')

    if (error) throw error

    // Since jar_attributes are linked to product_types, not base_product_types,
    // we return base product types without jar_attributes for now
    return (data || []).map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      jarAttributes: [], // Will be populated when creating product types
      createdAt: item.created_at
    }))
  } catch (error) {
    console.error('Error fetching base product types:', error)
    return []
  }
}

export async function getBaseProductType(productTypeId: string): Promise<BaseProductType | null> {
  try {
    const { data, error } = await supabase
      .from('base_product_types')
      .select('*')
      .eq('id', productTypeId)
      .single()

    if (error || !data) return null

    // Get jar_attributes from a sample product_type that uses this base type
    const { data: sampleProductType } = await supabase
      .from('product_types')
      .select(`
        jar_attributes (*)
      `)
      .eq('base_product_type_id', productTypeId)
      .limit(1)
      .single()

    return {
      id: data.id,
      productName: data.product_name,
      jarAttributes: sampleProductType?.jar_attributes ? 
        sampleProductType.jar_attributes.map((attr: any) => ({
          id: attr.id,
          productTypeId: attr.product_type_id,
          nameHR: attr.name_hr,
          nameEN: attr.name_en,
          scaleHR: attr.scale_hr as [string, string, string, string, string],
          scaleEN: attr.scale_en as [string, string, string, string, string]
        })) : [],
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Error fetching base product type:', error)
    return null
  }
}

export async function createBaseProductType(
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<BaseProductType> {
  // First create the base product type
  const { data: baseType, error: baseError } = await supabase
    .from('base_product_types')
    .insert({
      product_name: productName
    })
    .select()
    .single()

  if (baseError) throw baseError

  // Note: JAR attributes will be created when actual product types are created
  // since they belong to product_types, not base_product_types

  return {
    id: baseType.id,
    productName: baseType.product_name,
    jarAttributes: jarAttributes, // Return the intended attributes
    createdAt: baseType.created_at
  }
}

export async function updateBaseProductType(
  productTypeId: string,
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<boolean> {
  try {
    // Update base product type
    const { error: updateError } = await supabase
      .from('base_product_types')
      .update({ product_name: productName })
      .eq('id', productTypeId)

    if (updateError) throw updateError

    // Note: JAR attributes updates should be handled at the product_type level
    // since they are stored in the product_types context

    return true
  } catch (error) {
    console.error('Error updating base product type:', error)
    return false
  }
}

export async function deleteProductType(productTypeId: string): Promise<boolean> {
  try {
    // Delete the base product type
    // Note: Associated product_types and their jar_attributes will be handled by cascading deletes
    const { error } = await supabase
      .from('base_product_types')
      .delete()
      .eq('id', productTypeId)

    return !error
  } catch (error) {
    console.error('Error deleting product type:', error)
    return false
  }
}

// Event Product Type Management
export async function getProductTypes(eventId: string): Promise<ProductType[]> {
  try {
    const { data, error } = await supabase
      .from('product_types')
      .select(`
        *,
        samples (*),
        jar_attributes (*)
      `)
      .eq('event_id', eventId)
      .order('display_order')

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      eventId: item.event_id,
      customerCode: item.customer_code,
      productName: item.product_name,
      baseCode: item.base_code,
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
      })),
      displayOrder: item.display_order,
      baseProductTypeId: item.base_product_type_id,
      hasRandomization: item.has_randomization
    }))
  } catch (error) {
    console.error('Error fetching product types:', error)
    return []
  }
}

export async function createProductType(
  eventId: string,
  customerCode: string,
  baseProductTypeId: string,
  baseCode: string,
  displayOrder: number
): Promise<ProductType> {
  console.log('=== ZAPOČINJE KREIRANJE TIPA PROIZVODA ===');
  console.log('Event ID:', eventId);
  console.log('Base Product Type ID:', baseProductTypeId);
  console.log('Customer Code:', customerCode);
  console.log('Base Code:', baseCode);
  console.log('Display Order:', displayOrder);
  
  try {
    // Provjeri postoji li event
    const { data: eventExists, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()

    if (eventError || !eventExists) {
      console.error('Event ne postoji:', eventId, eventError);
      throw new Error(`Event s ID ${eventId} ne postoji`)
    }

    console.log('Event postoji, dohvaćam base product type...');

    // Dohvati base product type i njegove JAR atribute
    const baseType = await getBaseProductType(baseProductTypeId)
    if (!baseType) {
      console.error('Base product type ne postoji:', baseProductTypeId);
      throw new Error(`Base product type s ID ${baseProductTypeId} ne postoji`)
    }

    console.log('Base product type pronađen:', baseType.productName);
    console.log('JAR atributi:', baseType.jarAttributes.length);

    // Stvori product type
    console.log('Kreiram product type...');
    const { data: productType, error: productError } = await supabase
      .from('product_types')
      .insert({
        event_id: eventId,
        customer_code: customerCode,
        product_name: baseType.productName,
        base_code: baseCode,
        display_order: displayOrder,
        base_product_type_id: baseProductTypeId,
        has_randomization: false
      })
      .select()
      .single()

    if (productError) {
      console.error('Greška pri kreiranju product type:', productError);
      throw new Error(`Greška pri kreiranju tipa proizvoda: ${productError.message}`)
    }

    console.log('Product type uspješno kreiran s ID:', productType.id);

    // Kopiraj JAR atribute s novim product_type_id
    if (baseType.jarAttributes.length > 0) {
      console.log('Kopiram JAR atribute...');
      
      const attributesToInsert = baseType.jarAttributes.map(attr => {
        const newAttr = {
          product_type_id: productType.id, // Koristi novi product type ID
          name_hr: attr.nameHR,
          name_en: attr.nameEN,
          scale_hr: attr.scaleHR,
          scale_en: attr.scaleEN
        };
        console.log('Priprema JAR atribut:', newAttr.name_hr, 'za product_type_id:', newAttr.product_type_id);
        return newAttr;
      });

      console.log('Ukupno JAR atributa za kreiranje:', attributesToInsert.length);

      const { data: insertedAttributes, error: attributesError } = await supabase
        .from('jar_attributes')
        .insert(attributesToInsert)
        .select()

      if (attributesError) {
        console.error('Greška pri kreiranju JAR atributa:', attributesError);
        console.error('Detaljno:', JSON.stringify(attributesError, null, 2));
        
        // Ukloni product type ako JAR atributi nisu uspješno kreirani
        console.log('Uklanjam product type zbog neuspjeha JAR atributa...');
        await supabase.from('product_types').delete().eq('id', productType.id);
        
        throw new Error(`Greška pri kreiranju JAR atributa: ${attributesError.message}`)
      }

      console.log('JAR atributi uspješno kreirani:', insertedAttributes?.length || 0);
    } else {
      console.log('Nema JAR atributa za kopiranje');
    }

    console.log('=== KREIRANJE TIPA PROIZVODA ZAVRŠENO USPJEŠNO ===');

    return {
      id: productType.id,
      eventId: productType.event_id,
      customerCode: productType.customer_code,
      productName: productType.product_name,
      baseCode: productType.base_code,
      samples: [],
      jarAttributes: baseType.jarAttributes.map(attr => ({
        ...attr,
        productTypeId: productType.id
      })),
      displayOrder: productType.display_order,
      baseProductTypeId: productType.base_product_type_id,
      hasRandomization: productType.has_randomization
    }
  } catch (error) {
    console.error('=== GREŠKA PRI KREIRANJU TIPA PROIZVODA ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Nepoznata greška');
    throw error;
  }
}
