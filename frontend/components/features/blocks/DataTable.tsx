"use client"

import * as React from "react"
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconEdit,
  IconLoader,
  IconPlus,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react"
import { CircleCheck, Circle, CircleAlert, CheckCircle2, Pencil, Trash2, X, Import as ImportIcon, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"


export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
  patientName: z.string().optional(),
  nam: z.string().optional(),
  establishment: z.string().optional(),
  lun: z.array(z.object({ code: z.string(), status: z.enum(["pending", "approved", "error"]) })).optional(),
  mar: z.array(z.object({ code: z.string(), status: z.enum(["pending", "approved", "error"]) })).optional(),
  mer: z.array(z.object({ code: z.string(), status: z.enum(["pending", "approved", "error"]) })).optional(),
  jeu: z.array(z.object({ code: z.string(), status: z.enum(["pending", "approved", "error"]) })).optional(),
  ven: z.array(z.object({ code: z.string(), status: z.enum(["pending", "approved", "error"]) })).optional(),
  sam: z.array(z.object({ code: z.string(), status: z.enum(["pending", "approved", "error"]) })).optional(),
  dim: z.array(z.object({ code: z.string(), status: z.enum(["pending", "approved", "error"]) })).optional(),
})

// Create a separate component for the drag handle

// Mock RAMQ API data for patient search
const mockRAMQPatients = [
  { id: "RAMQ001", name: "Marie Dubois", nam: "DUBM12345678" },
  { id: "RAMQ002", name: "Jean-Pierre Tremblay", nam: "TREM23456789" },
  { id: "RAMQ003", name: "Sophie Gagnon", nam: "GAGS34567890" },
  { id: "RAMQ004", name: "Alexandre Roy", nam: "ROYA45678901" },
  { id: "RAMQ005", name: "Isabelle Lavoie", nam: "LAVI56789012" },
  { id: "RAMQ006", name: "François Bouchard", nam: "BOUC67890123" },
  { id: "RAMQ007", name: "Camille Bergeron", nam: "BERG78901234" },
  { id: "RAMQ008", name: "Nicolas Pelletier", nam: "PELL89012345" },
  { id: "RAMQ009", name: "Élise Côté", nam: "COTE90123456" },
  { id: "RAMQ010", name: "Marc-André Fortin", nam: "FORT01234567" },
]

// Mock establishment mapping (shortNumber -> full name)
const mockEstablishments = {
  "1": "CHU Sainte-Justine",
  "2": "CHUM", 
  "3": "Hôpital du Sacré-Cœur"
}

// Interactive Act Badge Component
function CodeEditPopoverContent({
  value,
  onValueChange,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmer',
}: {
  value: string
  onValueChange: (v: string) => void
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string
}) {
  return (
    <PopoverContent className="w-80">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="code-input">Code ou raccourci</Label>
          <Input
            id="code-input"
            placeholder="Entrer un code ou raccourci"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm()
              if (e.key === 'Escape') onCancel?.()
            }}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>Annuler</Button>
          <Button size="sm" onClick={onConfirm} disabled={!value.trim()}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </PopoverContent>
  )
}
function ActBadge({ 
  act, 
  onApprove, 
  onEdit, 
  onRemove,
  isSelected,
  onSelect,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}: { 
  act: { code: string; status: "pending" | "approved" | "error" }
  onApprove: () => void
  onEdit: (newCode: string) => void
  onRemove: () => void
  isSelected: boolean
  onSelect: (e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
  onMouseEnter: (e: React.MouseEvent) => void
  onMouseUp: () => void
}) {
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editValue, setEditValue] = React.useState(act.code)

  const handleEdit = () => {
    setIsEditOpen(true)
    setEditValue(act.code)
  }

  const handleConfirmEdit = () => {
    onEdit(editValue)
    setIsEditOpen(false)
  }

  const handleCancelEdit = () => {
    setIsEditOpen(false)
    setEditValue(act.code)
  }
  const getStatusIcon = (status: "pending" | "approved" | "error") => {
    switch (status) {
      case "approved":
        return <CircleCheck className="w-3 h-3 text-green-600" />
      case "pending":
        return <Circle className="w-3 h-3 text-yellow-600" />
      case "error":
        return <CircleAlert className="w-3 h-3 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="group relative flex items-center gap-1">
      {/* Main badge - outline with icon; selection handlers bound here */}
      <Badge 
        variant="outline"
        className={`flex items-center gap-1 ${isSelected ? 'ring-2 ring-primary/40 bg-muted/40' : ''}`}
        onClick={onSelect}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
      >
        {getStatusIcon(act.status)}
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
        <Popover open={isEditOpen} onOpenChange={setIsEditOpen}>
          <PopoverTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation()
                handleEdit()
            }}
              className="bg-white border border-border rounded-full p-1 hover:bg-muted transition-colors"
            title="Modifier"
          >
              <IconEdit className="w-3 h-3 text-muted-foreground" />
          </button>
          </PopoverTrigger>
          <CodeEditPopoverContent
            value={editValue}
            onValueChange={setEditValue}
            confirmLabel="Confirmer"
            onCancel={handleCancelEdit}
            onConfirm={handleConfirmEdit}
          />
        </Popover>
          
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
  acts, 
  dayName,
  cellId,
  isSelected,
  onCellSelect,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onActApprove,
  onActEdit,
  onActRemove,
  onActAdd
}: { 
  acts: { code: string; status: "pending" | "approved" | "error" }[] | { code: string; status: "pending" | "approved" | "error" } | undefined
  dayName: string 
  cellId: string
  isSelected: boolean
  onCellSelect: (cellId: string, event: React.MouseEvent) => void
  onCellMouseDown: (cellId: string, event: React.MouseEvent) => void
  onCellMouseEnter: (cellId: string, event: React.MouseEvent) => void
  onCellMouseUp: () => void
  onActApprove: (actIndex: number) => void
  onActEdit: (actIndex: number, newCode: string) => void
  onActRemove: (actIndex: number) => void
  onActAdd: (newCode: string) => void
}) {
  // Handle both single act and array of acts
  const actsArray = Array.isArray(acts) ? acts : acts ? [acts] : []
  const isEmpty = actsArray.length === 0

  const handleApprove = (actIndex: number) => {
    onActApprove(actIndex)
  }

  const handleEdit = (actIndex: number, newCode: string) => {
    onActEdit(actIndex, newCode)
  }

  const handleRemove = (actIndex: number) => {
    onActRemove(actIndex)
  }

  const [addOpen, setAddOpen] = React.useState(false)
  const [addValue, setAddValue] = React.useState("")

  return (
    <>
      {isEmpty ? (
        <div className="group flex items-center justify-start w-full h-full">
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Badge 
                variant="outline" 
                className={`text-muted-foreground cursor-pointer text-xs px-2 py-0.5 h-6 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'ring-2 ring-primary/40 bg-muted/40' : ''}`}
                onClick={(e) => { e.stopPropagation(); setAddOpen(true) }}
              >
                +
              </Badge>
            </PopoverTrigger>
            <CodeEditPopoverContent
              value={addValue}
              onValueChange={setAddValue}
              confirmLabel="Ajouter"
              onCancel={() => { setAddOpen(false); setAddValue("") }}
              onConfirm={() => { if (addValue.trim()) { onActAdd(addValue.trim()); setAddValue(""); setAddOpen(false) } }}
            />
          </Popover>
        </div>
      ) : (
        <div className="group flex flex-wrap gap-1">
          {actsArray.map((act, index) => (
        <ActBadge
              key={`${act.code}-${index}`}
          act={act}
              onApprove={() => handleApprove(index)}
              onEdit={(newCode) => handleEdit(index, newCode)}
              onRemove={() => handleRemove(index)}
              isSelected={isSelected}
              onSelect={(e) => onCellSelect(cellId, e)}
              onMouseDown={(e) => onCellMouseDown(cellId, e)}
              onMouseEnter={(e) => onCellMouseEnter(cellId, e)}
              onMouseUp={() => onCellMouseUp()}
            />
          ))}
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

  // Filter patients based on search
  const filteredPatients = React.useMemo(() => {
    if (!searchValue) return mockRAMQPatients
    return mockRAMQPatients.filter(patient => 
      patient.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      patient.nam.toLowerCase().includes(searchValue.toLowerCase())
    )
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

const createColumns = (
  handleActApprove: (rowId: number, dayKey: string, actIndex: number) => void,
  handleActEdit: (rowId: number, dayKey: string, actIndex: number, newCode: string) => void,
  handleActRemove: (rowId: number, dayKey: string, actIndex: number) => void,
  isCellSelected: (cellId: string) => boolean,
  handleCellSelect: (cellId: string, e: React.MouseEvent) => void,
  handleCellMouseDown: (cellId: string, e: React.MouseEvent) => void,
  handleCellMouseEnter: (cellId: string, e: React.MouseEvent) => void,
  handleCellMouseUp: () => void,
): ColumnDef<z.infer<typeof schema>>[] => [
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
      const [isModalOpen, setIsModalOpen] = React.useState(false)
      
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
    header: "Étab.",
    cell: ({ row }) => {
      const establishmentId = row.original.establishment
      const establishmentNumber = Object.keys(mockEstablishments).find(key => 
        mockEstablishments[key as keyof typeof mockEstablishments] === establishmentId
      )
      const fullName = mockEstablishments[establishmentNumber as keyof typeof mockEstablishments] || establishmentId
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs">
                {establishmentNumber || "—"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
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
      const cellId = `${row.original.id}-lun`
      return (
        <DayCell 
          acts={row.original.lun} 
          dayName="Lun" 
          cellId={cellId}
          isSelected={isCellSelected(cellId)}
          onCellSelect={handleCellSelect}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
          onActApprove={(actIndex) => handleActApprove(row.original.id, 'lun', actIndex)}
          onActEdit={(actIndex, newCode) => handleActEdit(row.original.id, 'lun', actIndex, newCode)}
          onActRemove={(actIndex) => handleActRemove(row.original.id, 'lun', actIndex)}
            onActAdd={(code) => (table.options.meta as any)?.handleAddAct?.(row.original.id, 'lun', code)}
        />
      )
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
  {
    accessorKey: "mar",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("mar", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      const cellId = `${row.original.id}-mar`
      return (
        <DayCell 
          acts={row.original.mar} 
          dayName="Mar" 
          cellId={cellId}
          isSelected={isCellSelected(cellId)}
          onCellSelect={handleCellSelect}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
          onActApprove={(actIndex) => handleActApprove(row.original.id, 'mar', actIndex)}
          onActEdit={(actIndex, newCode) => handleActEdit(row.original.id, 'mar', actIndex, newCode)}
          onActRemove={(actIndex) => handleActRemove(row.original.id, 'mar', actIndex)}
            onActAdd={(code) => (table.options.meta as any)?.handleAddAct?.(row.original.id, 'mar', code)}
        />
      )
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
  {
    accessorKey: "mer",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("mer", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      const cellId = `${row.original.id}-mer`
      return (
        <DayCell 
          acts={row.original.mer} 
          dayName="Mer" 
          cellId={cellId}
          isSelected={isCellSelected(cellId)}
          onCellSelect={handleCellSelect}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
          onActApprove={(actIndex) => handleActApprove(row.original.id, 'mer', actIndex)}
          onActEdit={(actIndex, newCode) => handleActEdit(row.original.id, 'mer', actIndex, newCode)}
          onActRemove={(actIndex) => handleActRemove(row.original.id, 'mer', actIndex)}
            onActAdd={(code) => (table.options.meta as any)?.handleAddAct?.(row.original.id, 'mer', code)}
        />
      )
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
  {
    accessorKey: "jeu",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("jeu", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      const cellId = `${row.original.id}-jeu`
      return (
        <DayCell 
          acts={row.original.jeu} 
          dayName="Jeu" 
          cellId={cellId}
          isSelected={isCellSelected(cellId)}
          onCellSelect={handleCellSelect}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
          onActApprove={(actIndex) => handleActApprove(row.original.id, 'jeu', actIndex)}
          onActEdit={(actIndex, newCode) => handleActEdit(row.original.id, 'jeu', actIndex, newCode)}
          onActRemove={(actIndex) => handleActRemove(row.original.id, 'jeu', actIndex)}
            onActAdd={(code) => (table.options.meta as any)?.handleAddAct?.(row.original.id, 'jeu', code)}
        />
      )
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
  {
    accessorKey: "ven",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("ven", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      const cellId = `${row.original.id}-ven`
      return (
        <DayCell 
          acts={row.original.ven} 
          dayName="Ven" 
          cellId={cellId}
          isSelected={isCellSelected(cellId)}
          onCellSelect={handleCellSelect}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
          onActApprove={(actIndex) => handleActApprove(row.original.id, 'ven', actIndex)}
          onActEdit={(actIndex, newCode) => handleActEdit(row.original.id, 'ven', actIndex, newCode)}
          onActRemove={(actIndex) => handleActRemove(row.original.id, 'ven', actIndex)}
            onActAdd={(code) => (table.options.meta as any)?.handleAddAct?.(row.original.id, 'ven', code)}
        />
      )
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
  {
    accessorKey: "sam",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("sam", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      const cellId = `${row.original.id}-sam`
      return (
        <DayCell 
          acts={row.original.sam} 
          dayName="Sam" 
          cellId={cellId}
          isSelected={isCellSelected(cellId)}
          onCellSelect={handleCellSelect}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
          onActApprove={(actIndex) => handleActApprove(row.original.id, 'sam', actIndex)}
          onActEdit={(actIndex, newCode) => handleActEdit(row.original.id, 'sam', actIndex, newCode)}
          onActRemove={(actIndex) => handleActRemove(row.original.id, 'sam', actIndex)}
            onActAdd={(code) => (table.options.meta as any)?.handleAddAct?.(row.original.id, 'sam', code)}
        />
      )
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
  {
    accessorKey: "dim",
    header: ({ table }) => {
      const meta = table.options.meta as any
      return getDayDate("dim", meta?.dateOffset || 0)
    },
    cell: ({ row, table }) => {
      const cellId = `${row.original.id}-dim`
      return (
        <DayCell 
          acts={row.original.dim} 
          dayName="Dim" 
          cellId={cellId}
          isSelected={isCellSelected(cellId)}
          onCellSelect={handleCellSelect}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
          onActApprove={(actIndex) => handleActApprove(row.original.id, 'dim', actIndex)}
          onActEdit={(actIndex, newCode) => handleActEdit(row.original.id, 'dim', actIndex, newCode)}
          onActRemove={(actIndex) => handleActRemove(row.original.id, 'dim', actIndex)}
            onActAdd={(code) => (table.options.meta as any)?.handleAddAct?.(row.original.id, 'dim', code)}
        />
      )
    },
    size: 60,
    minSize: 60,
    maxSize: 60,
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
            onClick={(e) => e.stopPropagation()}
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => { /* placeholder edit */ }}>Éditer</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => { (table.options.meta as any)?.handleRowDuplicate?.(row.original.id); try { toast.success('Ligne dupliquée') } catch {} }}
          >
            Dupliquer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => { (table.options.meta as any)?.handleRowDelete?.(row.original.id); try { toast.success('Ligne supprimée') } catch {} }}
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]


export function DataTable({
  data: initialData,
  onDateChange,
}: {
  data: z.infer<typeof schema>[]
  onDateChange?: (weekInfo: { monthName: string; weekRange: string }) => void
}) {
  // Only weekly view supported
  const [data, setData] = React.useState(() => initialData)
  
  // Navigation state for date offset
  const [dateOffset, setDateOffset] = React.useState(0)

  // Calculate current week range and month
  const weekInfo = React.useMemo(() => {
    const today = new Date()
    const currentDay = today.getDay() // 0=Sunday, 1=Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay // Monday is day 1
    const mondayDate = new Date(today)
    mondayDate.setDate(today.getDate() + mondayOffset + (dateOffset * 7))
    
    // Get Sunday (end of week)
    const sundayDate = new Date(mondayDate)
    sundayDate.setDate(mondayDate.getDate() + 6)
    
    // French month names
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    
    const startDay = mondayDate.getDate()
    const startMonth = monthNames[mondayDate.getMonth()]
    const endDay = sundayDate.getDate()
    const endMonth = monthNames[sundayDate.getMonth()]
    const year = sundayDate.getFullYear()
    
    // Month name for title (use end month)
    const monthName = endMonth
    
    // Week range for subtitle
    let weekRange: string
    if (startMonth === endMonth) {
      weekRange = `Semaine du ${startDay} au ${endDay} ${startMonth} ${year}`
    } else {
      weekRange = `Semaine du ${startDay} ${startMonth} au ${endDay} ${endMonth} ${year}`
    }
    
    return { monthName, weekRange }
  }, [dateOffset])

  // Update parent with date info when dateOffset changes
  React.useEffect(() => {
    if (onDateChange) {
      onDateChange(weekInfo)
    }
  }, [weekInfo, onDateChange])

  // Handler functions for act actions
  const handleActApprove = React.useCallback((rowId: number, dayKey: string, actIndex: number) => {
    setData(prevData => 
      prevData.map(row => 
        row.id === rowId 
          ? {
              ...row,
              [dayKey]: Array.isArray(row[dayKey as keyof typeof row]) 
                ? (row[dayKey as keyof typeof row] as any[]).map((act: any, index: number) => 
                    index === actIndex ? { ...act, status: 'approved' } : act
                  )
                : row[dayKey as keyof typeof row]
            }
          : row
      )
    )
  }, [])

  const handleActEdit = React.useCallback((rowId: number, dayKey: string, actIndex: number, newCode: string) => {
    setData(prevData => 
      prevData.map(row => 
        row.id === rowId 
          ? {
              ...row,
              [dayKey]: Array.isArray(row[dayKey as keyof typeof row]) 
                ? (row[dayKey as keyof typeof row] as any[]).map((act: any, index: number) => 
                    index === actIndex ? { ...act, code: newCode, status: 'approved' } : act
                  )
                : row[dayKey as keyof typeof row]
            }
          : row
      )
    )
  }, [])

  const handleActRemove = React.useCallback((rowId: number, dayKey: string, actIndex: number) => {
    setData(prevData => 
      prevData.map(row => 
        row.id === rowId 
          ? {
              ...row,
              [dayKey]: Array.isArray(row[dayKey as keyof typeof row]) 
                ? (row[dayKey as keyof typeof row] as any[]).filter((_: any, index: number) => index !== actIndex)
                : row[dayKey as keyof typeof row]
            }
          : row
      )
    )
  }, [])

  const handleAddAct = React.useCallback((rowId: number, dayKey: string, code: string) => {
    setData(prevData => 
      prevData.map(row => 
        row.id === rowId 
          ? {
              ...row,
              [dayKey]: Array.isArray(row[dayKey as keyof typeof row]) 
                ? [...(row[dayKey as keyof typeof row] as any[]), { code, status: 'approved' }]
                : [{ code, status: 'approved' }]
            }
          : row
      )
    )
  }, [])

  // Row actions
  const handleRowDelete = React.useCallback((rowId: number) => {
    setData((prev: any[]) => prev.filter((r: any) => r.id !== rowId))
  }, [])

  const handleRowDuplicate = React.useCallback((rowId: number) => {
    setData((prev: any[]) => {
      const idx = prev.findIndex((r: any) => r.id === rowId)
      if (idx === -1) return prev
      const original = prev[idx]
      const clone = { ...original, id: Date.now(), patientName: `${original.patientName || 'Patient'} (copie)` }
      const next = [...prev]
      next.splice(idx + 1, 0, clone)
      return next
    })
  }, [])

    // Importer modal local state
    const [selectedEstablishment, setSelectedEstablishment] = React.useState<string | null>(null)
    const [sessionType, setSessionType] = React.useState<'clinique' | 'garde'>('clinique')
    const [fileName, setFileName] = React.useState<string>("")
    const [previewRows, setPreviewRows] = React.useState<Array<{patient: string; establishment: string; acts: string; status: string}>>([])

    // Mock establishment to session type mapping
    const establishmentSessionTypeMap: Record<string, 'clinique' | 'garde'> = {
      'chu_sainte_justine': 'clinique',
      'chum': 'clinique', 
      'sacré_coeur': 'garde',
      'cusc': 'garde',
    }

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
      // Single click: toggle if it's the only selected one; otherwise select only this cell
      if (selectedCells.has(cellId) && selectedCells.size === 1) {
        clearSelection()
      } else {
        setSelectedCells(new Set([cellId]))
        setLastSelectedCell(cellId)
      }
    }
  }

  const handleCellMouseDown = (cellId: string, event: React.MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStartCell(cellId)
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
        const isOnlySelected = selectedCells.has(cellId) && selectedCells.size === 1
        // Do not pre-select if this cell is already the only selection.
        // This lets the subsequent click toggle to deselect.
        if (!isOnlySelected) {
          setSelectedCells(new Set([cellId]))
          setLastSelectedCell(cellId)
        }
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

  // Totals expand/collapse
  const [showTotals, setShowTotals] = React.useState(true)

  // Global mouse up handler for drag selection
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setDragStartCell(null)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  // Escape to clear selection
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Bulk actions
  const handleBulkApprove = () => {
    const updatedData = data.map(row => {
      const updatedRow: any = { ...row }
      selectedCells.forEach(cellId => {
        const [rowId, day] = cellId.split('-')
        if (row.id.toString() === rowId && Array.isArray(updatedRow[day])) {
          updatedRow[day] = (updatedRow[day] as any[]).map((act: any) => ({ ...act, status: 'approved' }))
        }
      })
      return updatedRow
    })
    setData(updatedData)
    clearSelection()
  }

  // Bulk confirm dialog
  const [bulkConfirmOpen, setBulkConfirmOpen] = React.useState(false)
  const [bulkConfirmAction, setBulkConfirmAction] = React.useState<"approve" | "delete">("approve")
  const [skipBulkConfirm, setSkipBulkConfirm] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('ramq_skip_bulk_confirm')
    if (saved) setSkipBulkConfirm(saved === '1')
  }, [])

  const handleMaybeConfirm = (action: "approve" | "delete", onConfirm: () => void) => {
    if (skipBulkConfirm) {
      onConfirm()
    } else {
      setBulkConfirmAction(action)
      setBulkConfirmOpen(true)
    }
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

  const isCellSelected = React.useCallback((cellId: string) => selectedCells.has(cellId), [selectedCells])

  const columns = React.useMemo(
    () => createColumns(
      handleActApprove,
      handleActEdit,
      handleActRemove,
      isCellSelected,
      handleCellSelect,
      handleCellMouseDown,
      handleCellMouseEnter,
      handleCellMouseUp
    ),
    [
      handleActApprove,
      handleActEdit,
      handleActRemove,
      isCellSelected,
      handleCellSelect,
      handleCellMouseDown,
      handleCellMouseEnter,
      handleCellMouseUp,
    ]
  )

  const table = useReactTable({
    data,
    columns,
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
      handleRowDelete,
      handleRowDuplicate,
      handleAddAct,
    },
  })


  const tableContainerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const container = tableContainerRef.current
      if (!container) return
      if (!container.contains(e.target as Node)) {
        clearSelection()
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [clearSelection])

  return (
           <div ref={tableContainerRef} className="w-full">
            {/* Simple inline bulk edit form */}
            {/* Component defined inline to keep file self-contained */}
            {(() => {
              function BulkEditForm({ onConfirm }: { onConfirm: (code: string) => void }) {
                const [value, setValue] = React.useState("")
                return (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-code">Code ou raccourci</Label>
                      <Input
                        id="bulk-code"
                        placeholder="Entrer un code ou raccourci"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onConfirm(value)
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => (document.activeElement as HTMLElement)?.blur()}>Annuler</Button>
                      <Button size="sm" onClick={() => onConfirm(value)}>Confirmer</Button>
                    </div>
                  </div>
                )
              }
              return null
            })()}
            {/* Bulk edit popover content component */}
            {/** Inline to avoid new file creation */}
            {/* eslint-disable react/no-unstable-nested-components */}
            
             <div className="flex items-center justify-between pb-4">
               <div className="flex items-center gap-2">
                {/* Navigation controls */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDateOffset(0)}
                  className="h-8 px-3"
                >
                  Cette semaine
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
                  {/* Add patient manually */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRow = {
                        id: Date.now(),
                        patientName: "Nouveau patient",
                        nam: "",
                        establishment: 1,
                        lun: [], mar: [], mer: [], jeu: [], ven: [], sam: [],
                      } as any
                      setData((prev: any[]) => [newRow, ...prev])
                    }}
                  >
                    <IconPlus />
                    <span className="hidden lg:inline">Ajouter un patient</span>
                  </Button>

                  <DialogTrigger asChild>
                    <Button variant="default" size="sm">
                      <ImportIcon className="h-4 w-4" />
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
                            {Object.entries(mockEstablishments).map(([number, name]) => (
                              <SelectItem key={number} value={name}>
                                {number} — {name}
                              </SelectItem>
                            ))}
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
                            // Mock parsed data
                            const rows = [
                              { patient: 'Jean Tremblay', establishment: 'CHU Sainte-Justine', acts: 'A123, A456', status: 'pending' },
                              { patient: 'Marie Dubois', establishment: 'CHUM', acts: 'B234', status: 'ok' },
                              { patient: 'Ali Benali', establishment: 'CHUM', acts: 'C987, C123', status: 'warning' },
                            ]
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
                    {/* Totals rows inside same table */}
                    {(() => {
                      const days = ['lun','mar','mer','jeu','ven','sam','dim'] as const
                      const totals = {
                        patients: Object.fromEntries(days.map(d => [d, 0])) as Record<string, number>,
                        acts: Object.fromEntries(days.map(d => [d, 0])) as Record<string, number>,
                        supplements: Object.fromEntries(days.map(d => [d, 0])) as Record<string, number>,
                        amount: Object.fromEntries(days.map(d => [d, 0])) as Record<string, number>,
                      }
                      const rowsData: any[] = table.getRowModel().rows.map(r => r.original)
                      rowsData.forEach(r => {
                        days.forEach(d => {
                          const acts = Array.isArray(r[d]) ? (r[d] as any[]) : []
                          if (acts.length > 0) totals.patients[d] += 1
                          totals.acts[d] += acts.length
                          totals.supplements[d] += acts.filter(a => typeof a.code === 'string' && a.code.toUpperCase().startsWith('S')).length
                          totals.amount[d] += acts.length * 150
                        })
                      })

                        return null
                    })()}
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

            {/* Bulk actions toolbar */}
            {selectedCells.size > 1 && (
              <div
                className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border bg-background px-4 py-2 shadow-sm"
                role="region"
                aria-label="Barre d'actions de sélection"
              >
                <span className="text-sm font-medium whitespace-nowrap">{selectedCells.size} sélectionné(s)</span>
                <div className="mx-1 h-5 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleMaybeConfirm('approve', handleBulkApprove)}>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    Approuver
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4 mr-2 text-blue-600" />
                        Modifier
                      </Button>
                    </PopoverTrigger>
                  <PopoverContent className="w-80">
                      {(() => {
                        function BulkEditFormLocal({ onConfirm }: { onConfirm: (code: string) => void }) {
                          const [value, setValue] = React.useState("")
                          return (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="bulk-code-local">Code ou raccourci</Label>
                                <Input id="bulk-code-local" placeholder="Entrer un code ou raccourci" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(value) }} />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => (document.activeElement as HTMLElement)?.blur()}>Annuler</Button>
                                <Button size="sm" onClick={() => onConfirm(value)}>Confirmer</Button>
                              </div>
                            </div>
                          )
                        }
                         return (
                          <BulkEditFormLocal
                            onConfirm={(code: string) => {
                          // Apply edit to all selected cells
                          const updated = data.map((row) => {
                            const updatedRow: any = { ...row }
                            selectedCells.forEach((cellId) => {
                              const [rowId, day] = cellId.split('-')
                              if (row.id.toString() === rowId && Array.isArray(updatedRow[day])) {
                                updatedRow[day] = (updatedRow[day] as any[]).map((act: any) => ({ ...act, code, status: 'approved' }))
                              }
                            })
                            return updatedRow
                          })
                          setData(updated)
                          clearSelection()
                            }}
                          />
                        )
                      })()}
                    </PopoverContent>
                  </Popover>
                  <Button size="sm" variant="outline" onClick={() => handleMaybeConfirm('delete', handleBulkDelete)}>
                    <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                    Supprimer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                 </Button>
               </div>
             </div>
            )}
             
            {/* Bulk confirm dialog */}
            <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {bulkConfirmAction === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer la suppression'}
                  </DialogTitle>
                  <DialogDescription>
                    {bulkConfirmAction === 'approve'
                      ? `Cela va approuver ${selectedCells.size} acte(s). Voulez-vous continuer ?`
                      : `Cela va supprimer ${selectedCells.size} acte(s) sélectionné(s). Cette action est irréversible.`}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="skip-confirm" checked={skipBulkConfirm} onCheckedChange={(v) => {
                      const val = Boolean(v)
                      setSkipBulkConfirm(val)
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('ramq_skip_bulk_confirm', val ? '1' : '0')
                      }
                    }} />
                    <label htmlFor="skip-confirm" className="text-sm text-muted-foreground select-none">
                      Ne plus demander
                    </label>
                  </div>
                  <DialogFooter className="sm:justify-end">
                    <Button variant="ghost" onClick={() => setBulkConfirmOpen(false)}>Annuler</Button>
                    {bulkConfirmAction === 'approve' ? (
                      <Button onClick={() => { setBulkConfirmOpen(false); handleBulkApprove() }}>Confirmer</Button>
                    ) : (
                      <Button variant="destructive" onClick={() => { setBulkConfirmOpen(false); handleBulkDelete() }}>Supprimer</Button>
                    )}
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
             
             <Tabs defaultValue="all" className="w-full">
               <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto">
                <div className="overflow-x-auto rounded-lg border">
                   <Table className="w-full">
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
                                    ${isSelectColumn ? 'w-12 px-2' : ''}
                                    ${isPatientColumn ? 'px-3 whitespace-nowrap w-48' : ''}
                                    ${isEstablishmentColumn ? 'px-3 whitespace-nowrap w-40' : ''}
                                    ${isDayColumn ? 'px-2 text-center w-24' : ''}
                                    ${!isSelectColumn && !isPatientColumn && !isEstablishmentColumn && !isDayColumn ? 'px-3 w-20' : ''}
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
                                    ${isSelectColumn ? 'w-12 px-2' : ''}
                                    ${isPatientColumn ? 'px-3 whitespace-nowrap w-48' : ''}
                                    ${isEstablishmentColumn ? 'px-3 whitespace-nowrap w-40' : ''}
                                    ${isDayColumn ? 'px-2 text-center w-24' : ''}
                                    ${!isSelectColumn && !isPatientColumn && !isEstablishmentColumn && !isDayColumn ? 'px-3 w-20' : ''}
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
                      {/* Totals rows */}
                      {(() => {
                        const days = ['lun','mar','mer','jeu','ven','sam','dim'] as const
                        const totals = {
                          patients: Object.fromEntries(days.map(d => [d, 0])) as Record<string, number>,
                          acts: Object.fromEntries(days.map(d => [d, 0])) as Record<string, number>,
                          supplements: Object.fromEntries(days.map(d => [d, 0])) as Record<string, number>,
                          amount: Object.fromEntries(days.map(d => [d, 0])) as Record<string, number>,
                        }
                        const rowsData: any[] = table.getRowModel().rows.map(r => r.original)
                        rowsData.forEach(r => {
                          days.forEach(d => {
                            const acts = Array.isArray(r[d]) ? (r[d] as any[]) : []
                            if (acts.length > 0) totals.patients[d] += 1
                            totals.acts[d] += acts.length
                            totals.supplements[d] += acts.filter(a => typeof a.code === 'string' && a.code.toUpperCase().startsWith('S')).length
                            totals.amount[d] += acts.length * 150
                          })
                        })

                        const renderTotalsRow = (
                          label: string,
                          values: Record<string, number>,
                          isMoney = false,
                          withTopBorder = false
                        ) => (
                          <TableRow>
                            {/* Checkbox column placeholder */}
                            <TableCell className={`w-12 px-2 ${withTopBorder ? 'border-t' : ''} bg-muted`}></TableCell>
                            {/* Patient label column */}
                            <TableCell className={`px-3 whitespace-nowrap font-medium w-48 ${withTopBorder ? 'border-t' : ''} bg-muted`}>
                              {label}
                            </TableCell>
                            {/* Establishment column empty */}
                            <TableCell className={`px-3 whitespace-nowrap w-40 ${withTopBorder ? 'border-t' : ''} bg-muted`}></TableCell>
                            {/* Day columns as plain text, aligned like badges */}
                            {days.map((d) => (
                              <TableCell key={d} className={`px-2 text-center w-24 ${withTopBorder ? 'border-t' : ''} bg-muted`}>
                                <span className="text-sm text-foreground">{isMoney ? `${values[d].toLocaleString('fr-CA')}\u00A0$` : values[d]}</span>
                              </TableCell>
                            ))}
                            {/* Actions column → weekly total */}
                            <TableCell className={`px-3 text-center ${withTopBorder ? 'border-t' : ''} bg-muted`}>
                              <span className="text-sm font-medium">
                                {(() => {
                                  const sum = Object.values(values).reduce((a, b) => a + b, 0)
                                  return isMoney ? `${sum.toLocaleString('fr-CA')}\u00A0$` : sum
                                })()}
                              </span>
                            </TableCell>
                          </TableRow>
                        )

                        return (
                          <>
                            {/* Toggle row */}
                            <TableRow className="bg-muted cursor-pointer select-none" onClick={() => setShowTotals((v) => !v)}>
                              <TableCell className="w-12 bg-muted pl-2 pr-0">
                                <div className="flex h-8 w-full items-center justify-end">
                                  <ChevronRight className={`h-4 w-4 transition-transform ${showTotals ? 'rotate-90' : ''}`} />
                                </div>
                              </TableCell>
                              <TableCell className="px-3 whitespace-nowrap font-medium w-48 bg-muted">
                                <span className="block">Totaux</span>
                              </TableCell>
                              <TableCell className="px-3 whitespace-nowrap w-40 bg-muted"></TableCell>
                              {days.map((d) => (
                                <TableCell key={d} className="px-2 text-center w-24 bg-muted"></TableCell>
                              ))}
                              <TableCell className="px-3 text-center bg-muted"></TableCell>
                            </TableRow>

                            {showTotals && (
                              <>
                                {renderTotalsRow('Patients', totals.patients, false, true)}
                                {renderTotalsRow('Actes', totals.acts)}
                                {renderTotalsRow('Suppléments', totals.supplements)}
                                {renderTotalsRow('Total $', totals.amount, true)}
                              </>
                            )}
                          </>
                        )
                      })()}
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
                  <ChartTooltip />
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
