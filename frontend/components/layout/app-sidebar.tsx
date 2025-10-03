"use client"

import * as React from "react"
import {
  Settings,
  Home,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react"

import { NavMain } from "@/components/layout/navigation/nav-main"
import { NavProjects } from "@/components/layout/navigation/nav-projects"
import { NavUser } from "@/components/layout/navigation/nav-user"
import { TeamSwitcher } from "@/components/layout/navigation/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { UserService, UserData } from "@/lib/user-service"

// Default placeholders used until real user is loaded
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Tableau de bord",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Facturation",
      url: "/facturation",
      icon: CircleDollarSign,
    },
    {
      title: "RAMQ",
      url: "/ramq",
      icon: ShieldCheck,
    },
    {
      title: "Paramètres",
      url: "/parametres",
      icon: Settings,
    },
  ],
  // Mock shortcuts (letter + label)
  shortcuts: [
    { letter: "P", label: "Visite principale", url: "/" },
    { letter: "C", label: "Consultation", url: "/" },
    { letter: "Z", label: "Supplément durée", url: "/" },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: authUser, userData, loading: authLoading, userDataLoading } = useAuth()
  const loading = authLoading || userDataLoading

  const sidebarUser = React.useMemo(() => {
    if (loading || !authUser || !userData) {
      return {
        name: "Loading...",
        email: "",
        avatar: "/avatars/shadcn.jpg",
      }
    }

    const displayName = UserService.getUserDisplayName(userData)
    return {
      name: userData.professional_id ? `Dr. ${displayName}` : displayName,
      email: authUser.email || "",
      avatar: "/avatars/shadcn.jpg",
    }
  }, [authUser, userData, loading])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: "Clinique AQ",
              logo: () => <div className="size-4 rounded-sm bg-primary" />,
              plan: "Organisation",
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects shortcuts={data.shortcuts} />
      </SidebarContent>
      <SidebarFooter>
        {/* Account block at bottom like sidebar-07 */}
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
