import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType,
  className 
}: MetricCardProps) => {
  return (
    <Card className={cn("metric-card", className)}>
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">
            {value}
          </p>
          {change && (
            <p className={cn(
              "text-sm font-medium",
              changeType === 'positive' ? "text-success" : "text-destructive"
            )}>
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};