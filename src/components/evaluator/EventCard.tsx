import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProductTypes } from '@/services/supabase/productTypes';
import { getCompletedEvaluations } from '@/services/supabase/evaluations';
import { getRandomization } from '@/services/supabase/randomization/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types';
import { Calendar, ClipboardCheck, CheckCircle, Package } from 'lucide-react';
interface EventCardProps {
  event: Event;
}
export function EventCard({
  event
}: EventCardProps) {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    data: status,
    isLoading
  } = useQuery({
    queryKey: ['eventStatus', event.id, user?.id],
    queryFn: async () => {
      if (!user?.id || !user.evaluatorPosition) return {
        total: 0,
        completed: 0,
        products: []
      };
      const [productTypes, completedEvaluations] = await Promise.all([getProductTypes(event.id), getCompletedEvaluations(event.id, user.id)]);
      let totalSamples = 0;
      const products = [];
      
      for (const pt of productTypes) {
        const randomization = await getRandomization(pt.id);
        const evaluatorAssignment = randomization?.randomization_table?.evaluators?.find((e: any) => e.evaluatorPosition === user.evaluatorPosition);
        const sampleCount = evaluatorAssignment?.sampleOrder?.length || 0;
        totalSamples += sampleCount;
        
        products.push({
          name: pt.productName,
          sampleCount
        });
      }
      
      return {
        total: totalSamples,
        completed: completedEvaluations.length,
        products
      };
    },
    enabled: !!user?.id
  });
  const isCompleted = status ? status.completed >= status.total && status.total > 0 : false;
  const hasProgress = status && status.completed > 0 && status.total > 0;
  const progressPercentage = status && status.total > 0 ? status.completed / status.total * 100 : 0;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  return <Card className="h-full transition-all duration-200 hover:shadow-md hover-scale">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">{formatDate(event.date)}</CardTitle>
          </div>
          {isCompleted && <Badge variant="secondary">
              <CheckCircle className="h-3 w-3 mr-1" />
              Završeno
            </Badge>}
        </div>
        
      </CardHeader>
      
      {!isLoading && status?.products && status.products.length > 0 && (
        <div className="px-4 pb-2">
          <div className="space-y-1">
            {status.products.map((product, index) => (
              <div key={index} className="flex items-center text-sm text-muted-foreground">
                <Package className="h-3 w-3 mr-2" />
                <span>{product.name} - {product.sampleCount} {product.sampleCount === 1 ? 'uzorak' : product.sampleCount >= 2 && product.sampleCount <= 4 ? 'uzorka' : 'uzoraka'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <CardContent className="pb-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Učitavanje statusa...</p> : status ? <div className="space-y-2">
            
            {hasProgress && <Progress value={progressPercentage} className="h-2" />}
            {status.total === 0 && <p className="text-xs text-amber-600">Nema uzoraka za ocjenjivanje</p>}
          </div> : <p className="text-sm text-muted-foreground">Nema podataka o statusu</p>}
      </CardContent>
      
      <CardFooter>
        <Button className="w-full" onClick={() => navigate(`/evaluator/evaluate/${event.id}`)} disabled={isLoading || isCompleted || status?.total === 0} variant={isCompleted ? "secondary" : "default"}>
          {isCompleted ? <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Završeno
            </> : <>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {hasProgress ? "Nastavi ocjenjivanje" : "Započni ocjenjivanje"}
            </>}
        </Button>
      </CardFooter>
    </Card>;
}