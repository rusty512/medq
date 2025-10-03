"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsCard } from "@/components/ui/settings-card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { IconPlus, IconEdit, IconTrash, IconStar, IconChevronsDown, IconCheck } from "@tabler/icons-react"
import { useAuth } from "@/lib/auth-context"
import { UserService, UserData, Establishment as UserEstablishment } from "@/lib/user-service"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Specialty {
  code: string;
  name: string;
  displayName: string;
  isActive: boolean;
}

export function ProfileSettings() {
  const { user: authUser, userData, loading: authLoading, userDataLoading, refreshUserData } = useAuth()
  const [specialtyCode, setSpecialtyCode] = useState("")
  const [professionalId, setProfessionalId] = useState("")
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [establishmentsLoading, setEstablishmentsLoading] = useState(false)

  // Establishment management state - will be populated from userData
  const [establishments, setEstablishments] = useState<UserEstablishment[]>([])
  
  // Local state for pending changes
  const [pendingEstablishments, setPendingEstablishments] = useState<UserEstablishment[]>([])
  const [pendingDefaultId, setPendingDefaultId] = useState<number | null>(null)
  const [establishmentsDirty, setEstablishmentsDirty] = useState(false)

  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
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

  const handleAddEstablishment = (selectedEstablishment: any) => {
    // Check if already added
    const isAlreadyAdded = pendingEstablishments.find((ue: any) => ue.establishment?.id === selectedEstablishment.id);
    if (isAlreadyAdded) return;

    // Create a mock UserEstablishment object for local state
    const newUserEstablishment: UserEstablishment = {
      id: Date.now(), // Temporary ID for local state
      user_id: userData?.id || 0,
      establishment_id: selectedEstablishment.id,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      establishment: selectedEstablishment
    };

    setPendingEstablishments(prev => [...prev, newUserEstablishment]);
    setEstablishmentsDirty(true);
    setSearchValue("");
    setOpen(false);
  };

  const handleRemoveEstablishment = (establishmentId: number) => {
    setPendingEstablishments(prev => prev.filter(ue => ue.establishment.id !== establishmentId));
    
    // If removing the pending default, clear it
    if (pendingDefaultId === establishmentId) {
      setPendingDefaultId(null);
    }
    
    setEstablishmentsDirty(true);
  };

  const handleSetDefault = (establishmentId: number) => {
    setPendingDefaultId(establishmentId);
    setEstablishmentsDirty(true);
  };

  // Load specialties from API
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        setSpecialtiesLoading(true)
        const response = await fetch('/api/specialties')
        if (response.ok) {
          const data = await response.json()
          setSpecialties(data)
          console.log('ProfileSettings - Loaded specialties:', data.length)
        } else {
          console.error('Failed to load specialties:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to load specialties:', error)
      } finally {
        setSpecialtiesLoading(false)
      }
    }
    
    loadSpecialties()
  }, [])

  // Update form fields when userData changes
  useEffect(() => {
    if (userData) {
      console.log('ProfileSettings - User data updated:', userData)
      setSpecialtyCode(userData.specialty_code || "")
      setProfessionalId(userData.professional_id || "")
      setEstablishments(userData.establishments || [])
      setPendingEstablishments(userData.establishments || [])
      setPendingDefaultId(userData.default_establishment?.id || null)
      setIsDirty(false)
      setEstablishmentsDirty(false)
    }
  }, [userData])

  const onSaveSpecialty = async () => {
    if (!userData) return
    
    setIsLoading(true)
    try {
      // Save specialty and professional ID changes only
      const specialty = specialties.find(s => s.code === specialtyCode)
      const updatedUser = await UserService.updateUser({
        specialty_code: specialtyCode || null,
        specialty_name: specialty?.name || null,
        professional_id: professionalId || null,
      })
      
      if (updatedUser) {
        // Refresh user data in AuthContext
        await refreshUserData()
        setIsDirty(false)
        console.log('ProfileSettings - Specialty data saved and refreshed')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSaveEstablishments = async () => {
    if (!userData) return
    
    setEstablishmentsLoading(true)
    try {
      // Save establishment changes only
      await saveEstablishmentChanges()
      
      // Refresh user data in AuthContext
      await refreshUserData()
      setEstablishmentsDirty(false)
      console.log('ProfileSettings - Establishment data saved and refreshed')
    } catch (error) {
      console.error('Failed to save establishment changes:', error)
    } finally {
      setEstablishmentsLoading(false)
    }
  }

  const saveEstablishmentChanges = async () => {
    if (!userData) return

    try {
      // Get current establishments from server
      const currentEstablishments = establishments
      const currentDefaultId = userData.default_establishment?.id || null

      // Find establishments to add
      const toAdd = pendingEstablishments.filter(pending => 
        !currentEstablishments.find(current => current.establishment.id === pending.establishment.id)
      )

      // Find establishments to remove
      const toRemove = currentEstablishments.filter(current => 
        !pendingEstablishments.find(pending => pending.establishment.id === current.establishment.id)
      )

      // Add new establishments
      for (const establishment of toAdd) {
        await UserService.addEstablishment(establishment.establishment.id)
      }

      // Remove establishments
      for (const establishment of toRemove) {
        await UserService.removeEstablishment(establishment.establishment.id)
      }

      // Set default establishment if changed
      if (pendingDefaultId !== currentDefaultId) {
        if (pendingDefaultId) {
          await UserService.setDefaultEstablishment(pendingDefaultId)
        }
      }

      console.log('Establishment changes saved:', {
        added: toAdd.length,
        removed: toRemove.length,
        defaultChanged: pendingDefaultId !== currentDefaultId
      })
    } catch (error) {
      console.error('Failed to save establishment changes:', error)
      throw error
    }
  }

  const onFieldChange = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    setIsDirty(true)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
      {/* Specialty & Identifiers Card */}
      <SettingsCard
        title="Spécialité & identifiants"
        description="Vos informations professionnelles RAMQ"
        onSave={onSaveSpecialty}
        isDirty={isDirty}
        isLoading={isLoading}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-sm font-medium">Spécialité</Label>
            <Select value={specialtyCode} onValueChange={onFieldChange(setSpecialtyCode)} disabled={specialtiesLoading}>
              <SelectTrigger className="w-full max-w-[350px]">
                <SelectValue placeholder={specialtiesLoading ? "Chargement..." : "Sélectionner votre spécialité"} />
              </SelectTrigger>
              <SelectContent>
                {specialties
                  .filter(specialty => specialty.isActive)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((specialty) => (
                    <SelectItem key={specialty.code} value={specialty.code}>
                      {specialty.displayName}
                    </SelectItem>
                  ))}
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
              value={professionalId}
              onChange={(e) => onFieldChange(setProfessionalId)(e.target.value)}
              className="w-full max-w-[300px]"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Establishment Card */}
      <SettingsCard
        title="Établissement"
        description="Gérez vos établissements de pratique"
        onSave={onSaveEstablishments}
        isDirty={establishmentsDirty}
        isLoading={establishmentsLoading}
      >
        <div className="space-y-4">
          {/* Establishment Search */}
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
                <IconChevronsDown className="h-4 w-4" />
              </Button>
              
              {/* Dropdown Results */}
              {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-auto">
                  {results.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      {isLoading ? "Recherche en cours..." : searchValue ? "Aucun établissement trouvé" : "Commencez à taper pour rechercher"}
                    </div>
                  ) : (
                    <div className="p-1">
                      {results.map((establishment) => {
                        const isAlreadyAdded = pendingEstablishments.find(ue => ue.establishment.id === establishment.id);
                        return (
                          <div
                            key={establishment.id}
                            onClick={() => !isAlreadyAdded && handleAddEstablishment(establishment)}
                            className={cn(
                              "flex items-start justify-between gap-3 p-3 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              isAlreadyAdded && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center">
                                {isAlreadyAdded && (
                                  <IconCheck className="mr-2 h-4 w-4 shrink-0" />
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
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Selected establishments */}
          {pendingEstablishments.length > 0 && (
            <div className="space-y-2">
              <Label>Établissements sélectionnés</Label>
              <div className="rounded-md border divide-y">
                {pendingEstablishments.map((userEstablishment) => (
                  <div key={userEstablishment.id} className="flex items-start justify-between px-4 py-3 hover:bg-muted/50">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-sm">{userEstablishment.establishment.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{userEstablishment.establishment.address}</div>
                      {pendingDefaultId === userEstablishment.establishment.id && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">Établissement par défaut</div>
                      )}
                    </div>
                    <div className="flex items-start gap-2 pl-4 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mt-0.5"
                        onClick={() => handleSetDefault(userEstablishment.establishment.id)}
                      >
                        <IconStar 
                          className={cn(
                            "h-4 w-4",
                            pendingDefaultId === userEstablishment.establishment.id ? "text-primary fill-primary" : "text-muted-foreground"
                          )}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mt-0.5 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveEstablishment(userEstablishment.establishment.id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SettingsCard>
      </div>
    </TooltipProvider>
  )
}
