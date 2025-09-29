"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "destructive"
    | "muted"
    | "act-code"
    // soft, Stripe/Vercel-like backgrounds (no border)
    | "soft-green"
    | "soft-yellow"
    | "soft-red"
    | "soft-blue"
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
  const variantClasses =
    variant === "secondary"
      ? "bg-secondary text-secondary-foreground border border-secondary"
      : variant === "outline"
      ? "border border-input text-foreground"
      : variant === "success"
      ? "bg-green-100 text-green-700 border border-green-100 hover:bg-green-200 active:bg-green-300"
      : variant === "warning"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-100 hover:bg-yellow-200 active:bg-yellow-300"
      : variant === "destructive"
      ? "bg-destructive/10 text-destructive-foreground border border-destructive/10 hover:bg-destructive/20 active:bg-destructive/30"
      : variant === "muted"
      ? "bg-muted text-muted-foreground border border-muted hover:bg-muted/80 active:bg-muted/70"
      : variant === "act-code"
      ? "bg-transparent text-foreground border-0 hover:bg-muted/50 transition-all duration-200"
      : variant === "soft-green"
      ? "bg-emerald-50 text-emerald-700"
      : variant === "soft-yellow"
      ? "bg-amber-50 text-amber-700"
      : variant === "soft-red"
      ? "bg-rose-50 text-rose-700"
      : variant === "soft-blue"
      ? "bg-sky-50 text-sky-700"
      : "bg-primary text-primary-foreground border border-primary hover:bg-primary/90 active:bg-primary/80"

  return <div className={cn(base, variantClasses, className)} {...props} />
}


