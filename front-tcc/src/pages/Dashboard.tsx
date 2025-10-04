import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { CashFlowChart } from "@/components/dashboard/CashFlowChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchCashFlowSeries, fetchDashboardCriticalStock, fetchFinancialSummary, fetchLastDaySales } from "@/lib/api"
import { cn, formatCurrency, formatNumber, formatPercentage, getTrendFromValue, Trend } from "@/lib/utils"

const trendClassMap: Record<Trend, string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
}

const ChangeIndicator = ({ value }: { value?: number }) => {
  if (value === undefined) {
    return <span className="text-sm text-muted-foreground">--</span>
  }

  const trend = getTrendFromValue(value)
  const Icon =
    trend === "positive"
      ? ArrowUpRight
      : trend === "negative"
        ? ArrowDownRight
        : null

  return (
    <span className={cn("flex items-center text-sm font-medium", trendClassMap[trend])}>
      {Icon ? <Icon className="mr-1.5 h-4 w-4" /> : null}
      {formatPercentage(value, 1)}
    </span>
  )
}

const StockSkeletonRow = () => (
  <div className="grid grid-cols-3 gap-4 text-sm">
    <div className="h-4 w-28 rounded bg-muted animate-pulse" />
    <div className="h-4 w-20 rounded bg-muted animate-pulse" />
    <div className="h-4 w-16 rounded bg-muted animate-pulse" />
  </div>
)

const SalesSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2">
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-9 w-24 rounded bg-muted animate-pulse" />
        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
      </div>
    ))}
  </div>
)

export const Dashboard = () => {
  const { data: financialSummary, isLoading: financialLoading } = useQuery({
    queryKey: ["dashboard", "financial-summary"],
    queryFn: () => fetchFinancialSummary(),
  })

  const comparisonDays = financialSummary?.comparisonPeriodDays ?? 7

  const [cashFlowPeriod, setCashFlowPeriod] = useState<7 | 15 | 30>(7)

  const { data: salesSummary, isLoading: salesLoading } = useQuery({
    queryKey: ["dashboard", "sales-last-day"],
    queryFn: fetchLastDaySales,
  })

  const { data: stockAlerts, isLoading: stockLoading } = useQuery({
    queryKey: ["dashboard", "critical-stock"],
    queryFn: fetchDashboardCriticalStock,
  })

  const { data: cashFlowSeries, isLoading: cashFlowLoading } = useQuery({
    queryKey: ["dashboard", "cashflow-series", cashFlowPeriod],
    queryFn: () => fetchCashFlowSeries(cashFlowPeriod),
  })

  const chartData = useMemo(
    () =>
      cashFlowSeries?.points.map((point) => ({
        date: point.date,
        value: point.value,
      })) ?? [],
    [cashFlowSeries]
  )

  const expensesHelper = financialSummary?.expenses.isMock
    ? "Valor mock temporário até a implementação das despesas."
    : undefined

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das operações do restaurante
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="lg:col-span-2">
          <CashFlowChart
            data={chartData}
            totalValue={cashFlowSeries?.totalValue ?? 0}
            variation={cashFlowSeries?.variation}
            periodDays={cashFlowSeries?.periodDays ?? cashFlowPeriod}
            selectedPeriod={cashFlowPeriod}
            onPeriodChange={setCashFlowPeriod}
            loading={cashFlowLoading}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 hidden">
          <MetricCard
            title="Receita total"
            value={formatCurrency(financialSummary?.totalRevenue.value ?? 0)}
            change={
              financialSummary?.totalRevenue.variation !== undefined
                ? formatPercentage(financialSummary.totalRevenue.variation, 1)
                : undefined
            }
            changeType={getTrendFromValue(financialSummary?.totalRevenue.variation)}
            description={`Comparado aos ${comparisonDays} dias anteriores`}
            isLoading={financialLoading}
          />
          <MetricCard
            title="Despesas"
            value={formatCurrency(financialSummary?.expenses.value ?? 0)}
            change={
              financialSummary?.expenses.variation !== undefined
                ? formatPercentage(financialSummary.expenses.variation, 1)
                : undefined
            }
            changeType={getTrendFromValue(financialSummary?.expenses.variation)}
            description={`Comparado aos ${comparisonDays} dias anteriores`}
            helperText={expensesHelper}
            isLoading={financialLoading}
          />
          <MetricCard
            title="Lucro líquido"
            value={formatCurrency(financialSummary?.netProfit.value ?? 0)}
            change={
              financialSummary?.netProfit.variation !== undefined
                ? formatPercentage(financialSummary.netProfit.variation, 1)
                : undefined
            }
            changeType={getTrendFromValue(financialSummary?.netProfit.variation)}
            description={`Comparado aos ${comparisonDays} dias anteriores`}
            isLoading={financialLoading}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg font-semibold">Estoque</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/produtos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <span>Produto</span>
              <span>Categoria</span>
              <span>Quantidade</span>
            </div>
            {stockLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <StockSkeletonRow key={index} />
                ))}
              </div>
            ) : stockAlerts && stockAlerts.length > 0 ? (
              <div className="space-y-3">
                {stockAlerts.map((item) => (
                  <div key={item.productId} className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium text-foreground">{item.product}</div>
                    <div className="text-muted-foreground">{item.category}</div>
                    <div className="flex flex-col gap-1">
                      <span
                        className={cn(
                          "font-semibold",
                          item.status === "Fora de Estoque"
                            ? "text-destructive"
                            : "text-warning"
                        )}
                      >
                        {formatNumber(item.quantity)} un
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center",
                          item.status === "Fora de Estoque"
                            ? "status-error"
                            : "status-warning"
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-success/40 bg-success/10 px-4 py-6 text-sm text-success">
                Todos os produtos estão com níveis de estoque seguros.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Vendas do último dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <SalesSkeleton />
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total de vendas
                    </p>
                    <p className="text-3xl font-bold text-foreground tracking-tight">
                      {formatNumber(salesSummary?.totalOrders ?? 0)}
                    </p>
                    <ChangeIndicator value={salesSummary?.totalOrdersChange} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Valor total
                    </p>
                    <p className="text-3xl font-bold text-foreground tracking-tight">
                      {formatCurrency(salesSummary?.totalValue ?? 0)}
                    </p>
                    <ChangeIndicator value={salesSummary?.totalValueChange} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comparado ao dia anterior
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}