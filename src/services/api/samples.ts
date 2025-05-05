
import { Sample, RetailerCode } from "../../types";
import { samples, productTypes } from "../mock";

// Sample Management
export async function getSamples(productTypeId: string): Promise<Sample[]> {
  return samples.filter(s => s.productTypeId === productTypeId);
}

export async function createSample(
  productTypeId: string,
  brand: string,
  retailerCode: RetailerCode
): Promise<Sample> {
  const newSample: Sample = {
    id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productTypeId,
    brand,
    retailerCode,
    images: {
      details: []
    }
  };
  
  samples.push(newSample);
  
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (productType) {
    productType.samples.push(newSample);
  }
  
  return newSample;
}

export async function updateSampleImages(
  sampleId: string,
  preparedImage?: string,
  packagingImage?: string,
  detailImages?: string[]
): Promise<boolean> {
  const sample = samples.find(s => s.id === sampleId);
  if (!sample) return false;
  
  if (preparedImage) {
    sample.images.prepared = preparedImage;
  }
  
  if (packagingImage) {
    sample.images.packaging = packagingImage;
  }
  
  if (detailImages) {
    sample.images.details = detailImages;
  }
  
  return true;
}
