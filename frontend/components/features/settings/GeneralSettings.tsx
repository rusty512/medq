"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SettingsCard } from "@/components/ui/settings-card"
import { useAuth } from "@/lib/auth-context"
import { UserService, UserData } from "@/lib/user-service"

export function GeneralSettings() {
  const { user: authUser, userData, loading: authLoading, userDataLoading, refreshUserData } = useAuth()
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [isDirty, setIsDirty] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Update form fields when userData changes
  React.useEffect(() => {
    if (userData && authUser) {
      console.log('GeneralSettings - User data updated:', userData)
      setFirstName(userData.first_name || "")
      setLastName(userData.last_name || "")
      setEmail(authUser.email || "")
      setIsDirty(false)
    }
  }, [userData, authUser])

  const onSave = async () => {
    if (!userData) return
    
    setIsLoading(true)
    try {
      const updatedUser = await UserService.updateUser({
        first_name: firstName || null,
        last_name: lastName || null,
      })
      
      if (updatedUser) {
        // Refresh user data in AuthContext
        await refreshUserData()
        setIsDirty(false)
        console.log('GeneralSettings - User data saved and refreshed')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onFieldChange = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setIsDirty(true)
  }

  return (
    <div className="space-y-4">
      {/* Personal Information Card */}
      <SettingsCard
        title="Informations personnelles"
        description="Vos informations personnelles de base"
        onSave={onSave}
        isDirty={isDirty}
        isLoading={isLoading}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
            <Input id="firstName" placeholder="Jean" value={firstName} onChange={(e) => onFieldChange(setFirstName)(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
            <Input id="lastName" placeholder="Dupont" value={lastName} onChange={(e) => onFieldChange(setLastName)(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Adresse courriel</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="jean.dupont@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full max-w-[400px]"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Password Card */}
      <SettingsCard
        title="Mot de passe"
        description="Modifiez votre mot de passe"
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">Mot de passe actuel</Label>
            <Input id="currentPassword" type="password" placeholder="••••••••" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">Nouveau mot de passe</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" />
            <p className="text-xs text-muted-foreground mt-1">
              Votre nouveau mot de passe doit contenir plus de 8 caractères.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le nouveau mot de passe</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" />
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
