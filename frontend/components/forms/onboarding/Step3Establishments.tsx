"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Star, Trash2, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Step3Establishments() {
  const { watch, setValue } = useFormContext();
  const establishments = watch("establishments") || [];
  const [defaultEstablishmentId, setDefaultEstablishmentId] = useState<string | null>((establishments.find((e: any) => e.isDefault) || null)?.id || null);

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Load establishments with search
  useEffect(() => {
    const loadEstablishments = async () => {
      setIsLoading(true);
      try {
        const searchParam = searchValue ? `&search=${encodeURIComponent(searchValue)}` : '';
        const res = await fetch(`/api/establishments?limit=500${searchParam}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data || []);
        }
      } catch (err) {
        console.error('Failed to load establishments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(loadEstablishments, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Results are already filtered by server-side search
  const filteredEstablishments = results;

  const handleAddEstablishment = (establishment: any) => {
    const normalized = {
      id: String(establishment.id),
      name: establishment.name ?? "",
      address: establishment.address ?? "",
      // Map backend shape to schema-required `type`
      type: establishment.type ?? establishment.establishment_type ?? establishment.category ?? "",
      isDefault: false,
    };
    if (!establishments.find((est: any) => est.id === normalized.id)) {
      const newEstablishments = [...establishments, normalized];
      setValue("establishments", newEstablishments, { shouldDirty: true, shouldValidate: true });
    }
    // Reset search and close popover after adding
    setSearchValue("");
    setOpen(false);
  };

  const handleRemoveEstablishment = (id: string) => {
    const updatedEstablishments = establishments.filter((est: any) => est.id !== id);
    setValue("establishments", updatedEstablishments);
    if (defaultEstablishmentId === id) {
      setDefaultEstablishmentId(null);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultEstablishmentId(id);
    const updated = establishments.map((e: any) => ({ ...e, isDefault: e.id === id }));
    setValue("establishments", updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Establishment Combobox */}
        <div className="space-y-2">
          <Label>Ajouter un établissement</Label>
          <div className="relative" data-dropdown>
            <Input
              placeholder="Rechercher un établissement..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="w-full"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setOpen(!open)}
            >
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
            
            {/* Dropdown Results */}
            {open && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-auto">
                {filteredEstablishments.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Aucun établissement trouvé
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredEstablishments.map((establishment) => (
                      <div
                        key={establishment.id}
                        onClick={() => handleAddEstablishment(establishment)}
                        className="flex items-start justify-between gap-3 p-3 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            {establishments.find((e: any) => e.id === establishment.id) && (
                              <Check className="mr-2 h-4 w-4 shrink-0" />
                            )}
                            <span className="font-medium truncate">{establishment.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground block truncate">{establishment.address}</span>
                          {establishment.codes && establishment.codes.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {establishment.codes.map((code: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-[10px] px-1 py-0">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Selected establishments */}
        {establishments.length > 0 && (
          <div className="space-y-2">
            <Label>Établissements sélectionnés</Label>
            <div className="rounded-md border divide-y">
              {establishments.map((establishment: any) => (
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
