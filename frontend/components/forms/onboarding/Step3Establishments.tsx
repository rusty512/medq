"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Check, ChevronsUpDown, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Step3Establishments() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { getValues, setValue } = useFormContext();
  const formData = getValues();
  const [defaultEstablishmentId, setDefaultEstablishmentId] = useState<string | null>((formData.establishments.find((e: any) => e.isDefault) || null)?.id || null);

  // Mock RAMQ establishments list with codes - in real app, this would come from API
  const ramqEstablishments = [
    { id: "1", name: "Hôpital Notre-Dame", address: "1560 Rue Sherbrooke E, Montréal, QC", codes: ["HND001", "HND-MTL", "HND-1560"] },
    { id: "2", name: "CHU Sainte-Justine", address: "3175 Chemin de la Côte-Sainte-Catherine, Montréal, QC", codes: ["CHUSJ001", "CHUSJ-MTL", "CHUSJ-3175"] },
    { id: "3", name: "Institut de Cardiologie de Montréal", address: "5000 Rue Bélanger, Montréal, QC", codes: ["ICM001", "ICM-MTL", "ICM-5000"] },
    { id: "4", name: "Clinique médicale Saint-Luc", address: "123 Rue de la Santé, Montréal, QC", codes: ["CMSL001", "CMSL-MTL", "CMSL-123"] },
    { id: "5", name: "Centre hospitalier de l'Université de Montréal", address: "1058 Rue Saint-Denis, Montréal, QC", codes: ["CHUM001", "CHUM-MTL", "CHUM-1058"] },
    { id: "6", name: "Hôpital général de Montréal", address: "1650 Rue Cedar, Montréal, QC", codes: ["HGM001", "HGM-MTL", "HGM-1650"] },
    { id: "7", name: "Clinique externe de pédiatrie", address: "456 Avenue du Parc, Montréal, QC", codes: ["CEP001", "CEP-MTL", "CEP-456"] },
    { id: "8", name: "Centre de santé communautaire", address: "789 Boulevard Saint-Laurent, Montréal, QC", codes: ["CSC001", "CSC-MTL", "CSC-789"] },
  ];

  const filteredEstablishments = ramqEstablishments.filter(est => {
    const matchesSearch = est.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      est.address.toLowerCase().includes(searchValue.toLowerCase()) ||
      est.codes.some(code => code.toLowerCase().includes(searchValue.toLowerCase()));
    return matchesSearch;
  });

  const handleAddEstablishment = (establishment: any) => {
    if (!formData.establishments.find((est: any) => est.id === establishment.id)) {
      setValue("establishments", [...formData.establishments, { ...establishment, isDefault: false }]);
    }
    setSearchValue("");
    setOpen(false);
  };

  const handleRemoveEstablishment = (id: string) => {
    const updatedEstablishments = formData.establishments.filter((est: any) => est.id !== id);
    setValue("establishments", updatedEstablishments);
    if (defaultEstablishmentId === id) {
      setDefaultEstablishmentId(null);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultEstablishmentId(id);
    const updated = formData.establishments.map((e: any) => ({ ...e, isDefault: e.id === id }));
    setValue("establishments", updated);
  };

  // Skip handled by parent page footer to match global layout

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Establishment Combobox */}
        <div className="space-y-2">
          <Label>Rechercher un établissement</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between px-3"
              >
                {searchValue ? 
                  ramqEstablishments.find((est) => est.name === searchValue)?.name || "Sélectionner un établissement..."
                  : "Sélectionner un établissement..."
                }
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Rechercher par nom, adresse ou code..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>Aucun établissement trouvé.</CommandEmpty>
                  <CommandGroup>
                    {filteredEstablishments.map((establishment) => (
                      <CommandItem
                        key={establishment.id}
                        value={establishment.name}
                        onSelect={(currentValue) => {
                          setSearchValue(currentValue === searchValue ? "" : currentValue)
                          setOpen(false)
                          handleAddEstablishment(establishment)
                        }}
                        className="py-1 px-1"
                      >
                        <div className="flex w-full items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center">
                              {searchValue === establishment.name && (
                                <Check className="mr-2 h-4 w-4 shrink-0" />
                              )}
                              <span className="font-medium truncate">{establishment.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground block truncate">{establishment.address}</span>
                            <div className="flex gap-1 mt-1">
                              {establishment.codes.map((code, index) => (
                                <Badge key={index} variant="outline" className="text-[10px] px-1 py-0">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Selected establishments */}
        {formData.establishments.length > 0 && (
          <div className="space-y-2">
            <Label>Établissements sélectionnés</Label>
            <div className="rounded-md border divide-y">
              {formData.establishments.map((establishment: any) => (
                <div key={establishment.id} className="flex items-start justify-between px-4 py-3 hover:bg-muted/50">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-sm">{establishment.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{establishment.address}</div>
                    {establishment.isDefault && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">Établissement par défaut</div>
                    )}
                  </div>
                  <div className="flex items-start gap-2 pl-4 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mt-0.5"
                      onClick={() => handleSetDefault(establishment.id)}
                    >
                      <Star 
                        className={cn(
                          "h-4 w-4",
                          establishment.isDefault ? "text-primary fill-primary" : "text-muted-foreground"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mt-0.5 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveEstablishment(establishment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skip action moved to page footer for consistent layout */}
      </div>
    </div>
  );
}
