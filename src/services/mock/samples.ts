
import { Sample, RetailerCode } from "@/types";

export const samples: Sample[] = [
  // Samples for product1 (Dimljeni vrat - event2)
  {
    id: "sample1",
    productTypeId: "product1",
    brand: "Jamnica",
    retailerCode: RetailerCode.LI,
    blindCode: "456"
  },
  {
    id: "sample2", 
    productTypeId: "product1",
    brand: "Kraš",
    retailerCode: RetailerCode.KL,
    blindCode: "789"
  },
  {
    id: "sample3",
    productTypeId: "product1", 
    brand: "Podravka",
    retailerCode: RetailerCode.KO,
    blindCode: "123"
  },
  // Samples for product2 (Čokolada - event3)
  {
    id: "sample4",
    productTypeId: "product2",
    brand: "Milka",
    retailerCode: RetailerCode.MI,
    blindCode: "654"
  },
  {
    id: "sample5",
    productTypeId: "product2",
    brand: "Lindt",
    retailerCode: RetailerCode.LI,
    blindCode: "321"
  },
  {
    id: "sample6",
    productTypeId: "product2",
    brand: "Toblerone", 
    retailerCode: RetailerCode.TO,
    blindCode: "987"
  },
  // Samples for product3 (Jogurt - event4)
  {
    id: "sample7",
    productTypeId: "product3",
    brand: "Dukat",
    retailerCode: RetailerCode.DU,
    blindCode: "111"
  },
  {
    id: "sample8",
    productTypeId: "product3",
    brand: "Vindija",
    retailerCode: RetailerCode.VI,
    blindCode: "222"
  },
  {
    id: "sample9",
    productTypeId: "product3",
    brand: "Meggle",
    retailerCode: RetailerCode.ME,
    blindCode: "333"
  }
];
