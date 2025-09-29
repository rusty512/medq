"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type SectionHeaderProps = {
  title: string
  subtitle?: string
  badgeText?: string
  badgeVariant?: "default" | "secondary" | "outline"
  actions?: React.ReactNode
  className?: string
  titleClassName?: string
  subtitleClassName?: string
}

export function SectionHeader({
  title,
  subtitle,
  badgeText,
  badgeVariant = "secondary",
  actions,
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 sm:gap-4",
      className
    )}>
      <div className="min-w-0 flex-1">
        <h2 className={cn("text-lg md:text-xl font-semibold tracking-tight", titleClassName)}>
          {title}
        </h2>
        {subtitle ? (
          <p className={cn("text-sm text-muted-foreground mt-1", subtitleClassName)}>
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 sm:shrink-0 sm:whitespace-nowrap">
        {badgeText ? (
          <Badge variant={badgeVariant} className="whitespace-nowrap">
            {badgeText}
          </Badge>
        ) : null}
        {actions}
      </div>
    </div>
  )
}

