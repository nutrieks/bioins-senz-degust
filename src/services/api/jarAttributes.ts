
import { JARAttribute } from "../../types";
import { jarAttributes, productTypes } from "../mock";

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
