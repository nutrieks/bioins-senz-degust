
import { Sample, RetailerCode } from "@/types";

export const samples: Sample[] = [
  {
    id: "sample_test1",
    productTypeId: "product_test",
    brand: "Plazma",
    retailerCode: RetailerCode.PL,
    blindCode: "101",
    images: {
      details: []
    }
  },
  {
    id: "sample_test2", 
    productTypeId: "product_test",
    brand: "Petit",
    retailerCode: RetailerCode.LI,
    blindCode: "102",
    images: {
      details: []
    }
  },
  {
    id: "sample_test3",
    productTypeId: "product_test", 
    brand: "Oreo",
    retailerCode: RetailerCode.KO,
    blindCode: "103",
    images: {
      details: []
    }
  }
];
