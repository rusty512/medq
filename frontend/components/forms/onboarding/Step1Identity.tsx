import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export function Step1Identity() {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormField
          name="firstName"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Prénom</FormLabel>
              <FormControl>
                <Input id="firstName" placeholder="Jean" aria-invalid={fieldState.invalid} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="lastName"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Nom de famille</FormLabel>
              <FormControl>
                <Input id="lastName" placeholder="Dupont" aria-invalid={fieldState.invalid} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="phone"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Téléphone (optionnel)</FormLabel>
              <FormControl>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="514-123-4567"
                  aria-invalid={fieldState.invalid}
                  {...field}
                  onChange={(e) => {
                    // Live-format to 000-000-0000, allows deletion
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                    let formatted = digits
                    if (digits.length >= 4 && digits.length <= 6) {
                      formatted = `${digits.slice(0,3)}-${digits.slice(3)}`
                    } else if (digits.length > 6) {
                      formatted = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`
                    }
                    field.onChange(formatted)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
