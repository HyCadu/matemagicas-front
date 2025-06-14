"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { userApi, type User, type CreateUserRequest, type UpdateUserRequest, roleOptions } from "@/lib/api"

interface UserFormProps {
  user?: User | null
  onSuccess: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    password: "",
    role: user?.role ?? 0, // 0 = Player ; 1 = Administrator
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.dateOfBirth) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (!user && !formData.password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória para novos usuários",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      })
      return
    }

    // Validate date
    const selectedDate = new Date(formData.dateOfBirth)
    const today = new Date()
    if (selectedDate > today) {
      toast({
        title: "Erro",
        description: "Data de nascimento não pode ser no futuro",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      if (user) {
        const updateData: UpdateUserRequest = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          dateOfBirth: formData.dateOfBirth,
          ...(formData.password.trim() && { password: formData.password }),
        }

        console.log("Updating user with data:", updateData)
        await userApi.update(user.id, updateData)

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        })
      } else {
        const createData: CreateUserRequest = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          dateOfBirth: formData.dateOfBirth,
          password: formData.password,
          role: formData.role,
        }

        console.log("Creating user with data:", createData)
        await userApi.create(createData)

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso",
        })
      }

      onSuccess()
    } catch (error: any) {
      console.error("Form submission error:", error)

      let errorMessage = "Erro desconhecido"

      if (error.response) {
        // Server responded with error status
        errorMessage = `Erro ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Erro de conexão: Não foi possível conectar com o servidor"
      } else {
        // Something else happened
        errorMessage = error.message || "Erro na requisição"
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Digite o nome do usuário"
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Digite o email do usuário"
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
          disabled={loading}
          max={new Date().toISOString().split("T")[0]} // Prevent future dates
        />
      </div>

      <div>
        <Label htmlFor="role">Tipo de Usuário *</Label>
        <Select value={formData.role.toString()} onValueChange={(value) => setFormData({ ...formData, role: Number.parseInt(value) })} disabled={loading}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Selecione o tipo de usuário" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label === "Usuário" ? "Aluno" : option.label === "Administrador" ? "Professor" : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="password">Senha {user ? "(deixe em branco para manter a atual)" : "*"}</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder={user ? "Nova senha (opcional)" : "Digite a senha"}
          required={!user}
          disabled={loading}
          minLength={6}
        />
        {!user && <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : user ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  )
}
