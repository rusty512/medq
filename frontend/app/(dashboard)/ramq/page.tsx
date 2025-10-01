"use client"

import { HeaderRow } from "@/components/features/blocks/HeaderRow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, FileDown, Clock } from "lucide-react"

type Submission = {
  id: string
  name: string
  period: string
  status: "pending" | "approved" | "rejected"
  amount: string
}

const rows: Submission[] = [
  {
    id: "sub_001",
    name: "Facturation Septembre 2025",
    period: "22 août – 28 septembre 2025",
    status: "pending",
    amount: "$12,340.00",
  },
  {
    id: "sub_002",
    name: "Facturation #12345",
    period: "15 – 21 septembre 2025",
    status: "approved",
    amount: "$8,210.00",
  },
  {
    id: "sub_003",
    name: "Facturation #12312",
    period: "8 – 14 septembre 2025",
    status: "rejected",
    amount: "$3,120.00",
  },
]

function StatusBadge({ value }: { value: Submission["status"] }) {
  if (value === "approved") {
    return (
      <Badge className="border-0 text-green-700 bg-green-100 hover:bg-green-100">
        Approuvé
      </Badge>
    )
  }
  if (value === "rejected") {
    return (
      <Badge className="border-0 text-red-700 bg-red-100 hover:bg-red-100">
        Rejeté
      </Badge>
    )
  }
  return (
    <Badge className="border-0 text-amber-700 bg-amber-100 hover:bg-amber-100">
      En attente
    </Badge>
  )
}

export default function Page() {
  return (
    <div className="space-y-6">
      <HeaderRow
        title="Facturations soumises à la RAMQ"
        subtitle="Historique des périodes de facturation envoyées"
      />

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nom / Identifiant</TableHead>
              <TableHead>Période couverte</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Montant total</TableHead>
              <TableHead className="w-[96px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {r.period}
                  </span>
                </TableCell>
                <TableCell><StatusBadge value={r.status} /></TableCell>
                <TableCell className="text-right">{r.amount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Voir détails">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Exporter">
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
//
