"use client"

import { Background } from "@/components/background"
import type React from "react"

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="relative z-10 flex flex-col min-h-screen items-center justify-center">
        {children}
      </main>
    </div>
  )
} 