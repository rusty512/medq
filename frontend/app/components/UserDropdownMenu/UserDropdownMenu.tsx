import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cva } from "class-variance-authority"
import { LogOut } from 'lucide-react'
import { Logout } from "../Logout"

// className for open DropdownMenuTrigger
export const triggerVariants = cva(
  "flex w-full items-center gap-2 rounded-md p-2 text-left ring-sidebar-ring h-12 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  {
    variants: {
      state: {
        open: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
        active: "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
      },
    },
  }
)


export function UserDropdownMenu({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerVariants({ state: "open" })} asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" sideOffset={8}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut />
          <Logout>Logout</Logout>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}