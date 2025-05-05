
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { HedonicRadioGroup, HedonicRadioItem } from "@/components/ui/radio-group";
import { Control } from "react-hook-form";

// Opis za hedonističku skalu s brojevima u zagradama
const HEDONIC_LABELS = [
  "Iznimno mi se sviđa (9)",
  "Vrlo mi se sviđa (8)",
  "Umjereno mi se sviđa (7)",
  "Lagano mi se sviđa (6)",
  "Niti mi se sviđa niti mi se ne sviđa (5)",
  "Lagano mi se ne sviđa (4)",
  "Umjereno mi se ne sviđa (3)",
  "Vrlo mi se ne sviđa (2)",
  "Iznimno mi se ne sviđa (1)"
];

interface HedonicScaleSectionProps {
  control: Control<any>;
  formKey: number;
  errors: {
    hedonic?: {
      appearance?: any;
      odor?: any;
      texture?: any;
      flavor?: any;
      overallLiking?: any;
    }
  };
}

export function HedonicScaleSection({ 
  control, 
  formKey,
  errors
}: HedonicScaleSectionProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Hedonistička Skala</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
          <FormField
            control={control}
            name="hedonic.appearance"
            render={({ field }) => (
              <FormItem className={errors.hedonic?.appearance ? "pb-2 border-l-2 pl-3 border-destructive" : ""}>
                <FormLabel className="text-lg font-semibold">Izgled:</FormLabel>
                <div className="mt-2">
                  <HedonicRadioGroup 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                      <HedonicRadioItem 
                        key={`appearance-${value}-${formKey}`}
                        value={value.toString()}
                        label={HEDONIC_LABELS[index]}
                      />
                    ))}
                  </HedonicRadioGroup>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
                    
          <FormField
            control={control}
            name="hedonic.odor"
            render={({ field }) => (
              <FormItem className={errors.hedonic?.odor ? "pb-2 border-l-2 pl-3 border-destructive" : ""}>
                <FormLabel className="text-lg font-semibold">Miris:</FormLabel>
                <div className="mt-2">
                  <HedonicRadioGroup 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                      <HedonicRadioItem 
                        key={`odor-${value}-${formKey}`}
                        value={value.toString()}
                        label={HEDONIC_LABELS[index]}
                      />
                    ))}
                  </HedonicRadioGroup>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
                    
          <FormField
            control={control}
            name="hedonic.texture"
            render={({ field }) => (
              <FormItem className={errors.hedonic?.texture ? "pb-2 border-l-2 pl-3 border-destructive" : ""}>
                <FormLabel className="text-lg font-semibold">Tekstura:</FormLabel>
                <div className="mt-2">
                  <HedonicRadioGroup 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                      <HedonicRadioItem 
                        key={`texture-${value}-${formKey}`}
                        value={value.toString()}
                        label={HEDONIC_LABELS[index]}
                      />
                    ))}
                  </HedonicRadioGroup>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
                    
          <FormField
            control={control}
            name="hedonic.flavor"
            render={({ field }) => (
              <FormItem className={errors.hedonic?.flavor ? "pb-2 border-l-2 pl-3 border-destructive" : ""}>
                <FormLabel className="text-lg font-semibold">Okus:</FormLabel>
                <div className="mt-2">
                  <HedonicRadioGroup 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                      <HedonicRadioItem 
                        key={`flavor-${value}-${formKey}`}
                        value={value.toString()}
                        label={HEDONIC_LABELS[index]}
                      />
                    ))}
                  </HedonicRadioGroup>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
                  
        <div className="mt-10">
          <FormField
            control={control}
            name="hedonic.overallLiking"
            render={({ field }) => (
              <FormItem className={errors.hedonic?.overallLiking ? "pb-2 border-l-2 pl-3 border-destructive" : ""}>
                <FormLabel className="text-lg font-semibold">Ukupni dojam:</FormLabel>
                <div className="mt-2">
                  <HedonicRadioGroup 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                      <HedonicRadioItem 
                        key={`overallLiking-${value}-${formKey}`}
                        value={value.toString()}
                        label={HEDONIC_LABELS[index]}
                      />
                    ))}
                  </HedonicRadioGroup>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
