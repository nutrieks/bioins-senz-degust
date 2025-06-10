
import { JARAttribute } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { JARRadioGroup, JARRadioItem } from "@/components/ui/radio-group";
import { Control } from "react-hook-form";

interface JARScaleSectionProps {
  attributes: JARAttribute[];
  control: Control<any>;
  formKey: number;
  errors: {
    jar?: {
      [key: string]: any;
    }
  };
}

export function JARScaleSection({ 
  attributes, 
  control,
  formKey,
  errors
}: JARScaleSectionProps) {
  console.log('=== JAR SCALE SECTION RENDER ===');
  console.log('Attributes received:', attributes?.length || 0, attributes);
  
  if (!attributes || attributes.length === 0) {
    console.log('No JAR attributes available, not rendering JAR section');
    return null;
  }
  
  console.log('Rendering JAR section with', attributes.length, 'attributes');
  
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>JAR skala (Just About Right)</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {attributes.map((attribute) => {
            console.log('Rendering JAR attribute:', attribute.id, attribute.nameHR);
            return (
              <FormField
                key={`jar-${attribute.id}-${formKey}`}
                control={control}
                name={`jar.${attribute.id}`}
                render={({ field }) => (
                  <FormItem className={errors.jar?.[attribute.id] ? "pb-2 border-l-2 pl-3 border-destructive" : ""}>
                    <FormLabel className="text-lg font-semibold">{attribute.nameHR}:</FormLabel>
                    <div className="mt-2">
                      <JARRadioGroup 
                        onValueChange={(value) => {
                          console.log(`Setting JAR value for ${attribute.id}:`, value);
                          field.onChange(value);
                        }}
                        value={field.value?.toString()}
                        defaultValue={field.value?.toString()}
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <JARRadioItem
                            key={`${attribute.id}-${value}-${formKey}`}
                            value={value.toString()}
                            label={attribute.scaleHR[value-1]}
                          />
                        ))}
                      </JARRadioGroup>
                    </div>
                    {errors.jar?.[attribute.id] && <FormMessage>{errors.jar[attribute.id].message}</FormMessage>}
                  </FormItem>
                )}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
