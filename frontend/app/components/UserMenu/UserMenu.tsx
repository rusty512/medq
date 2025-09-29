"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EllipsisVertical } from "lucide-react"
import { getMockUser } from "@/lib/mock-user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const user = getMockUser();

  const initials = user.personal_info.firstName.charAt(0) + user.personal_info.lastName.charAt(0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="grid mr-auto">
            <span className="truncate font-medium">
              Dr. {user.personal_info.firstName} {user.personal_info.lastName}
            </span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <EllipsisVertical className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <div className="flex flex-col">
            <span className="font-medium">
              Dr. {user.personal_info.firstName} {user.personal_info.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {user.professional_info.specialty}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          Mode démo actif
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}