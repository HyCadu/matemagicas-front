"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, Users, HelpCircle, Home, Menu, X, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navigation = [
  { name: "Voltar ao jogo", href: "/", icon: Home },
  { name: "Perguntas", href: "/admin/questions", icon: HelpCircle },
  { name: "Usuários", href: "/admin/users", icon: Users },
  { name: "Métricas", href: "/admin/metrics", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">Matemágicas</span>
          </Link>

          <div className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <Calculator className="h-6 w-6 text-indigo-600" />
                  <span>Matemágicas</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-1 mt-6">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
