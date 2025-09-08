import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CashFlowChart = () => {
  return (
    <Card className="metric-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Fluxo de caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold text-foreground">R$ 2345,00</p>
          </div>
          {/* Simplified chart placeholder */}
          <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 400 120" 
              className="text-primary"
            >
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points="20,80 80,40 140,60 200,30 260,20 320,50 380,30"
              />
              <circle cx="20" cy="80" r="3" fill="currentColor" />
              <circle cx="80" cy="40" r="3" fill="currentColor" />
              <circle cx="140" cy="60" r="3" fill="currentColor" />
              <circle cx="200" cy="30" r="3" fill="currentColor" />
              <circle cx="260" cy="20" r="3" fill="currentColor" />
              <circle cx="320" cy="50" r="3" fill="currentColor" />
              <circle cx="380" cy="30" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};