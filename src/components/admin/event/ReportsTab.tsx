
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReportsData } from "./reports/useReportsData";
import { ProductTypeSelector } from "./reports/ProductTypeSelector";
import { ReportControls } from "./reports/ReportControls";
import { ReportHeader } from "./reports/ReportHeader";
import { HedonicTab } from "./reports/HedonicTab";
import { JARTab } from "./reports/JARTab";
import { PrintableReports } from "./reports/PrintableReports";
import { SampleManager } from "./reports/SampleManager";
import { useQuery } from "@tanstack/react-query";
import { getEvent } from "@/services/dataService";

interface ReportsTabProps {
  eventId: string;
}

export function ReportsTab({ eventId }: ReportsTabProps) {
  const [editMode, setEditMode] = useState(false);
  
  const {
    productTypes,
    selectedProductType,
    hedonicReport,
    jarReport,
    isLoading,
    eventDate,
    handleProductTypeChange,
    productType
  } = useReportsData(eventId);

  // Fetch event data to check status
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
  });

  // Only show edit mode for completed or archived events
  const canEdit = event?.status === 'COMPLETED' || event?.status === 'ARCHIVED';

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportReport = () => {
    // This will be handled in ReportControls component
  };

  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="print:hidden">
        <CardTitle>Izvještaji</CardTitle>
        <CardDescription>
          Pregled i preuzimanje izvještaja o događaju.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <ProductTypeSelector
              productTypes={productTypes}
              selectedProductType={selectedProductType}
              onProductTypeChange={handleProductTypeChange}
            />
            
            <ReportControls
              onPrint={handlePrintReport}
              onExport={handleExportReport}
              disabled={!hedonicReport || !jarReport}
              editMode={editMode}
              onEditModeChange={setEditMode}
              showEditMode={canEdit}
            />
          </div>

          <ReportHeader 
            eventDate={eventDate} 
            productType={productType} 
          />

          {editMode && selectedProductType && productType && (
            <SampleManager
              productTypeId={selectedProductType}
              productTypeName={`${productType.customerCode} - ${productType.productName}`}
            />
          )}

          <Tabs defaultValue="hedonic" className="print:hidden">
            <TabsList className="mb-4">
              <TabsTrigger value="hedonic">Hedonika</TabsTrigger>
              <TabsTrigger value="jar">JAR</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hedonic">
              <HedonicTab
                hedonicReport={hedonicReport}
                productType={productType}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="jar">
              <JARTab
                jarReport={jarReport}
                productType={productType}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>

          <PrintableReports
            hedonicReport={hedonicReport}
            jarReport={jarReport}
            productType={productType}
          />
        </div>
      </CardContent>
    </Card>
  );
}
