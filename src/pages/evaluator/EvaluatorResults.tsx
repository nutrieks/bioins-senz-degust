import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { EvaluatorLayout } from '@/components/layout/EvaluatorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HedonicReportView } from '@/components/reports/HedonicReportView';
import { ProductTypeSelector } from '@/components/admin/event/reports/ProductTypeSelector';
import { useReportsData } from '@/components/admin/event/reports/useReportsData';
import { useEventDetailQueries } from '@/hooks/useEventDetailQueries';
import { EventStatus } from '@/types';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EvaluatorResults() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch event details to check if it's completed
  const { event, isLoading: isLoadingEvent, hasError } = useEventDetailQueries(eventId);

  // Fetch reports data
  const {
    productTypes,
    selectedProductType,
    hedonicReport,
    isLoading: isLoadingReports,
    eventDate,
    handleProductTypeChange,
    productType
  } = useReportsData(eventId || '');

  // Security check - redirect if event is not completed
  useEffect(() => {
    if (event && event.status !== EventStatus.COMPLETED) {
      toast({
        title: "Rezultati nisu dostupni",
        description: "Rezultati će biti prikazani kada admin završi događaj.",
        variant: "destructive"
      });
      navigate('/evaluator');
    }
  }, [event, navigate, toast]);

  if (isLoadingEvent || isLoadingReports) {
    return (
      <EvaluatorLayout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Učitavanje rezultata...</span>
          </div>
        </div>
      </EvaluatorLayout>
    );
  }

  if (hasError || !event) {
    return (
      <EvaluatorLayout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-4">
              Greška pri dohvaćanju podataka
            </h2>
            <Button onClick={() => navigate('/evaluator')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vrati se na Dashboard
            </Button>
          </div>
        </div>
      </EvaluatorLayout>
    );
  }

  // Don't render content if event is not completed (security check)
  if (event.status !== EventStatus.COMPLETED) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <EvaluatorLayout>
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/evaluator">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Rezultati</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Rezultati ocjenjivanja
          </h1>
          <p className="text-muted-foreground text-lg">
            Događaj od {formatDate(eventDate)}
          </p>
        </div>

        {/* Product Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Odaberite tip proizvoda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ProductTypeSelector
                productTypes={productTypes}
                selectedProductType={selectedProductType}
                onProductTypeChange={handleProductTypeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Content */}
        {selectedProductType && productType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {productType.productName} ({productType.baseCode})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hedonicReport ? (
                <HedonicReportView 
                  report={hedonicReport} 
                  productName={productType.productName}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">
                    Nema dostupnih rezultata za odabrani proizvod.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="flex justify-center pt-6">
          <Button onClick={() => navigate('/evaluator')} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Vrati se na Dashboard
          </Button>
        </div>
      </div>
    </EvaluatorLayout>
  );
}