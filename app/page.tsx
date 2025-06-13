"use client"

import Link from "next/link"
import { Calculator, Users, HelpCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/play")
  return null
}
