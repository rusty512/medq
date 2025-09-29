"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, Edit3, X } from "lucide-react"

export type BillingCodeState = "approved" | "pending" | "invalid" | "empty"

export type BillingCell = {
  code: string
  state: BillingCodeState
  error?: string
}

export type BillingRow = {
  patient: string
  patientId: string
  etab: string
  lun: BillingCell
  mar: BillingCell
  mer: BillingCell
  jeu: BillingCell
  ven: BillingCell
  sam: BillingCell
  dim: BillingCell
}

export type BillingTableProps = {
  data: BillingRow[]
  onCellUpdate: (rowIndex: number, day: string, cell: BillingCell) => void
  className?: string
  variant?: "default" | "compact" | "minimal"
  showColumns?: string[]
  maxRows?: number
  showPatientDetails?: boolean
  showEtabColumn?: boolean
}

const dayColumns = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"]
const dayLabels = ["Lun '1", "Mar '2", "Mer '3", "Jeu '4", "Ven '5", "Sam '6", "Dim '7"]

export function BillingTable({ 
  data, 
  onCellUpdate, 
  className,
  variant = "default",
  showColumns = dayColumns,
  maxRows,
  showPatientDetails = true,
  showEtabColumn = true
}: BillingTableProps) {
  const [editingCell, setEditingCell] = React.useState<{ row: number; day: string } | null>(null)
  const [editValue, setEditValue] = React.useState("")

  // Filter data based on maxRows
  const displayData = maxRows ? data.slice(0, maxRows) : data

  // Get column configuration
  const columnsToShow = showColumns
  const columnLabels = columnsToShow.map(day => {
    const index = dayColumns.indexOf(day)
    return dayLabels[index] || day
  })

  // Get variant-specific classes using shadcn spacing
  const getVariantClasses = () => {
    switch (variant) {
      case "compact":
        return "text-sm"
      case "minimal":
        return "text-xs"
      default:
        return "text-sm"
    }
  }

  const getBadgeVariant = (state: BillingCodeState) => {
    switch (state) {
      case "approved": return "default"
      case "pending": return "secondary"
      case "invalid": return "destructive"
      case "empty": return "outline"
      default: return "secondary"
    }
  }

  const getCellContent = (cell: BillingCell) => {
    if (cell.state === "empty") {
      return "—"
    }
    return cell.code
  }

  const handleCellClick = (rowIndex: number, day: string, cell: BillingCell) => {
    if (cell.state === "empty") {
      setEditingCell({ row: rowIndex, day })
      setEditValue("")
    } else {
      setEditingCell({ row: rowIndex, day })
      setEditValue(cell.code)
    }
  }

  const handleApprove = (rowIndex: number, day: string, cell: BillingCell) => {
    onCellUpdate(rowIndex, day, { ...cell, state: "approved" })
  }

  const handleSave = (rowIndex: number, day: string) => {
    if (editValue.trim()) {
      const newState: BillingCodeState = editValue.includes("ERR") ? "invalid" : "pending"
      onCellUpdate(rowIndex, day, {
        code: editValue.trim(),
        state: newState,
        error: newState === "invalid" ? "Invalid code format" : undefined
      })
    }
    setEditingCell(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingCell(null)
    setEditValue("")
  }

  return (
    <div className={cn("w-full", getVariantClasses(), className)}>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {showPatientDetails && (
                <TableHead className="w-48">Patients</TableHead>
              )}
              {showEtabColumn && (
                <TableHead className="w-20">Étab.</TableHead>
              )}
              {columnLabels.map((label) => (
                <TableHead key={label} className="w-24 text-center">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {showPatientDetails && (
                  <TableCell>
                    <div>
                      <div className="font-medium">{row.patient}</div>
                      {variant !== "minimal" && (
                        <div className="text-sm text-muted-foreground">{row.patientId}</div>
                      )}
                    </div>
                  </TableCell>
                )}
                {showEtabColumn && (
                  <TableCell>{row.etab}</TableCell>
                )}
                {columnsToShow.map((day) => {
                  const cell = row[day as keyof BillingRow] as BillingCell
                  const isEditing = editingCell?.row === rowIndex && editingCell?.day === day
                  
                  return (
                    <TableCell key={day} className="text-center">
                      {isEditing ? (
                        <Popover open={true} onOpenChange={handleCancel}>
                          <PopoverTrigger asChild>
                            <div />
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-3" align="center">
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium">Billing Code</label>
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  placeholder="Enter code..."
                                  className="mt-1"
                                  autoFocus
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSave(rowIndex, day)}>
                                  <Check className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="group">
                          <Badge 
                            variant={getBadgeVariant(cell.state)} 
                            className="cursor-pointer transition-all duration-200 group-hover:gap-1.5 inline-flex items-center w-fit"
                            onClick={() => handleCellClick(rowIndex, day, cell)}
                          >
                            <span className="whitespace-nowrap">{getCellContent(cell)}</span>
                            
                            {/* Inline icons that appear on hover - no space when hidden */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 w-0 group-hover:w-auto overflow-hidden">
                              {cell.state === "pending" && (
                                <button
                                  className="hover:bg-black/10 active:bg-black/20 rounded p-0.5 transition-colors flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleApprove(rowIndex, day, cell)
                                  }}
                                  title="Approve"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                className="hover:bg-black/10 active:bg-black/20 rounded p-0.5 transition-colors flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCellClick(rowIndex, day, cell)
                                }}
                                title="Edit"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                            </div>
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
