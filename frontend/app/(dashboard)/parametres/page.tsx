"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HeaderRow } from "@/components/features/blocks/HeaderRow"
import { GeneralSettings } from "@/components/features/settings/GeneralSettings"
import { ProfileSettings } from "@/components/features/settings/ProfileSettings"
import { ShortcutsSettings } from "@/components/features/settings/ShortcutsSettings"
import { NotificationsSettings } from "@/components/features/settings/NotificationsSettings"
import { PaymentSettings } from "@/components/features/settings/PaymentSettings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general")

  return (
    <div className="p-2 sm:p-4">
      {/* Page Header */}
      <HeaderRow title="Paramètres" />

      {/* Navigation Tabs */}
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-fit h-8 p-0.5">
          <TabsTrigger value="general" className="px-2 py-1 text-sm">Général</TabsTrigger>
          <TabsTrigger value="profile" className="px-2 py-1 text-sm">Profil & RAMQ</TabsTrigger>
          <TabsTrigger value="shortcuts" className="px-2 py-1 text-sm">Raccourcis</TabsTrigger>
          <TabsTrigger value="notifications" className="px-2 py-1 text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="payment" className="px-2 py-1 text-sm">Paiement</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <GeneralSettings />
        </TabsContent>

        {/* Profile & RAMQ Settings */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <ProfileSettings />
        </TabsContent>

        {/* Shortcuts Settings */}
        <TabsContent value="shortcuts" className="mt-6 space-y-6">
          <ShortcutsSettings />
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <NotificationsSettings />
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="mt-6 space-y-6">
          <PaymentSettings />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}