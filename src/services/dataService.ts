import { 
  BaseProductType, 
  ProductType, 
  JARAttribute 
} from "../../types";
import { 
  baseProductTypes, 
  productTypes, 
  events 
} from "../mock";
import { createBaseJARAttribute } from './supabase/jarAttributes';
import { supabase } from '@/integrations/supabase/client';

// JAR Attribute Management
export async function getJARAttributes(productTypeId: string): Promise<JARAttribute[]> {
  const attributes = jarAttributes.filter(ja => ja.productTypeId === productTypeId);
  console.log(`Getting JAR attributes for productTypeId ${productTypeId}:`, attributes);
  return attributes;
}

export async function createJARAttribute(
  productTypeId: string,
  nameHR: string,
  nameEN: string,
  scaleHR: [string, string, string, string, string],
  scaleEN: [string, string, string, string, string]
): Promise<JARAttribute> {
  const newAttribute: JARAttribute = {
    id: `attr_${Date.now()}`,
    productTypeId,
    nameHR,
    nameEN,
    scaleHR,
    scaleEN
  };
  
  jarAttributes.push(newAttribute);
  
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (productType) {
    productType.jarAttributes.push(newAttribute);
  }
  
  return newAttribute;
}

// Base Product Type Management (for reuse across events)
export async function getAllProductTypes(): Promise<BaseProductType[]> {
  return [...baseProductTypes];
}

export async function getBaseProductType(productTypeId: string): Promise<BaseProductType | null> {
  const productType = baseProductTypes.find(pt => pt.id === productTypeId);
  console.log("Retrieved base product type:", productTypeId, productType);
  return productType || null;
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
  const index = baseProductTypes.findIndex(pt => pt.id === productTypeId);
  if (index === -1) return false;
  
  const updatedAttributes = jarAttributes.map(attr => ({
    ...attr,
    productTypeId,
    scaleHR: attr.scaleHR as [string, string, string, string, string],
    scaleEN: attr.scaleEN as [string, string, string, string, string]
  }));
  
  baseProductTypes[index] = {
    ...baseProductTypes[index],
    productName,
    jarAttributes: updatedAttributes
  };
  
  return true;
}

export async function deleteProductType(productTypeId: string): Promise<boolean> {
  const index = baseProductTypes.findIndex(pt => pt.id === productTypeId);
  if (index === -1) return false;
  
  const isUsed = productTypes.some(pt => pt.baseProductTypeId === productTypeId);
  if (isUsed) {
    console.warn("Deleting a product type that is used in events. This could cause issues.");
  }
  
  baseProductTypes.splice(index, 1);
  return true;
}

// Product Type Management (within events)
export async function getProductTypes(eventId: string): Promise<ProductType[]> {
  return productTypes.filter(pt => pt.eventId === eventId);
}

export async function createProductType(
  eventId: string, 
  customerCode: string, 
  baseProductTypeId: string, 
  baseCode: string,
  displayOrder: number
): Promise<ProductType> {
  const baseType = baseProductTypes.find(pt => pt.id === baseProductTypeId);
  if (!baseType) throw new Error("Base product type not found");
  
  const newProductTypeId = `product_${Date.now()}`;
  
  const jarAttributesCopy = baseType.jarAttributes.map(attr => ({
    ...attr,
    id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productTypeId: newProductTypeId,
    scaleHR: [...attr.scaleHR] as [string, string, string, string, string],
    scaleEN: [...attr.scaleEN] as [string, string, string, string, string]
  }));
  
  const newProductType: ProductType = {
    id: newProductTypeId,
    eventId,
    customerCode,
    productName: baseType.productName,
    baseCode,
    samples: [],
    jarAttributes: jarAttributesCopy,
    displayOrder,
    baseProductTypeId
  };
  
  productTypes.push(newProductType);
  
  const event = events.find(e => e.id === eventId);
  if (event) {
    event.productTypes.push(newProductType);
  }
  
  return newProductType;
}
