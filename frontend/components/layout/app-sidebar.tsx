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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

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
  const [user, setUser] = React.useState(data.user)

  React.useEffect(() => {
    let cancelled = false
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include'
        })
        const json = await res.json()
        if (!cancelled && json?.user) {
          const u = json.user
          setUser({
            name: [u.personalInfo?.firstName, u.personalInfo?.lastName].filter(Boolean).join(' ') || u.email,
            email: u.email,
            avatar: "/avatars/shadcn.jpg"
          })
        }
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [])

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
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
