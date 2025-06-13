"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion } from "framer-motion"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { userApi, type LoginRequest, type User as UserType } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function PlayLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState<LoginRequest>({ email: "", password: "" })
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await userApi.login(loginForm)
      const user: UserType = response.data

      // Salvar informações do usuário logado no localStorage
      localStorage.setItem("matemagicas:user", JSON.stringify(user))
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo ao Matemágicas!",
        variant: "default",
      })
      router.push("/play/menu")
    } catch (error) {
      toast({
        title: "Erro no Login",
        description: "Verifique seu e-mail e senha. Tente novamente.",
        variant: "destructive",
      })
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Título com bandeira */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="relative mb-8"
      >
        <div className="relative">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-16 py-6 rounded-full border-4 border-yellow-600 shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-900 text-center">MATEMÁGICAS</h1>
          </div>
        </div>
      </motion.div>

      {/* Card de Login */}
      <Card className="p-8 w-full max-w-md bg-yellow-100 rounded-3xl shadow-xl border-4 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-yellow-900 text-center mb-6">
            Entrar no Jogo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-yellow-900 font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Email do jogador
              </label>
              <Input
                type="text"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="Digite seu email"
                className="h-12 text-lg border-2 border-yellow-600 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-yellow-900 font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Senha (opcional)
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Digite sua senha"
                  className="h-12 text-lg border-2 border-yellow-600 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full h-14 bg-gradient-to-b from-green-400 to-green-600 border-4 border-green-700 text-white text-xl font-bold rounded-xl shadow-lg hover:from-green-500 hover:to-green-700"
              disabled={loading}
            >
              {loading ? "Entrando..." : "🎮 Começar a Jogar!"}
            </motion.button>
          </form>

          <div className="mt-6 flex flex-col items-center">
            <span className="text-xs text-yellow-900 mb-2">Ou</span>
            <Button
              variant="outline"
              className="border-2 border-purple-400 text-purple-700 hover:bg-purple-100 font-bold rounded-full px-6 py-2"
              onClick={() => router.push("/admin/users")}
            >
              Acessar painel admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 