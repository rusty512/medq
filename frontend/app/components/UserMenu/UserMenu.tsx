"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EllipsisVertical } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { UserService, UserData } from "@/lib/user-service"
import { Logout } from "@/app/components/Logout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function UserMenu() {
  const { user: authUser, userData, loading: authLoading, userDataLoading } = useAuth();
  const loading = authLoading || userDataLoading;

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Avatar>
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
        <div className="grid mr-auto">
          <span className="truncate font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authUser || !userData) {
    return null;
  }

  const displayName = UserService.getUserDisplayName(userData);
  const initials = UserService.getUserInitials(userData);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="grid mr-auto">
            <span className="truncate font-medium">
              {userData.professional_id ? 'Dr. ' : ''}{displayName}
            </span>
            <span className="truncate text-xs">{authUser.email}</span>
          </div>
          <EllipsisVertical className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <div className="flex flex-col">
            <span className="font-medium">
              {userData.professional_id ? 'Dr. ' : ''}{displayName}
            </span>
            {userData.specialty_name && (
              <span className="text-xs text-muted-foreground">
                {userData.specialty_name}
              </span>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Logout>Logout</Logout>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}