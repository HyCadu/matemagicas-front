"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { gameApi, type Game, type UpdateGameRequest } from "@/lib/api"

interface GameResultFormProps {
  game: Game
  onSuccess: () => void
  userName: string
}

export function GameResultForm({ game, onSuccess, userName }: GameResultFormProps) {
  const [formData, setFormData] = useState({
    score: game.score?.toString() || "",
    correctAnswers: game.correctAnswers?.toString() || "",
    incorrectAnswers: game.incorrectAnswers?.toString() || "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const updateData: UpdateGameRequest = {
        ...(formData.score && { score: Number.parseInt(formData.score) }),
        ...(formData.correctAnswers && { correctAnswers: Number.parseInt(formData.correctAnswers) }),
        ...(formData.incorrectAnswers && { incorrectAnswers: Number.parseInt(formData.incorrectAnswers) }),
      }

      await gameApi.update(game.id, updateData)

      toast({
        title: "Sucesso",
        description: "Resultado da partida atualizado com sucesso",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar resultado da partida",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Partida de {userName}</h3>
        <p className="text-sm text-gray-600">Data: {new Date(game.date).toLocaleDateString("pt-BR")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="score">Pontuação</Label>
          <Input
            id="score"
            type="number"
            min="0"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            placeholder="Pontuação obtida"
          />
        </div>

        <div>
          <Label htmlFor="correctAnswers">Respostas Corretas</Label>
          <Input
            id="correctAnswers"
            type="number"
            min="0"
            value={formData.correctAnswers}
            onChange={(e) => setFormData({ ...formData, correctAnswers: e.target.value })}
            placeholder="Número de respostas corretas"
          />
        </div>

        <div>
          <Label htmlFor="incorrectAnswers">Respostas Incorretas</Label>
          <Input
            id="incorrectAnswers"
            type="number"
            min="0"
            value={formData.incorrectAnswers}
            onChange={(e) => setFormData({ ...formData, incorrectAnswers: e.target.value })}
            placeholder="Número de respostas incorretas"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Resultado"}
          </Button>
        </div>
      </form>
    </div>
  )
}
