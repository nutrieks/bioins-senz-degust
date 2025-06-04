
import { HedonicReport, RetailerCode } from "@/types";

// Define retailer colors
export const RETAILER_COLORS: Record<RetailerCode, string> = {
  [RetailerCode.LI]: "rgb(255, 255, 0)", // Lidl: Yellow
  [RetailerCode.KL]: "rgb(255, 0, 0)",   // Kaufland: Red
  [RetailerCode.KO]: "rgb(0, 0, 255)",   // Konzum: Blue
  [RetailerCode.IS]: "rgb(128, 128, 255)", // Interspar: Light Blue
  [RetailerCode.PL]: "rgb(128, 128, 128)", // Plodine: Gray
  [RetailerCode.ES]: "rgb(0, 176, 240)",  // Eurospin: Light Blue
  [RetailerCode.M]: "rgb(0, 255, 0)",     // Marke: Green
  [RetailerCode.DU]: "rgb(50, 205, 50)",  // Dukat: Lime Green
  [RetailerCode.ME]: "rgb(34, 139, 34)",  // Meggle: Forest Green
  [RetailerCode.MI]: "rgb(144, 238, 144)", // Milka: Light Green
  [RetailerCode.TO]: "rgb(0, 128, 0)",    // Toblerone: Green
  [RetailerCode.VI]: "rgb(124, 252, 0)"   // Vindija: Lawn Green
};

// Function to determine if a color is dark and needs white text
export const isDarkColor = (color: string): boolean => {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return false;
  const [, r, g, b] = match.map(Number);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Helper function to get a lighter or darker variant of a color for duplicate retailers
export const getColorVariant = (color: string, index: number): string => {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;
  let [, r, g, b] = match.map(Number);
  const factor = 0.7 + (index * 0.15);
  r = Math.min(255, Math.round(r * factor));
  g = Math.min(255, Math.round(g * factor));
  b = Math.min(255, Math.round(b * factor));
  return `rgb(${r}, ${g}, ${b})`;
};

// Format label for display - showing retailer code + brand
export const formatSampleLabel = (sample: {retailerCode: RetailerCode, brand: string}): string => {
  return `${sample.retailerCode} ${sample.brand}`;
};

export const sortSamples = (report: HedonicReport) => {
  // Retailer codes order (trgovački lanci)
  const retailerOrder: RetailerCode[] = [RetailerCode.LI, RetailerCode.KL, RetailerCode.KO, RetailerCode.IS, RetailerCode.PL, RetailerCode.ES];
  // Brand codes order (marke) - alphabetically
  const brandOrder: RetailerCode[] = [RetailerCode.DU, RetailerCode.ME, RetailerCode.MI, RetailerCode.TO, RetailerCode.VI, RetailerCode.M];
  
  return Object.entries(report)
    .sort((a, b) => {
      const retailerA = a[1].retailerCode;
      const retailerB = b[1].retailerCode;
      
      const isRetailerA = retailerOrder.includes(retailerA);
      const isRetailerB = retailerOrder.includes(retailerB);
      
      // If both are retailers or both are brands
      if (isRetailerA && isRetailerB) {
        const orderA = retailerOrder.indexOf(retailerA);
        const orderB = retailerOrder.indexOf(retailerB);
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a[1].brand.localeCompare(b[1].brand);
      } else if (!isRetailerA && !isRetailerB) {
        // Both are brands - sort alphabetically by retailer code
        const orderA = brandOrder.indexOf(retailerA);
        const orderB = brandOrder.indexOf(retailerB);
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a[1].brand.localeCompare(b[1].brand);
      } else {
        // Retailers come before brands
        return isRetailerA ? -1 : 1;
      }
    });
};

export const processChartData = (report: HedonicReport) => {
  const sortedSamples = sortSamples(report);
  const colorMap = new Map<string, string>();
  const textColorMap = new Map<string, string>();
  const retailerCounts: Record<RetailerCode, number> = {
    [RetailerCode.LI]: 0, 
    [RetailerCode.KL]: 0, 
    [RetailerCode.KO]: 0, 
    [RetailerCode.IS]: 0, 
    [RetailerCode.PL]: 0, 
    [RetailerCode.ES]: 0, 
    [RetailerCode.M]: 0,
    [RetailerCode.MI]: 0,
    [RetailerCode.TO]: 0,
    [RetailerCode.DU]: 0,
    [RetailerCode.VI]: 0,
    [RetailerCode.ME]: 0
  };
  
  sortedSamples.forEach(([id, sample]) => {
    const retailerCode = sample.retailerCode;
    const count = retailerCounts[retailerCode]++;
    const baseColor = RETAILER_COLORS[retailerCode];
    const color = count === 0 ? baseColor : getColorVariant(baseColor, count);
    colorMap.set(id, color);
    textColorMap.set(id, isDarkColor(color) ? "#fff" : "#000");
  });
  
  const attributes = [
    { key: "appearance", label: "Appearance" },
    { key: "odor", label: "Odour" },
    { key: "texture", label: "Texture" },
    { key: "flavor", label: "Flavour" },
    { key: "overallLiking", label: "Overall liking" }
  ];
  
  const chartData = attributes.map(attr => {
    const data: any = { name: attr.label };
    sortedSamples.forEach(([id, sample]) => {
      // Use retailer code + brand name format for keys
      const sampleKey = `${sample.retailerCode} ${sample.brand}_${id}`;
      data[sampleKey] = Number(sample.hedonic[attr.key as keyof typeof sample.hedonic].toFixed(1));
    });
    return data;
  });
  
  return { chartData, sortedSamples, colorMap, textColorMap, attributes };
};
