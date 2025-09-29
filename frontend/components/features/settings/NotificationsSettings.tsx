import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SettingsCard } from "@/components/ui/settings-card"

export function NotificationsSettings() {
  return (
    <div className="space-y-4">
      {/* Events Card */}
      <SettingsCard
        title="Événements"
        description="Aucun détail patient n'est envoyé par email/SMS."
      >
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox id="submission-sent" defaultChecked />
              <Label htmlFor="submission-sent" className="text-sm">
                Soumission envoyée
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox id="accepted-by-ramq" defaultChecked />
              <Label htmlFor="accepted-by-ramq" className="text-sm">
                Acceptée par la RAMQ
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox id="rejected-to-correct" defaultChecked />
              <Label htmlFor="rejected-to-correct" className="text-sm">
                Rejetée / à corriger
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox id="validation-reminder" defaultChecked />
              <Label htmlFor="validation-reminder" className="text-sm">
                     Rappel &quot;À valider&quot; la veille
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox id="weekly-recap" />
              <Label htmlFor="weekly-recap" className="text-sm">
                Récap hebdomadaire (montant, rejets, tâches)
              </Label>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
