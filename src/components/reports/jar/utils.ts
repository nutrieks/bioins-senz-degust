
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
  const samples = Object.entries(attrData.results).map(([sampleId, result]: [string, any]) => ({
    id: sampleId,
    ...result
  }));
  
  const sortedSamples = sortSamples(samples);
  
  return sortedSamples.map(sample => {
    const data: any = { 
      name: formatSampleLabel(sample),
      id: sample.id
    };
    
    for (let i = 0; i < 5; i++) {
      data[JAR_LABELS[i]] = sample.frequencies[i];
    }
    
    return data;
  });
};

export function exportJARAttributeChartToCSV(attrData: any, productName: string) {
  let csv = `JAR Chart: ${attrData.nameEN} (Sample: ${productName})\n`;
  csv += "Brand," + JAR_LABELS.join(",") + "\n";
  const samples = Object.entries(attrData.results).map(([sampleId, result]: [string, any]) => ({
    id: sampleId,
    ...result
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
  height?: number
) => {
  if (!element) return;
  
  try {
    // Longer wait to ensure the component is fully rendered
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use provided dimensions or get from element
    const elementWidth = width || element.offsetWidth;
    const elementHeight = height || element.offsetHeight;
    
    console.log(`Capturing element with dimensions: ${elementWidth}x${elementHeight}`);
    
    const { toPng } = await import('html-to-image');
    
    // Apply specific styling for ensuring proper rendering
    const originalStyle = element.getAttribute('style') || '';
    
    // Set explicit styles for the capture
    element.style.width = `${elementWidth}px`;
    element.style.height = `${elementHeight}px`;
    element.style.backgroundColor = "#ffffff";
    element.style.position = 'relative';
    element.style.overflow = 'visible';
    element.style.display = 'flex';
    element.style.flexDirection = 'column';
    element.style.justifyContent = 'center';
    element.style.padding = '40px';
    
    // Improved options for better image quality and support for zoom
    const dataUrl = await toPng(element, {
      backgroundColor: "#ffffff",
      pixelRatio: 3,
      cacheBust: true,
      style: { 
        fontFamily: "inherit",
        boxShadow: "none",
      },
      width: elementWidth,
      height: elementHeight,
      quality: 1.0,
      canvasWidth: elementWidth,
      canvasHeight: elementHeight,
      skipAutoScale: true
    });
    
    // Restore original style
    element.setAttribute('style', originalStyle);
    
    // Longer pause to ensure image is processed
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Error generating image:", error);
  }
};
