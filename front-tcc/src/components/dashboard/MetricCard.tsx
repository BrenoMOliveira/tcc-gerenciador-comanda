import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn, Trend } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: Trend
  description?: string
  helperText?: string
  className?: string
  isLoading?: boolean
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  description,
  helperText,
  className,
  isLoading,
}: MetricCardProps) => {
  const changeColor =
    changeType === "positive"
      ? "text-success"
      : changeType === "negative"
        ? "text-destructive"
        : "text-muted-foreground"

  return (
    <Card className={cn("metric-card", className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-9 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
              {change && (
                <div className={cn("flex items-center text-sm font-medium", changeColor)}>
                  {changeType === "positive" && (
                    <ArrowUpRight className="mr-1.5 h-4 w-4" />
                  )}
                  {changeType === "negative" && (
                    <ArrowDownRight className="mr-1.5 h-4 w-4" />
                  )}
                  <span>{change}</span>
                </div>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {helperText && (
                <p className="text-xs text-muted-foreground">{helperText}</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}