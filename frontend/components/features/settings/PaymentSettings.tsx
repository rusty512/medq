import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SettingsCard } from "@/components/ui/settings-card"

export function PaymentSettings() {
  return (
    <div className="space-y-4">
      {/* Banking Information Card */}
      <SettingsCard
        title="Informations bancaires"
        description="Ces informations sont utilisées pour les dépôts directs de la RAMQ."
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <div>
              <Label htmlFor="bankName" className="text-sm font-medium">Nom de la banque</Label>
            </div>
            <Input 
              id="bankName" 
              placeholder="Banque Nationale du Canada"
              className="w-full max-w-[400px]"
            />
          </div>
          
          <div className="space-y-2">
            <div>
              <Label htmlFor="accountNumber" className="text-sm font-medium">Numéro de compte</Label>
            </div>
            <Input 
              id="accountNumber" 
              placeholder="1234567890"
              className="w-full max-w-[300px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <Label htmlFor="transit" className="text-sm font-medium">Transit</Label>
              </div>
              <Input 
                id="transit" 
                placeholder="12345"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div>
                <Label htmlFor="institution" className="text-sm font-medium">Institution</Label>
              </div>
              <Input 
                id="institution" 
                placeholder="006"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <Label htmlFor="accountType" className="text-sm font-medium">Type de compte</Label>
            </div>
            <Input 
              id="accountType" 
              placeholder="Chèque"
              className="w-full max-w-[200px]"
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
