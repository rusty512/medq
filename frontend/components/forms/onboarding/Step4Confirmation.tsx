"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Edit3 } from "lucide-react";

interface Step4ConfirmationProps { goToStep?: (step: number) => void; formData?: any; setFormData?: (d:any)=>void }

export function Step4Confirmation({ goToStep, formData }: Step4ConfirmationProps) {
  const { setValue, watch } = useFormContext();
  const values = formData ?? watch();
  const handleTermsChange = (checked: boolean) => {
    setValue("termsAccepted", Boolean(checked));
  };

  return (
    <div className="space-y-6">
      {/* Section: Informations personnelles */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Informations personnelles</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Nom:</span>
            <Badge variant="secondary" className="font-mono text-xs">{values.firstName} {values.lastName}</Badge>
          </div>
          {values.phone && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Téléphone:</span>
              <Badge variant="secondary" className="font-mono text-xs">{values.phone}</Badge>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Section: Informations professionnelles */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Informations professionnelles</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Spécialité:</span>
            <Badge variant="secondary" className="font-mono text-xs">{values.speciality}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">RAMQ ID:</span>
            <Badge variant="secondary" className="font-mono text-xs">{values.ramqId}</Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section: Établissements */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Établissements</h3>
        <div className="space-y-2">
          {values.establishments.length > 0 ? (
            values.establishments.map((establishment: any) => (
              <div key={establishment.id} className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">{establishment.name}</Badge>
                {establishment.isDefault && (
                  <Badge variant="outline" className="text-xs">par défaut</Badge>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucun établissement sélectionné</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Confirmation checkbox */}
      <div className="space-y-2">
        <FormField
          name="termsAccepted"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-start space-x-2">
                <FormControl>
                  <Checkbox id="terms" checked={!!field.value} onCheckedChange={(c)=>field.onChange(Boolean(c))} />
                </FormControl>
                <div className="space-y-1">
                  <Label htmlFor="terms" className="text-sm">
                    Je confirme que les informations sont exactes et j&apos;accepte les conditions d&apos;utilisation
                  </Label>
                  {fieldState.error && (
                    <p className="text-xs text-destructive">Veuillez cocher pour continuer</p>
                  )}
                </div>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
