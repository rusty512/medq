"use client"

import * as React from "react"
import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconEdit,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

// Create a separate component for the drag handle

// TODO: Connect to real RAMQ API for patient search
const mockRAMQPatients: any[] = []

// Interactive Act Badge Component
function ActBadge({ 
  act, 
  onApprove, 
  onEdit, 
  onRemove 
}: { 
  act: { code: string; status: "pending" | "approved" | "error" }
  onApprove: () => void
  onEdit: () => void
  onRemove: () => void
}) {
  const statusStyles = {
    approved: { badgeVariant: "default" },
    pending: { badgeVariant: "secondary" },
    error: { badgeVariant: "secondary" },
  } as const

  const styles = statusStyles[act.status]

  return (
    <div className="group relative flex items-center gap-1">
      {/* Main badge - full color pill, never changes size */}
      <Badge
        variant={styles.badgeVariant as any}
      >
        {act.code}
      </Badge>

      {/* Action micro-badges - always present, fade in on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Approve - only for pending */}
          {act.status === "pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onApprove()
              }}
            className="bg-white border border-border rounded-full p-1 hover:bg-muted transition-colors"
              title="Approuver"
            >
            <IconCheck className="w-3 h-3 text-green-600" />
            </button>
          )}
          
        {/* Edit - always available */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          className="bg-white border border-border rounded-full p-1 hover:bg-muted transition-colors"
            title="Modifier"
          >
          <IconEdit className="w-3 h-3 text-muted-foreground" />
          </button>
          
        {/* Remove - always available */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          className="bg-white border border-border rounded-full p-1 hover:bg-muted transition-colors"
            title="Supprimer"
          >
          <IconX className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
    </div>
  )
}

// Day Cell Component for displaying acts/shortcuts
function DayCell({ 
  act, 
  dayName,
  cellId,
  isSelected,
  onCellSelect,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp
}: { 
  act: { code: string; status: "pending" | "approved" | "error" } | undefined
  dayName: string 
  cellId: string
  isSelected: boolean
  onCellSelect: (cellId: string, event: React.MouseEvent) => void
  onCellMouseDown: (cellId: string, event: React.MouseEvent) => void
  onCellMouseEnter: (cellId: string, event: React.MouseEvent) => void
  onCellMouseUp: () => void
}) {
  const isEmpty = !act

  const handleApprove = () => {
    console.log(`Approving act for ${dayName}`)
    // This would update the data in the parent component
  }

  const handleEdit = () => {
    console.log(`Editing act for ${dayName}`)
    // This would open an edit modal
  }

  const handleRemove = () => {
    console.log(`Removing act for ${dayName}`)
    // This would remove the act from the data
  }

  return (
    <>
      {isEmpty ? (
        <div className="group flex items-center justify-start w-full h-full">
          <Badge 
            variant="outline" 
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground cursor-pointer text-xs px-2 py-0.5 h-6"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Turn into inline input
              console.log('Add new act')
            }}
          >
            +
          </Badge>
        </div>
      ) : (
        <div className="group">
        <ActBadge
          act={act}
          onApprove={handleApprove}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
    </div>
      )}
    </>
  )
}

// Patient Search Modal Component
function PatientSearchModal({ 
  currentPatient, 
  onAssociate, 
  onClose 
}: { 
  currentPatient: z.infer<typeof schema>
  onAssociate: (patient: { name: string; nam: string }) => void
  onClose: () => void 
}) {
  const [searchValue, setSearchValue] = React.useState("")
  const [selectedPatient, setSelectedPatient] = React.useState<{ name: string; nam: string } | null>(null)

  // TODO: Connect to real patient search API
  const filteredPatients = React.useMemo(() => {
    // Placeholder for real patient search
    return []
  }, [searchValue])

  const handleAssociate = () => {
    if (selectedPatient) {
      onAssociate(selectedPatient)
      onClose()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rechercher un patient</Label>
        <Command className="border rounded-md">
          <CommandInput 
            placeholder="Nom du patient ou NAM..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          {searchValue && (
            <CommandList>
              <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
              <CommandGroup>
                {filteredPatients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={`${patient.name} ${patient.nam}`}
                    onSelect={() => setSelectedPatient({ name: patient.name, nam: patient.nam })}
                    className={selectedPatient?.nam === patient.nam ? "bg-accent" : ""}
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">{patient.nam}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </Command>
      </div>
      
      {selectedPatient && (
        <div className="p-3 bg-muted rounded-md">
          <div className="text-sm font-medium">Patient sélectionné :</div>
          <div className="space-y-0.5">
            <div className="font-medium">{selectedPatient.name}</div>
            <div className="text-xs text-muted-foreground">{selectedPatient.nam}</div>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button 
          onClick={handleAssociate} 
          disabled={!selectedPatient}
        >
          Associer patient
        </Button>
      </DialogFooter>
    </div>
  )
}

// Calculate dates for day columns with offset support
const getDayDate = (dayName: string, offset: number = 0) => {
  const today = new Date()
  const dayNames = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']
  const dayIndex = dayNames.indexOf(dayName)
  
  if (dayIndex === -1) return dayName
  
  // Calculate the date for this day of the week
  const currentDay = today.getDay() // 0=Sunday, 1=Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay // Monday is day 1
  const mondayDate = new Date(today)
  mondayDate.setDate(today.getDate() + mondayOffset + (offset * 7))
  
  // Add days to get to the target day
  const targetDate = new Date(mondayDate)
  targetDate.setDate(mondayDate.getDate() + dayIndex)
  
  const dayShort = dayName.charAt(0).toUpperCase() + dayName.slice(1)
  const date = targetDate.getDate()
  
  // Check if this is today
  const isToday = targetDate.toDateString() === today.toDateString()
  
  if (isToday) {
    return (
      <div className="flex items-center gap-1">
        <span>{dayShort}</span>
        <Badge className="w-6 h-6 p-0 text-xs font-semibold rounded-md flex items-center justify-center min-w-6 text-white bg-red-500 hover:bg-red-500 border-0">
          {date}
        </Badge>
      </div>
    )
  }
  
  return `${dayShort} ${date}`
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center pl-3">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center pl-3">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row, table }) => {
      // Note: This should be refactored to use a proper component for the modal
      
      const handleAssociate = (patient: { name: string; nam: string }) => {
        // Update the data in the table
        const currentData = table.getRowModel().rows.map(r => r.original)
        const updatedData = currentData.map(p => 
          p.id === row.original.id 
            ? { ...p, patientName: patient.name, nam: patient.nam }
            : p
        )
        // This would typically update the parent state
        console.log('Associating patient:', patient)
        toast.success("Patient associé avec succès")
      }

      return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button 
              className="text-left hover:underline cursor-pointer group whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation()
                setIsModalOpen(true)
              }}
            >
              <div className="space-y-0.5">
                <div className="font-medium text-foreground group-hover:text-foreground/80 transition-colors text-sm whitespace-nowrap">
                  {row.original.patientName}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {row.original.nam}
                </div>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Associer un patient</DialogTitle>
              <DialogDescription>
                Recherchez et sélectionnez le bon patient dans la base de données RAMQ
              </DialogDescription>
            </DialogHeader>
            <PatientSearchModal
              currentPatient={row.original}
              onAssociate={handleAssociate}
              onClose={() => setIsModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )
    },
    enableHiding: false,
    size: 0,
    minSize: 0,
    maxSize: 0,
  },
  {
    accessorKey: "establishment",
    header: "Établissement",
    cell: ({ row }) => (
      <div className="truncate text-sm text-foreground whitespace-nowrap" title={row.original.establishment}>
        {row.original.establishment}
      </div>
    ),
    size: 0,
    minSize: 0,
    maxSize: 0,
  },
  {
    accessorKey: "lun",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("lun", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      return (
        <DayCell 
          act={row.original.lun} 
          dayName="Lun" 
          cellId=""
          isSelected={false}
          onCellSelect={() => {}}
          onCellMouseDown={() => {}}
          onCellMouseEnter={() => {}}
          onCellMouseUp={() => {}}
        />
      )
    },
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    accessorKey: "mar",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("mar", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      return (
        <DayCell 
          act={row.original.mar} 
          dayName="Mar" 
          cellId=""
          isSelected={false}
          onCellSelect={() => {}}
          onCellMouseDown={() => {}}
          onCellMouseEnter={() => {}}
          onCellMouseUp={() => {}}
        />
      )
    },
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    accessorKey: "mer",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("mer", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      return (
        <DayCell 
          act={row.original.mer} 
          dayName="Mer" 
          cellId=""
          isSelected={false}
          onCellSelect={() => {}}
          onCellMouseDown={() => {}}
          onCellMouseEnter={() => {}}
          onCellMouseUp={() => {}}
        />
      )
    },
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    accessorKey: "jeu",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("jeu", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      return (
        <DayCell 
          act={row.original.jeu} 
          dayName="Jeu" 
          cellId=""
          isSelected={false}
          onCellSelect={() => {}}
          onCellMouseDown={() => {}}
          onCellMouseEnter={() => {}}
          onCellMouseUp={() => {}}
        />
      )
    },
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    accessorKey: "ven",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("ven", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      return (
        <DayCell 
          act={row.original.ven} 
          dayName="Ven" 
          cellId=""
          isSelected={false}
          onCellSelect={() => {}}
          onCellMouseDown={() => {}}
          onCellMouseEnter={() => {}}
          onCellMouseUp={() => {}}
        />
      )
    },
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    accessorKey: "sam",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("sam", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      return (
        <DayCell 
          act={row.original.sam} 
          dayName="Sam" 
          cellId=""
          isSelected={false}
          onCellSelect={() => {}}
          onCellMouseDown={() => {}}
          onCellMouseEnter={() => {}}
          onCellMouseUp={() => {}}
        />
      )
    },
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    accessorKey: "dim",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("dim", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      return (
        <DayCell 
          act={row.original.dim} 
          dayName="Dim" 
          cellId=""
          isSelected={false}
          onCellSelect={() => {}}
          onCellMouseDown={() => {}}
          onCellMouseEnter={() => {}}
          onCellMouseUp={() => {}}
        />
      )
    },
    size: 100,
    minSize: 100,
    maxSize: 100,
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell, index) => {
        const isDayColumn = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].includes(cell.column.id)
        const isEstablishmentColumn = cell.column.id === 'establishment'
        return (
          <TableCell 
            key={cell.id}
            className={`py-1`}
          >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
        )
      })}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  // Timeframe view state: today | 3days | week
  const [timeframeView, setTimeframeView] = React.useState<'today' | '3days' | 'week'>('week')
  const [data, setData] = React.useState(() => initialData)
  
  // Navigation state for date offset
  const [dateOffset, setDateOffset] = React.useState(0)

    // Importer modal local state
    const [selectedEstablishment, setSelectedEstablishment] = React.useState<string | null>(null)
    const [sessionType, setSessionType] = React.useState<'clinique' | 'garde'>('clinique')
    const [fileName, setFileName] = React.useState<string>("")
    const [previewRows, setPreviewRows] = React.useState<Array<{patient: string; establishment: string; acts: string; status: string}>>([])

    // TODO: Connect to real establishment data
    const establishmentSessionTypeMap: Record<string, 'clinique' | 'garde'> = {}

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [selectedCells, setSelectedCells] = React.useState<Set<string>>(new Set())
  const [lastSelectedCell, setLastSelectedCell] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStartCell, setDragStartCell] = React.useState<string | null>(null)

  // Cell selection functions
  const handleCellSelect = (cellId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (event.shiftKey && lastSelectedCell) {
      // Range selection - select all cells between lastSelectedCell and current cell
      selectRange(lastSelectedCell, cellId)
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      const newSelection = new Set(selectedCells)
      if (newSelection.has(cellId)) {
        newSelection.delete(cellId)
      } else {
        newSelection.add(cellId)
      }
      setSelectedCells(newSelection)
      setLastSelectedCell(cellId)
    } else {
      // Single cell selection
      setSelectedCells(new Set([cellId]))
      setLastSelectedCell(cellId)
    }
  }

  const handleCellMouseDown = (cellId: string, event: React.MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStartCell(cellId)
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
        setSelectedCells(new Set([cellId]))
        setLastSelectedCell(cellId)
      }
    }
  }

  const handleCellMouseEnter = (cellId: string, event: React.MouseEvent) => {
    if (isDragging && dragStartCell) {
      selectRange(dragStartCell, cellId)
    }
  }

  const handleCellMouseUp = () => {
    setIsDragging(false)
    setDragStartCell(null)
  }

  const selectRange = (startCellId: string, endCellId: string) => {
    const [startRowId, startDay] = startCellId.split('-')
    const [endRowId, endDay] = endCellId.split('-')
    
    const startRowIndex = data.findIndex(row => row.id.toString() === startRowId)
    const endRowIndex = data.findIndex(row => row.id.toString() === endRowId)
    
    const days = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']
    const startDayIndex = days.indexOf(startDay)
    const endDayIndex = days.indexOf(endDay)
    
    const newSelection = new Set(selectedCells)
    
    const minRow = Math.min(startRowIndex, endRowIndex)
    const maxRow = Math.max(startRowIndex, endRowIndex)
    const minDay = Math.min(startDayIndex, endDayIndex)
    const maxDay = Math.max(startDayIndex, endDayIndex)
    
    for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
      for (let dayIndex = minDay; dayIndex <= maxDay; dayIndex++) {
        const cellId = `${data[rowIndex].id}-${days[dayIndex]}`
        newSelection.add(cellId)
      }
    }
    
    setSelectedCells(newSelection)
    setLastSelectedCell(endCellId)
  }

  const clearSelection = () => {
    setSelectedCells(new Set())
    setLastSelectedCell(null)
  }

  // Global mouse up handler for drag selection
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setDragStartCell(null)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  // Bulk actions
  const handleBulkApprove = () => {
    const updatedData = data.map(row => {
      const updatedRow = { ...row }
      selectedCells.forEach(cellId => {
        const [rowId, day] = cellId.split('-')
        if (row.id.toString() === rowId && updatedRow[day as keyof typeof updatedRow]) {
          (updatedRow[day as keyof typeof updatedRow] as any).status = 'approved'
        }
      })
      return updatedRow
    })
    setData(updatedData)
    clearSelection()
  }

  const handleBulkMarkPending = () => {
    const updatedData = data.map(row => {
      const updatedRow = { ...row }
      selectedCells.forEach(cellId => {
        const [rowId, day] = cellId.split('-')
        if (row.id.toString() === rowId && updatedRow[day as keyof typeof updatedRow]) {
          (updatedRow[day as keyof typeof updatedRow] as any).status = 'pending'
        }
      })
      return updatedRow
    })
    setData(updatedData)
    clearSelection()
  }

  const handleBulkDelete = () => {
    const updatedData = data.map(row => {
      const updatedRow = { ...row }
      selectedCells.forEach(cellId => {
        const [rowId, day] = cellId.split('-')
        if (row.id.toString() === rowId) {
          (updatedRow as any)[day] = undefined
        }
      })
      return updatedRow
    })
    setData(updatedData)
    clearSelection()
  }

  const table = useReactTable({
    data,
    columns: React.useMemo(() => {
      // Day keys in canonical order (Mon -> Sun)
      const orderedDays = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'] as const

      // Compute today index in the above order
      const jsDay = new Date().getDay() // 0=Sun ... 6=Sat
      const mapJsToOrderedIdx = (d: number) => {
        // Map: Mon(1)->0, Tue(2)->1, Wed(3)->2, Thu(4)->3, Fri(5)->4, Sat(6)->5, Sun(0)->6
        if (d === 0) return 6
        return d - 1
      }
      const todayIdx = mapJsToOrderedIdx(jsDay)

      // Only consider day columns that actually exist in the current columns definition
      const existingDayIds = (columns as ColumnDef<any, any>[])
        .map((c: any) => (c.id ?? c.accessorKey) as string | undefined)
        .filter((id): id is string => !!id && orderedDays.includes(id as any))

      // Helper to pick k consecutive days starting at today among existing ones
      const pickConsecutive = (k: number): string[] => {
        const result: string[] = []
        let idx = todayIdx
        while (result.length < k) {
          const cand = orderedDays[idx]
          if (existingDayIds.includes(cand)) result.push(cand)
          idx = (idx + 1) % orderedDays.length
          // Safety: avoid infinite loops
          if (result.length === 0 && idx === todayIdx) break
          if (result.length > orderedDays.length) break
        }
        // Fallback to any existing day if nothing matched
        if (result.length === 0 && existingDayIds.length > 0) result.push(existingDayIds[0])
        return result
      }

      // Decide visible days based on view
      let visibleDays: readonly string[]
      if (timeframeView === 'today') {
        visibleDays = pickConsecutive(1)
      } else if (timeframeView === '3days') {
        visibleDays = pickConsecutive(3)
      } else {
        // week: keep current set/order of all day columns unchanged
        visibleDays = orderedDays.filter(d => existingDayIds.includes(d))
      }

      // Filter the existing columns: keep all non-day columns, and only the day columns in visibleDays
      const daySet = new Set(visibleDays)
      const isDayColumnId = (id: string | undefined) => !!id && ['lun','mar','mer','jeu','ven','sam','dim'].includes(id)

      return (columns as ColumnDef<any, any>[]).filter((col: any) => {
        const id = (col.id ?? col.accessorKey) as string | undefined
        if (!isDayColumnId(id)) return true
        return daySet.has(id!)
      })
    }, [timeframeView, data]),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      dateOffset,
    },
  })


  return (
          <div className="w-full">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <IconLayoutColumns />
                      <span className="hidden lg:inline">
                        {timeframeView === "today" ? "Daily" : 
                         timeframeView === "3days" ? "3 days" : 
                         timeframeView === "week" ? "Weekly" : "Daily"}
                      </span>
                      <span className="lg:hidden">
                        {timeframeView === "today" ? "Daily" : 
                         timeframeView === "3days" ? "3d" : 
                         timeframeView === "week" ? "Week" : "Daily"}
                      </span>
                      <IconChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem 
                      onClick={() => setTimeframeView("today")}
                      className={timeframeView === "today" ? "bg-accent" : ""}
                    >
                      Daily
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTimeframeView("3days")}
                      className={timeframeView === "3days" ? "bg-accent" : ""}
                    >
                      3 days
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTimeframeView("week")}
                      className={timeframeView === "week" ? "bg-accent" : ""}
                    >
                      Weekly
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Navigation controls */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDateOffset(0)}
                    className="h-8 px-3"
                  >
                    Today
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDateOffset(prev => prev - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <IconChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDateOffset(prev => prev + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <IconChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
               <div className="flex items-center gap-2">
                <Dialog onOpenChange={(open) => {
                  if (!open) {
                    // reset modal state on close
                    setSelectedEstablishment(null)
                    setSessionType('clinique')
                    setFileName("")
                    setPreviewRows([])
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm">
                      <IconPlus />
                      <span className="hidden lg:inline">Importer</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Importer des actes</DialogTitle>
                      <DialogDescription>
                        Sélectionnez le type de séance et ajoutez vos données de facturation.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Step 1 — Établissement first */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Établissement</Label>
                        <Select value={selectedEstablishment || ""} onValueChange={(value) => {
                          setSelectedEstablishment(value)
                          // Auto-preselect session type based on establishment
                          const autoSessionType = establishmentSessionTypeMap[value]
                          if (autoSessionType) {
                            setSessionType(autoSessionType)
                          }
                        }}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez un établissement" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chu_sainte_justine">CHU Sainte-Justine</SelectItem>
                            <SelectItem value="chum">CHUM</SelectItem>
                            <SelectItem value="sacré_coeur">Hôpital du Sacré-Cœur</SelectItem>
                            <SelectItem value="cusc">CUSM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedEstablishment && (
                        <div className="space-y-2">
                          <Label>Type de séance</Label>
                          <RadioGroup value={sessionType} onValueChange={(v) => setSessionType(v as 'clinique' | 'garde')} className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 rounded-md border p-3">
                              <RadioGroupItem id="rg-clinique" value="clinique" />
                              <Label htmlFor="rg-clinique" className="cursor-pointer">Clinique</Label>
                            </div>
                            <div className="flex items-center gap-2 rounded-md border p-3">
                              <RadioGroupItem id="rg-garde" value="garde" />
                              <Label htmlFor="rg-garde" className="cursor-pointer">Garde</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>

                    {/* Step 2 — Upload / Scan (only after establishment selected) */}
                    {selectedEstablishment && (
                      <div className="space-y-2">
                        <Label>Fichier</Label>
                        <Input type="file" accept=".csv,.xlsx,.xls,application/pdf,image/*" onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) {
                            setFileName(f.name)
                            // TODO: Parse real file data
                            const rows: any[] = []
                            setPreviewRows(rows)
                          }
                        }} />
                        <p className="text-sm text-muted-foreground">
                          {sessionType === 'clinique' ? 'Importez votre liste quotidienne avec raccourcis.' : 'Importez votre feuille de garde ou ajoutez manuellement.'}
                        </p>
                        {fileName && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fichier sélectionné: {fileName}</span>
                            <Button variant="link" className="px-0" onClick={() => { setFileName(''); setPreviewRows([]); }}>Annuler l'importation</Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3 — Preview */}
                    {previewRows.length > 0 && (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient</TableHead>
                              <TableHead>Établissement</TableHead>
                              <TableHead>Acts</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewRows.map((r, idx) => (
                              <TableRow key={idx}>
                                <TableCell><Input defaultValue={r.patient} /></TableCell>
                                <TableCell><Input defaultValue={r.establishment} /></TableCell>
                                <TableCell><Input defaultValue={r.acts} /></TableCell>
                                <TableCell><Input defaultValue={r.status} /></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Step 4 — Confirmation */}
                    <DialogFooter className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {previewRows.length > 0 ? `${previewRows.length} patients, ${previewRows.reduce((acc, r) => acc + (r.acts.split(',').length), 0)} actes, 2 avertissements, total $X` : 'Aucun aperçu pour le moment.'}
                      </div>
                      <div className="flex gap-2">
                        <DialogTrigger asChild>
                          <Button variant="ghost">Annuler</Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            if (previewRows.length > 0) {
                              toast(`${previewRows.reduce((acc, r) => acc + (r.acts.split(',').length), 0)} actes importés (2 avertissements).`)
                            }
                          }}>Confirmer</Button>
                        </DialogTrigger>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
               </div>
             </div>

            {/* Bulk actions removed */}
             
             <Tabs defaultValue="all" className="w-full">
               <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto">
                <div className="overflow-x-auto rounded-lg border">
                   <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                       {table.getHeaderGroups().map((headerGroup) => (
                         <TableRow key={headerGroup.id}>
                           {headerGroup.headers.map((header, index) => {
                             const isDayColumn = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].includes(header.id)
                             const isEstablishmentColumn = header.id === 'establishment'
                             const isSelectColumn = header.id === 'select'
                             const isPatientColumn = header.id === 'patientName'
                             return (
                               <TableHead 
                                 key={header.id} 
                                 colSpan={header.colSpan}
                                  className={`
                                    py-3 font-medium
                                    ${isSelectColumn ? 'w-12 px-2' : 'px-3'}
                                    ${isPatientColumn ? 'px-2 whitespace-nowrap' : ''}
                                    ${isEstablishmentColumn ? 'px-2 whitespace-nowrap' : ''}
                                  `}
                               >
                                 {header.isPlaceholder
                                   ? null
                                   : flexRender(
                                       header.column.columnDef.header,
                                       header.getContext()
                                     )}
                               </TableHead>
                             )
                           })}
                         </TableRow>
                       ))}
                     </TableHeader>
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                       {table.getRowModel().rows?.length ? (
                         table.getRowModel().rows.map((row) => (
                           <TableRow key={row.id}>
                             {row.getVisibleCells().map((cell, index) => {
                               const isDayColumn = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].includes(cell.column.id)
                               const isEstablishmentColumn = cell.column.id === 'establishment'
                               const isSelectColumn = cell.column.id === 'select'
                               const isPatientColumn = cell.column.id === 'patientName'
                               
                               return (
                              <TableCell 
                                   key={cell.id}
                                  className={`
                                    py-2 min-h-[40px] cursor-pointer transition-all duration-150
                                    ${isSelectColumn ? 'w-12 px-2' : 'px-3'}
                                    ${isPatientColumn ? 'px-2 whitespace-nowrap' : ''}
                                    ${isEstablishmentColumn ? 'px-2 whitespace-nowrap' : ''}
                                  `}
                                 >
                                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                 </TableCell>
                               )
                             })}
                           </TableRow>
                         ))
                       ) : (
                         <TableRow>
                          <TableCell
                            colSpan={table.getAllColumns().length}
                             className="h-24 text-center"
                           >
                             No results.
                           </TableCell>
                         </TableRow>
                       )}
                     </TableBody>
                   </Table>
               </div>
               <div className="flex items-center justify-between">
                 <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                   {table.getFilteredSelectedRowModel().rows.length} of{" "}
                   {table.getFilteredRowModel().rows.length} row(s) selected.
                 </div>
                 <div className="flex w-full items-center gap-8 lg:w-fit">
                   <div className="hidden items-center gap-2 lg:flex">
                     <Label htmlFor="rows-per-page" className="text-sm font-medium">
                       Rows per page
                     </Label>
                     <Select
                       value={`${table.getState().pagination.pageSize}`}
                       onValueChange={(value) => {
                         table.setPageSize(Number(value))
                       }}
                     >
                       <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                         <SelectValue
                           placeholder={table.getState().pagination.pageSize}
                         />
                       </SelectTrigger>
                       <SelectContent side="top">
                         {[10, 20, 30, 40, 50].map((pageSize) => (
                           <SelectItem key={pageSize} value={`${pageSize}`}>
                             {pageSize}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="flex w-fit items-center justify-center text-sm font-medium">
                     Page {table.getState().pagination.pageIndex + 1} of{" "}
                     {table.getPageCount()}
                   </div>
                   <div className="ml-auto flex items-center gap-2 lg:ml-0">
                     <Button
                       variant="outline"
                       className="hidden h-8 w-8 p-0 lg:flex"
                       onClick={() => table.setPageIndex(0)}
                       disabled={!table.getCanPreviousPage()}
                     >
                       <span className="sr-only">Go to first page</span>
                       <IconChevronsLeft />
                     </Button>
                     <Button
                       variant="outline"
                       className="size-8"
                       size="icon"
                       onClick={() => table.previousPage()}
                       disabled={!table.getCanPreviousPage()}
                     >
                       <span className="sr-only">Go to previous page</span>
                       <IconChevronLeft />
                     </Button>
                     <Button
                       variant="outline"
                       className="size-8"
                       size="icon"
                       onClick={() => table.nextPage()}
                       disabled={!table.getCanNextPage()}
                     >
                       <span className="sr-only">Go to next page</span>
                       <IconChevronRight />
                     </Button>
                     <Button
                       variant="outline"
                       className="hidden size-8 lg:flex"
                       size="icon"
                       onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                       disabled={!table.getCanNextPage()}
                     >
                       <span className="sr-only">Go to last page</span>
                       <IconChevronsRight />
                     </Button>
                   </div>
                 </div>
               </div>
               </TabsContent>
               <TabsContent value="clinique">
                 <div className="text-center py-8 text-muted-foreground">
                   <p>Clinique view - Coming soon!</p>
                   <p className="text-sm mt-2">This will show filtered data for clinic appointments.</p>
                 </div>
               </TabsContent>
               <TabsContent value="garde">
                 <div className="text-center py-8 text-muted-foreground">
                   <p>Garde view - Coming soon!</p>
                   <p className="text-sm mt-2">This will show filtered data for on-call shifts.</p>
                 </div>
               </TabsContent>
             </Tabs>
           </div>
         )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>
            Showing total visitors for the last 6 months
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just
                  some random text to test the layout. It spans multiple lines
                  and should wrap around.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Header</Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Table of Contents">
                      Table of Contents
                    </SelectItem>
                    <SelectItem value="Executive Summary">
                      Executive Summary
                    </SelectItem>
                    <SelectItem value="Technical Approach">
                      Technical Approach
                    </SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Capabilities">Capabilities</SelectItem>
                    <SelectItem value="Focus Documents">
                      Focus Documents
                    </SelectItem>
                    <SelectItem value="Narrative">Narrative</SelectItem>
                    <SelectItem value="Cover Page">Cover Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Target</Label>
                <Input id="target" defaultValue={item.target} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Limit</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="reviewer">Reviewer</Label>
              <Select defaultValue={item.reviewer}>
                <SelectTrigger id="reviewer" className="w-full">
                  <SelectValue placeholder="Select a reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                  <SelectItem value="Jamik Tashpulatov">
                    Jamik Tashpulatov
                  </SelectItem>
                  <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
