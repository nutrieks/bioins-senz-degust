
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { createBaseProductType } from "@/services/dataService";
import { JARAttribute } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function NewProductType() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productName, setProductName] = useState("");
  
  // Default JAR attributes with predefined values for "Just About Right" (3rd position)
  const [jarAttributes, setJarAttributes] = useState<JARAttribute[]>([
    {
      id: "attr_1",
      productTypeId: "",
      nameHR: "",
      nameEN: "",
      scaleHR: ["", "", "Baš kako treba", "", ""] as [string, string, string, string, string],
      scaleEN: ["", "", "Just About Right", "", ""] as [string, string, string, string, string]
    },
    {
      id: "attr_2",
      productTypeId: "",
      nameHR: "",
      nameEN: "",
      scaleHR: ["", "", "Baš kako treba", "", ""] as [string, string, string, string, string],
      scaleEN: ["", "", "Just About Right", "", ""] as [string, string, string, string, string]
    },
    {
      id: "attr_3",
      productTypeId: "",
      nameHR: "",
      nameEN: "",
      scaleHR: ["", "", "Baš kako treba", "", ""] as [string, string, string, string, string],
      scaleEN: ["", "", "Just About Right", "", ""] as [string, string, string, string, string]
    },
    {
      id: "attr_4",
      productTypeId: "",
      nameHR: "",
      nameEN: "",
      scaleHR: ["", "", "Baš kako treba", "", ""] as [string, string, string, string, string],
      scaleEN: ["", "", "Just About Right", "", ""] as [string, string, string, string, string]
    }
  ]);

  const createProductTypeMutation = useMutation({
    mutationFn: ({ productName, validAttributes }: { productName: string; validAttributes: JARAttribute[] }) => 
      createBaseProductType(productName, validAttributes),
    onSuccess: (result) => {
      console.log('Created base product type:', result);
      toast({
        title: "Uspješno",
        description: `Tip proizvoda "${productName}" je uspješno dodan u bazu.`,
      });
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      navigate("/admin/products");
    },
    onError: (error: Error) => {
      console.error("Error creating product type:", error);
      toast({
        title: "Greška",
        description: `Došlo je do pogreške prilikom spremanja tipa proizvoda: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleJARAttributeChange = (attrIndex: number, field: keyof JARAttribute, value: string) => {
    setJarAttributes(prev => {
      const newAttributes = [...prev];
      if (field === "nameHR" || field === "nameEN") {
        newAttributes[attrIndex] = {
          ...newAttributes[attrIndex],
          [field]: value
        };
      }
      return newAttributes;
    });
  };

  const handleScaleChange = (
    attrIndex: number, 
    scaleType: "scaleHR" | "scaleEN", 
    valueIndex: number, 
    value: string
  ) => {
    setJarAttributes(prev => {
      const newAttributes = [...prev];
      const newScale = [...newAttributes[attrIndex][scaleType]];
      newScale[valueIndex] = value;
      
      newAttributes[attrIndex] = {
        ...newAttributes[attrIndex],
        [scaleType]: newScale as [string, string, string, string, string]
      };
      
      return newAttributes;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!productName.trim()) {
      toast({
        title: "Greška",
        description: "Naziv tipa proizvoda je obavezan.",
        variant: "destructive",
      });
      return;
    }

    // Validate JAR attributes - improved validation
    const validAttributes = [];
    for (let i = 0; i < jarAttributes.length; i++) {
      const attr = jarAttributes[i];
      
      // Skip completely empty attributes
      const hasAnyContent = attr.nameHR.trim() || attr.nameEN.trim() || 
        attr.scaleHR.some((scale, idx) => idx !== 2 && scale.trim()) ||
        attr.scaleEN.some((scale, idx) => idx !== 2 && scale.trim());
      
      if (!hasAnyContent) {
        console.log(`Preskačem prazan atribut ${i + 1}`);
        continue;
      }

      // Validate non-empty attributes
      if (!attr.nameHR.trim() || !attr.nameEN.trim()) {
        toast({
          title: "Greška",
          description: `Naziv atributa ${i + 1} mora biti popunjen na oba jezika.`,
          variant: "destructive",
        });
        return;
      }

      // Check scale values - we skip index 2 which is predefined "Just About Right"
      let hasEmptyScale = false;
      for (let j = 0; j < 5; j++) {
        if (j !== 2) { // Skip checking the middle "Just About Right" value
          if (!attr.scaleHR[j].trim() || !attr.scaleEN[j].trim()) {
            toast({
              title: "Greška",
              description: `Opis skale za atribut ${i + 1}, pozicija ${j + 1} mora biti popunjen na oba jezika.`,
              variant: "destructive",
            });
            hasEmptyScale = true;
            break;
          }
        }
      }

      if (hasEmptyScale) return;

      validAttributes.push(attr);
    }

    if (validAttributes.length === 0) {
      toast({
        title: "Greška",
        description: "Morate definirati barem jedan JAR atribut.",
        variant: "destructive",
      });
      return;
    }

    console.log('Submitting with valid attributes:', validAttributes.length);
    createProductTypeMutation.mutate({ productName, validAttributes });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Novi tip proizvoda</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Osnovne informacije</CardTitle>
              <CardDescription>
                Unesite naziv tipa proizvoda koji ćete kasnije moći koristiti kod kreiranja događaja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Naziv tipa proizvoda</Label>
                  <Input 
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="npr. Buđola, Sir, Čokolada..."
                    required
                    className="max-w-md"
                    disabled={createProductTypeMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Tabs defaultValue="attr1">
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-xl">JAR atributi</CardTitle>
                <TabsList>
                  <TabsTrigger value="attr1">Atribut 1</TabsTrigger>
                  <TabsTrigger value="attr2">Atribut 2</TabsTrigger>
                  <TabsTrigger value="attr3">Atribut 3</TabsTrigger>
                  <TabsTrigger value="attr4">Atribut 4</TabsTrigger>
                </TabsList>
              </div>

              {jarAttributes.map((attr, attrIndex) => (
                <TabsContent key={attr.id} value={`attr${attrIndex + 1}`}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Atribut {attrIndex + 1}</CardTitle>
                      <CardDescription>
                        Definirajte naziv i opise skale za atribut {attrIndex + 1}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`attrNameHR${attrIndex}`}>Naziv atributa (HR)</Label>
                            <Input 
                              id={`attrNameHR${attrIndex}`}
                              value={attr.nameHR}
                              onChange={(e) => handleJARAttributeChange(attrIndex, "nameHR", e.target.value)}
                              placeholder="npr. Slanoća"
                              required
                              disabled={createProductTypeMutation.isPending}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`attrNameEN${attrIndex}`}>Naziv atributa (EN)</Label>
                            <Input 
                              id={`attrNameEN${attrIndex}`}
                              value={attr.nameEN}
                              onChange={(e) => handleJARAttributeChange(attrIndex, "nameEN", e.target.value)}
                              placeholder="npr. Saltiness"
                              required
                              disabled={createProductTypeMutation.isPending}
                            />
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <h4 className="text-sm font-medium mb-3">Opis skale (HR)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            {[0, 1, 2, 3, 4].map((valueIndex) => (
                              <div key={`hr-${valueIndex}`} className="space-y-2">
                                <Label className="text-xs">Ocjena {valueIndex + 1}</Label>
                                <Input 
                                  value={attr.scaleHR[valueIndex]}
                                  onChange={(e) => handleScaleChange(attrIndex, "scaleHR", valueIndex, e.target.value)}
                                  placeholder={valueIndex === 2 ? "Baš kako treba" : ""}
                                  required
                                  disabled={valueIndex === 2 || createProductTypeMutation.isPending}
                                  className={valueIndex === 2 ? "bg-muted" : ""}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <h4 className="text-sm font-medium mb-3">Opis skale (EN)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            {[0, 1, 2, 3, 4].map((valueIndex) => (
                              <div key={`en-${valueIndex}`} className="space-y-2">
                                <Label className="text-xs">Rating {valueIndex + 1}</Label>
                                <Input 
                                  value={attr.scaleEN[valueIndex]}
                                  onChange={(e) => handleScaleChange(attrIndex, "scaleEN", valueIndex, e.target.value)}
                                  placeholder={valueIndex === 2 ? "Just About Right" : ""}
                                  required
                                  disabled={valueIndex === 2 || createProductTypeMutation.isPending}
                                  className={valueIndex === 2 ? "bg-muted" : ""}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/admin/products")}
              disabled={createProductTypeMutation.isPending}
            >
              Odustani
            </Button>
            <Button 
              type="submit"
              disabled={createProductTypeMutation.isPending}
            >
              {createProductTypeMutation.isPending ? "Spremanje..." : "Spremi tip proizvoda"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
