
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ComingSoonTabProps {
  title: string;
  description: string;
}

export function ComingSoonTab({ title, description }: ComingSoonTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {title} će biti dostupni u budućoj verziji.
        </p>
      </CardContent>
    </Card>
  );
}
