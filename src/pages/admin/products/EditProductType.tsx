
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { getBaseProductType, updateBaseProductType } from "@/services/dataService";
import { JARAttribute, ProductType } from "@/types";

export default function EditProductType() {
  const { productTypeId } = useParams<{ productTypeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productName, setProductName] = useState("");
  const [jarAttributes, setJarAttributes] = useState<JARAttribute[]>([]);

  useEffect(() => {
    if (productTypeId) {
      fetchProductType(productTypeId);
    }
  }, [productTypeId]);

  const fetchProductType = async (id: string) => {
    try {
      setIsLoading(true);
      const productType = await getBaseProductType(id);
      
      if (productType) {
        setProductName(productType.productName);
        setJarAttributes(productType.jarAttributes);
        console.log("Loaded product type with JAR attributes:", productType.jarAttributes);
      } else {
        toast({
          title: "Greška",
          description: "Tip proizvoda nije pronađen.",
          variant: "destructive",
        });
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error fetching product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja tipa proizvoda.",
        variant: "destructive",
      });
      navigate("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

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
        [scaleType]: newScale
      };
      return newAttributes;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productTypeId) return;
    
    // Validate form
    if (!productName.trim()) {
      toast({
        title: "Greška",
        description: "Naziv tipa proizvoda je obavezan.",
        variant: "destructive",
      });
      return;
    }

    // Validate JAR attributes
    for (let i = 0; i < jarAttributes.length; i++) {
      const attr = jarAttributes[i];
      if (!attr.nameHR.trim() || !attr.nameEN.trim()) {
        toast({
          title: "Greška",
          description: `Naziv atributa ${i + 1} mora biti popunjen na oba jezika.`,
          variant: "destructive",
        });
        return;
      }

      // Check scale values - we skip index 2 which is predefined "Just About Right"
      for (let j = 0; j < 5; j++) {
        if (j !== 2) { // Skip checking the middle "Just About Right" value
          if (!attr.scaleHR[j].trim() || !attr.scaleEN[j].trim()) {
            toast({
              title: "Greška",
              description: `Opis skale za atribut ${i + 1}, pozicija ${j + 1} mora biti popunjen na oba jezika.`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }
    
    setIsSubmitting(true);
    try {
      // Update the product type in the database
      await updateBaseProductType(productTypeId, productName, jarAttributes);
      
      toast({
        title: "Uspješno",
        description: `Tip proizvoda "${productName}" je uspješno ažuriran.`,
      });
      
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom ažuriranja tipa proizvoda.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center p-8">Učitavanje...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Uredi tip proizvoda</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Osnovne informacije</CardTitle>
              <CardDescription>
                Uredite naziv tipa proizvoda koji se koristi kod kreiranja događaja.
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
                    disabled={isSubmitting}
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
                  {jarAttributes.map((_, index) => (
                    <TabsTrigger key={index} value={`attr${index + 1}`}>
                      Atribut {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {jarAttributes.map((attr, attrIndex) => (
                <TabsContent key={attr.id} value={`attr${attrIndex + 1}`}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Atribut {attrIndex + 1}</CardTitle>
                      <CardDescription>
                        Uredite naziv i opise skale za atribut {attrIndex + 1}
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
                              disabled={isSubmitting}
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
                              disabled={isSubmitting}
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
                                  disabled={valueIndex === 2 || isSubmitting} // Disable the middle value
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
                                  disabled={valueIndex === 2 || isSubmitting} // Disable the middle value
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
              disabled={isSubmitting}
            >
              Odustani
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Spremanje..." : "Spremi promjene"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
