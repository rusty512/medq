import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsCard } from "@/components/ui/settings-card"
import { IconPlus, IconEdit } from "@tabler/icons-react"

export function ProfileSettings() {
  const establishments = [
    { name: "CHUM – Hôpital", code: "00443-03", icon: "🏥" },
    { name: "CLSC Plateau-Mont-Royal", code: "00123-01", icon: "🏥" },
    { name: "Clinique Privée", code: "00999-05", icon: "🏥" },
  ]

  return (
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
