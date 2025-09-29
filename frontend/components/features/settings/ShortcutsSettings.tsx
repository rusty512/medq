import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SettingsCard } from "@/components/ui/settings-card"
import { IconPlus } from "@tabler/icons-react"

export function ShortcutsSettings() {
  const shortcuts = [
    { key: "A", type: "Acte", mapping: "Visite principale", origin: "Manuscrit" },
    { key: "B", type: "Acte", mapping: "Consultation", origin: "Manuscrit" },
    { key: "1", type: "Acte", mapping: "Vaccination", origin: "Manuscrit" },
    { key: "X", type: "Acte", mapping: "Examen physique", origin: "Système" },
  ]

  return (
    <div className="space-y-4">
      {/* Shortcuts Card */}
      <SettingsCard
        title="Raccourcis"
        description="Gérez vos raccourcis de facturation personnalisés"
      >
        <div className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Clé</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Mappage</TableHead>
                <TableHead className="w-[120px]">Origine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortcuts.map((shortcut, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs px-2 py-1">
                      {shortcut.key}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{shortcut.type}</TableCell>
                  <TableCell className="text-sm">{shortcut.mapping}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {shortcut.origin}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Button variant="outline" className="w-full">
            <IconPlus className="w-4 h-4 mr-2" />
            Ajouter un raccourci
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
}
