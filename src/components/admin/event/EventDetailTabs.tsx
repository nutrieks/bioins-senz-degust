
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductTypesTab } from "./ProductTypesTab";
import { RandomizationTab } from "./RandomizationTab";
import { ReportsTab } from "./ReportsTab";
import { EvaluationsTab } from "./EvaluationsTab";
import { ProductType } from "@/types";

interface EventDetailTabsProps {
  productTypes: ProductType[];
  eventId: string | undefined;
  refreshEventData: () => Promise<void>;
  generatingRandomization: Record<string, boolean>;
  onGenerateRandomization: (productTypeId: string) => Promise<void>;
}

export function EventDetailTabs({
  productTypes,
  eventId,
  refreshEventData,
  generatingRandomization,
  onGenerateRandomization,
}: EventDetailTabsProps) {
  return (
    <div className="mt-12">
      <Tabs defaultValue="productTypes" className="w-full">
        <TabsList>
          <TabsTrigger value="productTypes">Tipovi proizvoda</TabsTrigger>
          <TabsTrigger value="randomization">Randomizacija</TabsTrigger>
          <TabsTrigger value="reports">Izvještaji</TabsTrigger>
          <TabsTrigger value="evaluations">Ocjene</TabsTrigger>
        </TabsList>
        <TabsContent value="productTypes">
          <ProductTypesTab 
            productTypes={productTypes} 
            refreshEventData={refreshEventData}
            eventId={eventId}
          />
        </TabsContent>
        <TabsContent value="randomization">
          <RandomizationTab
            productTypes={productTypes}
            generatingRandomization={generatingRandomization}
            onGenerateRandomization={onGenerateRandomization}
          />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab eventId={eventId} />
        </TabsContent>
        <TabsContent value="evaluations">
          <EvaluationsTab productTypes={productTypes} eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
