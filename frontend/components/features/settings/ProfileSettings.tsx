import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsCard } from "@/components/ui/settings-card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { IconPlus, IconEdit, IconTrash, IconStar, IconChevronsDown, IconCheck } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Establishment {
  id: string
  name: string
  address: string
  code: string
  category: string
  type: string
  regionCode: string
  isDefault: boolean
}

export function ProfileSettings() {
  const [establishments, setEstablishments] = useState<Establishment[]>([
    { id: "1", name: "CHUM – Hôpital", address: "1051 rue Sanguinet, Montréal", code: "00443-03", category: "CM", type: "CAB", regionCode: "06", isDefault: true },
    { id: "2", name: "CLSC Plateau-Mont-Royal", address: "4659 rue Saint-Denis, Montréal", code: "00123-01", category: "CM", type: "CLSC", regionCode: "06", isDefault: false },
    { id: "3", name: "Clinique Privée", address: "1234 rue Sherbrooke, Montréal", code: "00999-05", category: "CM", type: "CAB", regionCode: "06", isDefault: false },
  ])

  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

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
  // Reset search when modal closes
  useEffect(() => {
    if (!modalOpen) {
      setSearchValue("");
    }
  }, [modalOpen]);

  const handleAddEstablishment = (establishment: any) => {
    const normalized = {
      id: String(establishment.id),
      name: establishment.name ?? "",
      address: establishment.address ?? "",
      code: establishment.code ?? "",
      category: establishment.category ?? "",
      type: establishment.type ?? establishment.establishment_type ?? "",
      regionCode: establishment.regionCode ?? "",
      isDefault: false,
    };
    if (!establishments.find((est) => est.id === normalized.id)) {
      setEstablishments(prev => [...prev, normalized]);
    }
    // Reset search and close modal after adding
    setSearchValue("");
    setModalOpen(false);
  };

  const handleRemoveEstablishment = (id: string) => {
    const updatedEstablishments = establishments.filter((est) => est.id !== id);
    // If removing the default, set the first remaining as default
    if (establishments.find(est => est.id === id)?.isDefault && updatedEstablishments.length > 0) {
      updatedEstablishments[0].isDefault = true;
    }
    setEstablishments(updatedEstablishments);
  };

  const handleSetDefault = (id: string) => {
    setEstablishments(prev => 
      prev.map(est => ({ ...est, isDefault: est.id === id }))
    );
  };

  // Auto-set default if only one establishment
  useEffect(() => {
    if (establishments.length === 1 && !establishments[0].isDefault) {
      setEstablishments(prev => 
        prev.map(est => ({ ...est, isDefault: true }))
      );
    }
  }, [establishments.length]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
      {/* Specialty & Identifiers Card */}
      <SettingsCard
        title="Spécialité & identifiants"
        description="Vos informations professionnelles RAMQ"
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-sm font-medium">Spécialité</Label>
            <Select>
              <SelectTrigger className="w-full max-w-[350px]">
                <SelectValue placeholder="Sélectionner votre spécialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Médecine générale</SelectItem>
                <SelectItem value="cardiology">Cardiologie</SelectItem>
                <SelectItem value="dermatology">Dermatologie</SelectItem>
                <SelectItem value="nephrology">Néphrologie</SelectItem>
                <SelectItem value="pediatrics">Pédiatrie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ramqNumber" className="text-sm font-medium">Numéro du professionnel RAMQ</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Aussi appelé no. fournisseur.
            </p>
            <Input 
              id="ramqNumber" 
              placeholder="1234567890"
              className="w-full max-w-[300px]"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Establishment Card */}
      <SettingsCard
        title="Établissement"
        description="Gérez vos établissements de pratique"
      >
        <div className="space-y-3">
          <div className="space-y-2">
            {establishments.map((establishment) => (
              <div 
                key={establishment.id} 
                className="group flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{establishment.name}</p>
                      {establishment.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          <IconStar className="w-3 h-3 mr-1 fill-current" />
                          Défaut
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">{establishment.address}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Code: {establishment.code}</span>
                      <span>Cat: {establishment.category}</span>
                      <span>Type: {establishment.type}</span>
                      <span>Région: {establishment.regionCode}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!establishment.isDefault && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                          onClick={() => handleSetDefault(establishment.id)}
                        >
                          <IconStar className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Définir comme établissement par défaut</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveEstablishment(establishment.id)}
                      >
                        <IconTrash className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Supprimer cet établissement</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
          
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <IconPlus className="w-4 h-4 mr-2" />
                Ajouter un établissement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un établissement</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <Command className="rounded-lg border shadow-md">
                  <CommandInput
                    placeholder="Rechercher un établissement..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isLoading ? "Recherche en cours..." : searchValue ? "Aucun établissement trouvé" : "Commencez à taper pour rechercher"}
                    </CommandEmpty>
                    {results.length > 0 && (
                      <CommandGroup>
                        {results.map((establishment) => {
                          const isAlreadyAdded = establishments.find(est => est.id === String(establishment.id));
                          return (
                            <CommandItem
                              key={establishment.id}
                              onSelect={() => !isAlreadyAdded && handleAddEstablishment(establishment)}
                              disabled={isAlreadyAdded}
                              className={cn(
                                "flex items-center justify-between p-3 cursor-pointer",
                                isAlreadyAdded && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium truncate">{establishment.name}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mb-1">{establishment.address}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Code: {establishment.code || 'N/A'}</span>
                                    <span>Cat: {establishment.category || 'N/A'}</span>
                                    <span>Type: {establishment.type || 'N/A'}</span>
                                    <span>Région: {establishment.regionCode || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              {isAlreadyAdded && (
                                <IconCheck className="w-4 h-4 text-green-600" />
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SettingsCard>
      </div>
    </TooltipProvider>
  )
}
