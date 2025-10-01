"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface Specialty {
  code: string;
  name: string;
  displayName: string;
  isActive: boolean;
}

export function Step2Professional() {
  const { register, setValue, watch } = useFormContext();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Load specialties from RAMQ data
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const response = await fetch('/api/specialties');
        if (response.ok) {
          const data = await response.json();
          setSpecialties(data);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load specialties');
        }
      } catch (error) {
        console.error('Failed to load specialties:', error);
        setError('Failed to load specialties. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadSpecialties();
  }, []);

  // Filter specialties based on search
  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormField
          name="ramqId"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Identifiant du professionnel</FormLabel>
              <FormControl>
                <Input
                  id="ramqId"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="6 chiffres"
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">Identifiant unique du professionnel (6 chiffres).</p>
            </FormItem>
          )}
        />

        <FormField
          name="speciality"
          render={({ field, fieldState }) => {
            const selectedSpecialty = specialties.find(s => s.code === field.value);
            
            return (
              <FormItem>
                <FormLabel>Spécialité</FormLabel>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={loading}
                      >
                        {loading 
                          ? "Chargement des spécialités..." 
                          : error 
                            ? "Erreur lors du chargement"
                            : selectedSpecialty?.name || "Sélectionnez votre spécialité"
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Rechercher une spécialité..."
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {filteredSpecialties.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            Aucune spécialité trouvée.
                          </div>
                        ) : (
                          <div className="p-1">
                            {filteredSpecialties.map((specialty) => (
                              <div
                                key={specialty.code}
                                onClick={() => {
                                  console.log('Selecting specialty:', specialty.name, 'Code:', specialty.code);
                                  field.onChange(specialty.code);
                                  setOpen(false);
                                  setSearchValue("");
                                }}
                                className={cn(
                                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                  field.value === specialty.code && "bg-accent text-accent-foreground"
                                )}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{specialty.name}</span>
                                  <Check
                                    className={cn(
                                      "h-4 w-4",
                                      field.value === specialty.code ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
                {specialties.length > 0 && !error && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {specialties.length} spécialités disponibles
                  </p>
                )}
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
}
