"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export function Step2Professional() {
  const { register, setValue, watch } = useFormContext();
  const speciality = watch("speciality");

  const specialities = [
    "Médecine générale",
    "Cardiologie",
    "Dermatologie",
    "Gynécologie",
    "Pédiatrie",
    "Chirurgie",
    "Radiologie",
    "Anesthésiologie",
    "Ophtalmologie",
    "Psychiatrie",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormField
          name="speciality"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Spécialité</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={(v)=> field.onChange(v)}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Sélectionnez votre spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="ramqId"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Identifiant RAMQ</FormLabel>
              <FormControl>
                <Input
                  id="ramqId"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="10 chiffres"
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">Identifiant unique RAMQ (10 chiffres).</p>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
