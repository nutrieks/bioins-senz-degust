
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
  const now = new Date().toISOString();
  const id = `base_product_${Date.now()}`;
  
  const attributes = jarAttributes.map(attr => ({
    ...attr,
    id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productTypeId: id,
    scaleHR: attr.scaleHR as [string, string, string, string, string],
    scaleEN: attr.scaleEN as [string, string, string, string, string]
  }));
  
  const newBaseProductType: BaseProductType = {
    id,
    productName,
    jarAttributes: attributes,
    createdAt: now
  };
  
  baseProductTypes.push(newBaseProductType);
  return newBaseProductType;
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
