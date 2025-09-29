import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Sidebar removed to allow a fresh shadcn navbar to be added
import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAMQ-SCAN-APP",
  description: "helps doctors pay bills without messing around",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 relative">
        <div className="sticky top-0 z-50 flex items-center gap-2 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 py-2">
          <SidebarTrigger className="h-8 w-8" />
          <span className="text-sm font-medium">RAMQ Scan</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 mx-auto w-full max-w-[1200px]">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}