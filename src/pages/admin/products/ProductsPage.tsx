
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BaseProductType } from "@/types";
import { useNavigate } from "react-router-dom";
import { useAllProductTypes, useDeleteProductType } from "@/hooks/useProductTypes";

export default function ProductsPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<BaseProductType | null>(null);
  const navigate = useNavigate();
  
  const { data: productTypes = [], isLoading, isError, error } = useAllProductTypes();
  const deleteProductTypeMutation = useDeleteProductType();

  if (isError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Greška pri dohvaćanju tipova proizvoda
            </h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Nepoznata greška'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Pokušaj ponovno
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleAddNewType = () => {
    navigate("/admin/products/new");
  };

  const handleEditType = (productType: BaseProductType) => {
    navigate(`/admin/products/edit/${productType.id}`);
  };

  const handleDeleteClick = (productType: BaseProductType) => {
    setProductToDelete(productType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    deleteProductTypeMutation.mutate(productToDelete.id);
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Proizvodi</h1>
          <Button 
            onClick={handleAddNewType}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Dodaj novi tip proizvoda
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Baza tipova proizvoda</CardTitle>
            <CardDescription>
              Pregled i upravljanje tipovima proizvoda s njihovim standardnim JAR atributima.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Učitavanje...</span>
              </div>
            ) : productTypes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv tipa proizvoda</TableHead>
                    <TableHead>Broj JAR atributa</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productTypes.map((productType) => (
                    <TableRow key={productType.id}>
                      <TableCell className="font-medium">{productType.productName}</TableCell>
                      <TableCell>{productType.jarAttributes.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditType(productType)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Uredi
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(productType)}
                            disabled={deleteProductTypeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Obriši
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-6 border rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Nema definiranih tipova proizvoda u bazi.
                </p>
                <Button onClick={handleAddNewType}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj prvi tip proizvoda
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete && (
                <>
                  Ovom akcijom ćete trajno izbrisati tip proizvoda "{productToDelete.productName}".
                  {" "}Ova akcija se ne može poništiti.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Odustani</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteProductTypeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductTypeMutation.isPending ? "Brisanje..." : "Izbriši"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
