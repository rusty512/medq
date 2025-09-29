"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

export type StatCardProps = {
  title: string
  value: string
  // backward-compat props used on home page
  deltaText?: string
  deltaPositive?: boolean
  // new, v0-style API
  change?: { value: string; trend: "up" | "down" }
  className?: string
}

export function StatCard({
  title,
  value,
  deltaText,
  deltaPositive,
  change,
  className,
}: StatCardProps) {
  const derivedChange = change ?? (
    deltaText !== undefined && deltaPositive !== undefined
      ? { value: deltaText, trend: deltaPositive ? "up" : "down" }
      : undefined
  )

  return (
    <div className={cn("space-y-4 bg-muted/40 rounded-lg", className)}>
      <h2 className="text-foreground text-base font-medium my-0 px-5 py-2.5">{title}</h2>

      <Card className="w-full border border-border/40 shadow-sm rounded-lg">
        <CardContent className="px-4 py-2">
          <div className="flex flex-col gap-4">
            <div className="text-foreground tracking-tight text-4xl font-semibold">{value}</div>
            <div className="h-px w-full bg-border/20" />
            {derivedChange ? (
              <div className="flex items-center gap-2">
                {derivedChange.trend === "up" ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={cn(
                    "font-medium text-base",
                    derivedChange.trend === "up" ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {derivedChange.value}
                </span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}