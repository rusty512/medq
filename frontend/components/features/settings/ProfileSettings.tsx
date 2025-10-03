"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsCard } from "@/components/ui/settings-card"
import { IconPlus, IconEdit } from "@tabler/icons-react"
import { useAuth } from "@/lib/auth-context"
import { UserService, UserData } from "@/lib/user-service"
import { useState, useEffect } from "react"

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

  // Mock establishments - these should come from the user's actual establishments
  const establishments = [
    { name: "CHUM – Hôpital", code: "00443-03", icon: "🏥" },
    { name: "CLSC Plateau-Mont-Royal", code: "00123-01", icon: "🏥" },
    { name: "Clinique Privée", code: "00999-05", icon: "🏥" },
  ]

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
      setIsDirty(false)
    }
  }, [userData])

  const onSave = async () => {
    if (!userData) return
    
    setIsLoading(true)
    try {
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
        console.log('ProfileSettings - User data saved and refreshed')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onFieldChange = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    setIsDirty(true)
  }

  return (
    <div className="space-y-4">
      {/* Specialty & Identifiers Card */}
      <SettingsCard
        title="Spécialité & identifiants"
        description="Vos informations professionnelles RAMQ"
        onSave={onSave}
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
      >
        <div className="space-y-3">
          <div className="space-y-2">
            {establishments.map((establishment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background/30">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{establishment.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{establishment.name}</p>
                    <p className="text-xs text-muted-foreground">{establishment.code}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <IconEdit className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full">
            <IconPlus className="w-4 h-4 mr-2" />
            Ajouter un établissement
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
}
