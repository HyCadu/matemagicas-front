import type React from "react"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Toaster />
    </>
  )
} 