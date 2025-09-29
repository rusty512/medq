import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
  onCancel?: () => void
  onSave?: () => void
  className?: string
  showActions?: boolean
  isDirty?: boolean
  isLoading?: boolean
}

export function SettingsCard({
  title,
  description,
  children,
  onCancel,
  onSave,
  className,
  showActions = true,
  isDirty = false,
  isLoading = false,
}: SettingsCardProps) {
  return (
    <Card className={cn("w-full max-w-lg py-3", className)}>
      <CardContent className="px-6 py-3">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          {children}
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="mt-6">
            <Separator className="mb-4" />
            <div className="flex justify-end gap-3">
              {isDirty && onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                  Annuler
                </Button>
              )}
              <Button onClick={onSave} disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
