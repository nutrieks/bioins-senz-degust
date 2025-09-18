import { RetailerCode } from "@/types";

export const JAR_COLORS = [
  "rgb(255, 128, 128)", // Much too weak (1) - Light red/pink
  "rgb(255, 255, 128)", // Too weak (2) - Light yellow
  "rgb(0, 255, 0)",     // Just About Right (3) - Green
  "rgb(159, 159, 0)",   // Too strong (4) - Olive/Dark yellow
  "rgb(255, 0, 0)"      // Much too strong (5) - Red
];

export const JAR_LABELS = [
  "Much too weak",
  "Too weak",
  "Just About Right",
  "Too strong",
  "Much too strong"
];

export const sortSamples = (samples: any[]) => {
  const retailerOrder: RetailerCode[] = [RetailerCode.LI, RetailerCode.KL, RetailerCode.KO, RetailerCode.IS, RetailerCode.PL, RetailerCode.ES, RetailerCode.M];
  
  return samples.sort((a, b) => {
    const retailerA = a.retailerCode;
    const retailerB = b.retailerCode;
    
    const orderA = retailerOrder.indexOf(retailerA);
    const orderB = retailerOrder.indexOf(retailerB);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    return a.brand.localeCompare(b.brand);
  });
};

// Format label for display - showing retailer code + brand
export const formatSampleLabel = (sample: {retailerCode: RetailerCode, brand: string}): string => {
  return `${sample.retailerCode} ${sample.brand}`;
};

export const processJARData = (attrData: any) => {
  console.log("Processing JAR data:", attrData);
  
  // ISPRAVAK: Provjerava se 'samples' umjesto 'results'
  if (!attrData || !attrData.samples) {
    console.error("No attrData.samples found:", attrData);
    return [];
  }
  
  // ISPRAVAK: Iterira se preko 'attrData.samples' umjesto 'attrData.results'
  const samples = Object.entries(attrData.samples).map(([sampleId, result]: [string, any]) => {
    console.log(`Processing sample ${sampleId}:`, result);
    return {
      id: sampleId,
      brand: result.brand,
      retailerCode: result.retailerCode,
      frequencies: result.distribution // Koristi 'distribution' polje koje se računa u servisu
    };
  });
  
  console.log("Samples before sorting:", samples);
  const sortedSamples = sortSamples(samples);
  console.log("Samples after sorting:", sortedSamples);
  
  const chartData = sortedSamples.map(sample => {
    const data: any = { 
      name: formatSampleLabel(sample),
      id: sample.id
    };
    
    for (let i = 0; i < 5; i++) {
      data[JAR_LABELS[i]] = sample.frequencies[i] || 0;
    }
    
    console.log("Chart data for sample:", data);
    return data;
  });
  
  console.log("Final chart data:", chartData);
  return chartData;
};

export function exportJARAttributeChartToCSV(attrData: any, productName: string) {
  let csv = `JAR Chart: ${attrData.nameEN} (Sample: ${productName})\n`;
  csv += "Brand," + JAR_LABELS.join(",") + "\n";

  // ISPRAVAK: Koristi 'attrData.samples' umjesto 'attrData.results'
  const samples = Object.entries(attrData.samples).map(([sampleId, result]: [string, any]) => ({
    id: sampleId,
    brand: result.brand,
    retailerCode: result.retailerCode,
    frequencies: result.distribution // Koristi 'distribution'
  }));

  const sortedSamples = sortSamples(samples);
  sortedSamples.forEach(sample => {
    csv += `${formatSampleLabel(sample)},${sample.frequencies.join(",")}\n`;
  });
  downloadCSV(csv, `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}.csv`);
}

export function downloadCSV(content: string, filename: string) {
  const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const captureElementAsImage = async (
  element: HTMLElement | null, 
  filename: string,
  width?: number,
  height?: number,
  pixelRatio?: number
) => {
  if (!element) return;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { toPng } = await import('html-to-image');
    
    const options: any = {
      backgroundColor: "#ffffff",
      pixelRatio: pixelRatio || 3,
      cacheBust: true,
      useCORS: true,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    };

    // Don't set fixed width/height - let it capture the full element
    // The element's actual dimensions will be used
    
    const dataUrl = await toPng(element, options);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Error generating image:", error);
  }
};
