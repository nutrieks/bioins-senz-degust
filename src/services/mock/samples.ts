
import { Sample, RetailerCode } from "@/types";

export const samples: Sample[] = [
  {
    id: "sample1",
    productTypeId: "product1",
    brand: "Gavrilović",
    retailerCode: RetailerCode.LI,
    images: {
      prepared: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      packaging: "https://images.unsplash.com/photo-1600628421055-4d30de868b8f",
      details: [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        "https://images.unsplash.com/photo-1602030638412-bb8dcc0bc8b0"
      ]
    },
    blindCode: "D1"
  },
  {
    id: "sample2",
    productTypeId: "product1",
    brand: "Belje",
    retailerCode: RetailerCode.KL,
    images: {
      prepared: "https://images.unsplash.com/photo-1547050605-2f268cd5daf0",
      packaging: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8",
      details: [
        "https://images.unsplash.com/photo-1565299543923-37dd37887442"
      ]
    },
    blindCode: "D2"
  },
  {
    id: "sample3",
    productTypeId: "product1",
    brand: "PIK",
    retailerCode: RetailerCode.KO,
    images: {
      prepared: "https://images.unsplash.com/photo-1618229063345-e6e043bb2d99",
      packaging: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60",
      details: [
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d"
      ]
    },
    blindCode: "D3"
  },
  {
    id: "sample4",
    productTypeId: "product2",
    brand: "Milka",
    retailerCode: RetailerCode.LI,
    images: {
      prepared: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52",
      packaging: "https://images.unsplash.com/photo-1549007994-cb92caebd54b",
      details: [
        "https://images.unsplash.com/photo-1606312619070-d48b4c652a52"
      ]
    },
    blindCode: "C1"
  },
  {
    id: "sample5",
    productTypeId: "product2",
    brand: "Lindt",
    retailerCode: RetailerCode.KL,
    images: {
      prepared: "https://images.unsplash.com/photo-1511381939415-e44015466834",
      packaging: "https://images.unsplash.com/photo-1549007994-cb92caebd54b",
      details: [
        "https://images.unsplash.com/photo-1511381939415-e44015466834"
      ]
    },
    blindCode: "C2"
  },
  {
    id: "sample6",
    productTypeId: "product2",
    brand: "Toblerone",
    retailerCode: RetailerCode.KO,
    images: {
      prepared: "https://images.unsplash.com/photo-1564424224827-cd24b8915874",
      packaging: "https://images.unsplash.com/photo-1549007994-cb92caebd54b",
      details: [
        "https://images.unsplash.com/photo-1564424224827-cd24b8915874"
      ]
    },
    blindCode: "C3"
  }
];
