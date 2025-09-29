"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SettingsCard } from "@/components/ui/settings-card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

type CurrentUser = {
  id: string
  email: string
  personalInfo?: { firstName?: string; lastName?: string; phone?: string }
  professionalInfo?: { specialty?: string; licenseNumber?: string }
}

export function GeneralSettings() {
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [isDirty, setIsDirty] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Load current user on mount
  React.useEffect(() => {
    let cancelled = false
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null

    async function loadUser() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include'
        })
        const data = await res.json()
        if (!cancelled && data && data.user) {
          const u: CurrentUser = data.user
          setEmail(u.email || "")
          setFirstName(u.personalInfo?.firstName || "")
          setLastName(u.personalInfo?.lastName || "")
          setIsDirty(false)
        }
      } catch (_e) {
        // swallow for now; a toast system can be added later
      }
    }
    loadUser()
    return () => { cancelled = true }
  }, [])

  const onSave = async () => {
    setIsLoading(true)
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          personalInfo: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          }
        })
      })
      if (!res.ok) {
        // Best-effort error handling; production should surface a toast
        return
      }
      setIsDirty(false)
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
