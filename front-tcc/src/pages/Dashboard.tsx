import { MetricCard } from "@/components/dashboard/MetricCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockStockData = [
  { produto: "Tomates", categoria: "Complementos", quantidade: "10 uni" },
  { produto: "Frango", categoria: "Carnes", quantidade: "5 uni" },
  { produto: "Coca", categoria: "Bebidas", quantidade: "12 uni" },
];

export const Dashboard = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das operações do restaurante</p>
      </div>

      {/* Cash Flow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div className="space-y-4">
          <MetricCard
            title="Receita total"
            value="R$ 10500,00"
            change="+10%"
            changeType="positive"
          />
          <MetricCard
            title="Despesas"
            value="R$ 8155,00"
            change="-5%"
            changeType="negative"
          />
          <MetricCard
            title="Lucro líquido"
            value="R$ 2345,00"
            change="+12%"
            changeType="positive"
          />
        </div>
      </div>

      {/* Stock and Sales Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Summary */}
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Estoque</CardTitle>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <span>Produto</span>
                <span>Categoria</span>
                <span>Quantidade</span>
              </div>
              {mockStockData.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                  <span className="font-medium">{item.produto}</span>
                  <span className="text-primary">{item.categoria}</span>
                  <span>{item.quantidade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Summary */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Vendas do último dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Total</p>
                <p className="text-2xl font-bold">50</p>
                <p className="text-sm text-success font-medium">+5%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Valor total</p>
                <p className="text-2xl font-bold">R$ 2250,00</p>
                <p className="text-sm text-success font-medium">+15%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};