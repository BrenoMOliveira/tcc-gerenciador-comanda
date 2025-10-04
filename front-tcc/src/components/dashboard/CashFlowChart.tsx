import { useMemo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn, formatCurrency, formatPercentage, formatShortDateLabel, getTrendFromValue, Trend } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CashFlowChartProps {
  data: { date: string; value: number }[]
  totalValue?: number
  variation?: number
  periodDays?: number
  selectedPeriod?: number
  periodOptions?: number[]
  onPeriodChange?: (period: number) => void
  loading?: boolean
}

const chartConfig = {
  value: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
} as const

export const CashFlowChart = ({
  data,
  totalValue = 0,
  variation,
  periodDays,
  selectedPeriod,
  periodOptions = [7, 15, 30],
  loading,
  onPeriodChange,
}: CashFlowChartProps) => {
  const formattedData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        label: formatShortDateLabel(point.date),
      })),
    [data]
  )

  const displayPeriod = periodDays ?? selectedPeriod ?? 7
  const activePeriod = selectedPeriod ?? displayPeriod

  const hasVariation = variation !== undefined
  const trend: Trend = hasVariation ? getTrendFromValue(variation) : "neutral"
  const variationLabel = hasVariation ? formatPercentage(variation, 1) : "--"

  const changeColor = hasVariation
    ? trend === "positive"
      ? "text-success"
      : trend === "negative"
        ? "text-destructive"
        : "text-muted-foreground"
        : "text-muted-foreground"

  const totalLabel = loading ? "--" : formatCurrency(totalValue)

  return (
    <Card className="metric-card w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Fluxo de caixa</CardTitle>
            <p className="text-sm text-muted-foreground">
              Receita diária dos últimos {displayPeriod} dias
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
              Total arrecadado
            </p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{totalLabel}</p>
            <div className="flex items-center gap-2">
              {periodOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={option === activePeriod ? "default" : "outline"}
                  onClick={() => onPeriodChange?.(option)}
                  disabled={loading && option === activePeriod}
                >
                  {option} dias
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Comparado aos {displayPeriod} dias anteriores
          </p>
          <div className={cn("flex items-center text-sm font-medium", changeColor)}>
            {hasVariation && trend === "positive" && (
              <ArrowUpRight className="mr-1.5 h-4 w-4" />
            )}
            {hasVariation && trend === "negative" && (
              <ArrowDownRight className="mr-1.5 h-4 w-4" />
            )}
            <span>{variationLabel}</span>
          </div>
        </div>
        <div className="h-[220px] w-full">
          {loading ? (
            <div className="h-full w-full rounded-lg bg-muted/60 animate-pulse" />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(Number(value))}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  width={80}
                />
                <ChartTooltip
                  cursor={{ strokeDasharray: "4 4" }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `Dia ${label}`}
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}