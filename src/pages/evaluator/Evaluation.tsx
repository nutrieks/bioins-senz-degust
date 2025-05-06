
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";
import { EventDataFetcher } from "@/components/evaluation/EventDataFetcher";
import { getJARAttributes, getBaseProductType } from "@/services/dataService";
import { JARAttribute } from "@/types";

export default function Evaluation() {
  const { eventId } = useParams<{ eventId: string }>();
  const [jarAttributes, setJarAttributes] = useState<JARAttribute[]>([]);

  useEffect(() => {
    if (!eventId) return;

    const fetchAttributes = async () => {
      try {
        // This function collects JAR attributes from all product types in the event
        const fetchProductTypeAttributes = async (productTypeId: string): Promise<JARAttribute[]> => {
          // First try to get attributes directly from the product type
          const attributes = await getJARAttributes(productTypeId);
          
          if (attributes && attributes.length > 0) {
            return attributes;
          } else if (productTypeId.includes('base_')) {
            // If this is a base product type, get its attributes
            const baseType = await getBaseProductType(productTypeId);
            if (baseType && baseType.jarAttributes.length > 0) {
              // Clone attributes with the current product type ID
              return baseType.jarAttributes.map(attr => ({
                ...attr,
                productTypeId: productTypeId,
              }));
            }
          }
          return [];
        };

        // The actual fetching of attributes is now done in EventDataFetcher
        // This pre-fetching is just to prepare the context provider
        const allAttributes: JARAttribute[] = [];
        setJarAttributes(allAttributes);
      } catch (error) {
        console.error("Error pre-fetching JAR attributes:", error);
      }
    };

    fetchAttributes();
  }, [eventId]);

  return (
    <EvaluatorLayout>
      <EventDataFetcher jarAttributes={jarAttributes} />
    </EvaluatorLayout>
  );
}
