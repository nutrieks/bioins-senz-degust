
import { supabase } from '@/integrations/supabase/client'
import { BaseProductType, ProductType, JARAttribute } from '@/types'

// Base Product Type Management
export async function getAllProductTypes(): Promise<BaseProductType[]> {
  try {
    const { data, error } = await supabase
      .from('base_product_types')
      .select(`
        *,
        jar_attributes (*)
      `)
      .order('product_name')

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      jarAttributes: (item.jar_attributes || []).map((attr: any) => ({
        id: attr.id,
        productTypeId: attr.product_type_id,
        nameHR: attr.name_hr,
        nameEN: attr.name_en,
        scaleHR: attr.scale_hr as [string, string, string, string, string],
        scaleEN: attr.scale_en as [string, string, string, string, string]
      })),
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
      .select(`
        *,
        jar_attributes (*)
      `)
      .eq('id', productTypeId)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      productName: data.product_name,
      jarAttributes: (data.jar_attributes || []).map((attr: any) => ({
        id: attr.id,
        productTypeId: attr.product_type_id,
        nameHR: attr.name_hr,
        nameEN: attr.name_en,
        scaleHR: attr.scale_hr as [string, string, string, string, string],
        scaleEN: attr.scale_en as [string, string, string, string, string]
      })),
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

  // Then create the JAR attributes
  if (jarAttributes.length > 0) {
    const attributesToInsert = jarAttributes.map(attr => ({
      product_type_id: baseType.id,
      name_hr: attr.nameHR,
      name_en: attr.nameEN,
      scale_hr: attr.scaleHR,
      scale_en: attr.scaleEN
    }))

    const { error: attributesError } = await supabase
      .from('jar_attributes')
      .insert(attributesToInsert)

    if (attributesError) throw attributesError
  }

  return {
    id: baseType.id,
    productName: baseType.product_name,
    jarAttributes: jarAttributes,
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

    // Delete existing attributes
    const { error: deleteError } = await supabase
      .from('jar_attributes')
      .delete()
      .eq('product_type_id', productTypeId)

    if (deleteError) throw deleteError

    // Insert new attributes
    if (jarAttributes.length > 0) {
      const attributesToInsert = jarAttributes.map(attr => ({
        product_type_id: productTypeId,
        name_hr: attr.nameHR,
        name_en: attr.nameEN,
        scale_hr: attr.scaleHR,
        scale_en: attr.scaleEN
      }))

      const { error: insertError } = await supabase
        .from('jar_attributes')
        .insert(attributesToInsert)

      if (insertError) throw insertError
    }

    return true
  } catch (error) {
    console.error('Error updating base product type:', error)
    return false
  }
}

export async function deleteProductType(productTypeId: string): Promise<boolean> {
  try {
    // First delete associated JAR attributes
    await supabase
      .from('jar_attributes')
      .delete()
      .eq('product_type_id', productTypeId)

    // Then delete the base product type
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
  // First get the base product type
  const baseType = await getBaseProductType(baseProductTypeId)
  if (!baseType) throw new Error("Base product type not found")

  // Create the product type
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

  if (productError) throw productError

  // Copy JAR attributes from base type
  if (baseType.jarAttributes.length > 0) {
    const attributesToInsert = baseType.jarAttributes.map(attr => ({
      product_type_id: productType.id,
      name_hr: attr.nameHR,
      name_en: attr.nameEN,
      scale_hr: attr.scaleHR,
      scale_en: attr.scaleEN
    }))

    const { error: attributesError } = await supabase
      .from('jar_attributes')
      .insert(attributesToInsert)

    if (attributesError) throw attributesError
  }

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
}
