"use client";

import { useEffect, useState } from "react";
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
  const { watch, setValue } = useFormContext();
  const establishments = watch("establishments") || [];
  const [defaultEstablishmentId, setDefaultEstablishmentId] = useState<string | null>((establishments.find((e: any) => e.isDefault) || null)?.id || null);

  const [results, setResults] = useState<any[]>([]);
  const [offset, setOffset] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canLoadMoreVisible, setCanLoadMoreVisible] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 100

  useEffect(() => {
    const controller = new AbortController();
    const q = searchValue.trim();
    const fetchData = async () => {
      try {
        const params = q ? `?search=${encodeURIComponent(q)}` : '';
        const res = await fetch(`/api/establishments${params}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        setResults(data || []);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          // swallow network errors silently for this UX
        }
      }
    };
    fetchData();
    return () => {
      if (!controller.signal.aborted) controller.abort();
    };
  }, [searchValue]);

  // initial load all (paged)
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(`/api/establishments?offset=0&limit=${PAGE_SIZE}`, { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setHasMore(Array.isArray(data) && data.length === PAGE_SIZE)
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          // ignore other errors silently for now
        }
      }
    }
    load()
    return () => {
      if (!controller.signal.aborted) controller.abort()
    }
  }, [])

  const filteredEstablishments = results;

  const handleAddEstablishment = (establishment: any) => {
    console.log('Adding establishment:', establishment.name);
    if (!establishments.find((est: any) => est.id === establishment.id)) {
      const newEstablishments = [...establishments, { ...establishment, isDefault: false }];
      console.log('Setting establishments:', newEstablishments);
      setValue("establishments", newEstablishments);
    }
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

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return
    try {
      setIsLoadingMore(true)
      const next = offset + PAGE_SIZE
      const res = await fetch(`/api/establishments?offset=${next}&limit=${PAGE_SIZE}`)
      if (res.ok) {
        const more = await res.json()
        setResults(prev => [...prev, ...(more || [])])
        setOffset(next)
        setHasMore(Array.isArray(more) && more.length === PAGE_SIZE)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }

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
                  filteredEstablishments.find((est) => est.name === searchValue)?.name || "Sélectionner un établissement..."
                  : "Sélectionner un établissement..."
                }
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" avoidCollisions={false} className="z-50 w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Rechercher par nom, adresse ou code..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <div className="max-h-96 flex flex-col">
                  <CommandList
                    className="flex-1 overflow-auto"
                    onScroll={(e) => {
                      const el = e.currentTarget
                      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
                      setCanLoadMoreVisible(atBottom)
                      if (atBottom) {
                        void loadMore()
                      }
                    }}
                  >
                    <CommandEmpty>Aucun établissement trouvé.</CommandEmpty>
                    <CommandGroup>
                      {filteredEstablishments.map((establishment) => (
                        <CommandItem
                          key={establishment.id}
                          value={establishment.name}
                          onSelect={() => {
                            console.log('onSelect triggered for:', establishment.name);
                            handleAddEstablishment(establishment)
                          }}
                          onClick={(ev) => {
                            console.log('onClick triggered for:', establishment.name);
                            ev.preventDefault()
                            ev.stopPropagation()
                            handleAddEstablishment(establishment)
                          }}
                          onMouseDown={(ev) => {
                            console.log('onMouseDown triggered for:', establishment.name);
                            ev.preventDefault()
                            ev.stopPropagation()
                            handleAddEstablishment(establishment)
                          }}
                          className="py-1 px-1 cursor-pointer hover:bg-accent active:bg-accent"
                        >
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-3 text-left"
                          onPointerDown={(ev) => {
                            // Pointer-level handler fires before Radix dismiss layer
                            ev.preventDefault()
                            ev.stopPropagation()
                            handleAddEstablishment(establishment)
                            setOpen(false)
                          }}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center">
                              {establishments.find((e: any) => e.id === establishment.id) && (
                                <Check className="mr-2 h-4 w-4 shrink-0" />
                              )}
                              <span className="font-medium truncate">{establishment.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground block truncate">{establishment.address}</span>
                            <div className="flex gap-1 mt-1">
                              {establishment.codes?.map((code: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-[10px] px-1 py-0">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                  {/* Optional tiny status row at bottom to show loading */}
                  {isLoadingMore && (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      Chargement…
                    </div>
                  )}
                </div>
              </Command>
            </PopoverContent>
          </Popover>
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
