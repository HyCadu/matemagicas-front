"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { gameApi, type CreateGameRequest, type User, difficultyOptions, topicOptions, questionApi, type Question, type Game, type UpdateGameRequest } from "@/lib/api"
import { Checkbox } from "@/components/ui/checkbox"

interface GameFormProps {
  onSuccess: () => void
  users: User[]
  game?: Game | null
}

export function GameForm({ onSuccess, users, game }: GameFormProps) {
  const [formData, setFormData] = useState({
    userId: game?.userId || "",
    topics: game?.topics || [] as number[],
    difficulty: game?.difficulty ?? 0,
    questionsIds: game?.questionsIds || [] as string[],
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Carregar questões ao montar
  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await questionApi.getAll({ pageSize: 100 })
        setQuestions(response.data.items)
      } catch {
        setQuestions([])
      }
    }
    loadQuestions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.userId || formData.topics.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um usuário e pelo menos um tópico",
        variant: "destructive",
      })
      return
    }
    if (formData.questionsIds.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma questão para o jogo",
        variant: "destructive",
      })
      return
    }
    try {
      setLoading(true)

      if (game) {
        const updateData: UpdateGameRequest = {
          topics: formData.topics,
          difficulty: formData.difficulty,
          questionsIds: formData.questionsIds,
        }
        await gameApi.update(game.id, updateData)

        toast({
          title: "Sucesso",
          description: "Partida atualizada com sucesso",
        })
      } else {
        const createData: CreateGameRequest = {
          userId: formData.userId,
          topics: formData.topics,
          difficulty: formData.difficulty,
          questionsIds: formData.questionsIds,
        }
        await gameApi.create(createData)

        toast({
          title: "Sucesso",
          description: "Partida criada com sucesso",
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: game ? "Falha ao atualizar partida" : "Falha ao criar partida",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = (topicValue: number) => {
    setFormData((prev) => {
      if (prev.topics.includes(topicValue)) {
        return {
          ...prev,
          topics: prev.topics.filter((t) => t !== topicValue),
        }
      } else {
        return {
          ...prev,
          topics: [...prev.topics, topicValue],
        }
      }
    })
  }

  const toggleQuestion = (questionId: string) => {
    setFormData((prev) => {
      if (prev.questionsIds.includes(questionId)) {
        return {
          ...prev,
          questionsIds: prev.questionsIds.filter((id) => id !== questionId),
        }
      } else {
        return {
          ...prev,
          questionsIds: [...prev.questionsIds, questionId],
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="userId">Usuário *</Label>
        <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })} disabled={!!game}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um usuário" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="difficulty">Dificuldade</Label>
        <Select
          value={formData.difficulty.toString()}
          onValueChange={(value) => setFormData({ ...formData, difficulty: Number.parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {difficultyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Tópicos *</Label>
        <div className="space-y-2">
          {topicOptions.map((topic) => (
            <div key={topic.value} className="flex items-center space-x-2">
              <Checkbox
                id={`topic-${topic.value}`}
                checked={formData.topics.includes(topic.value)}
                onCheckedChange={() => toggleTopic(topic.value)}
              />
              <label
                htmlFor={`topic-${topic.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {topic.label}
              </label>
            </div>
          ))}
        </div>

        {formData.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.topics.map((topicValue) => {
              const topic = topicOptions.find((t) => t.value === topicValue)
              return (
                <Badge key={topicValue} variant="secondary" className="flex items-center gap-1">
                  {topic?.label || topicValue}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTopic(topicValue)} />
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Questões do Jogo *</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
          {questions.map((q) => (
            <div key={q.id} className="flex items-center space-x-2">
              <Checkbox
                id={`question-${q.id}`}
                checked={formData.questionsIds.includes(q.id)}
                onCheckedChange={() => toggleQuestion(q.id)}
              />
              <label htmlFor={`question-${q.id}`} className="text-xs">
                {q.questionText}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (game ? "Atualizando..." : "Criando...") : (game ? "Atualizar Partida" : "Criar Partida")}
        </Button>
      </div>
    </form>
  )
}
