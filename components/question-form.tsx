"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  questionApi,
  userApi,
  type Question,
  type CreateQuestionRequest,
  type UpdateQuestionRequest,
  type User,
} from "@/lib/api"

const topicOptions = [
  { value: 1, label: "Adição" },
  { value: 2, label: "Subtração" },
  { value: 3, label: "Multiplicação" },
  { value: 4, label: "Divisão" },
]

const difficultyOptions = [
  { value: 1, label: "Fácil" },
  { value: 2, label: "Médio" },
  { value: 3, label: "Difícil" },
]

interface QuestionFormProps {
  question?: Question | null
  onSuccess: () => void
}

export function QuestionForm({ question, onSuccess }: QuestionFormProps) {
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    userId: question?.userId || "",
    questionText: question?.questionText || "",
    answerOptions: question?.answerOptions || ["", "", "", ""],
    correctAnswerIndex: question?.correctAnswerIndex ?? 0,
    topic: question?.topic ?? 1,
    difficulty: question?.difficulty ?? 1,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll({ pageSize: 100 })
      if (response.data && Array.isArray(response.data.items)) {
        setUsers(response.data.items.filter((user) => user.status === 1))
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.questionText.trim() || !formData.userId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const validOptions = formData.answerOptions.filter((option) => option.trim())
    if (validOptions.length < 2) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos 2 opções de resposta",
        variant: "destructive",
      })
      return
    }

    if (formData.correctAnswerIndex >= validOptions.length) {
      toast({
        title: "Erro",
        description: "Selecione uma resposta correta válida",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      if (question) {
        const updateData: UpdateQuestionRequest = {
          questionText: formData.questionText,
          answersOptions: validOptions,
          correctAnswerIndex: formData.correctAnswerIndex,
          topic: formData.topic,
          difficulty: formData.difficulty,
        }
        await questionApi.update(question.id, updateData)
        toast({
          title: "Sucesso",
          description: "Pergunta atualizada com sucesso",
        })
      } else {
        const createData: CreateQuestionRequest = {
          userId: formData.userId,
          questionText: formData.questionText,
          answersOptions: validOptions,
          correctAnswerIndex: formData.correctAnswerIndex,
          topic: formData.topic,
          difficulty: formData.difficulty,
        }
        await questionApi.create(createData)
        toast({
          title: "Sucesso",
          description: "Pergunta criada com sucesso",
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: question ? "Falha ao atualizar pergunta" : "Falha ao criar pergunta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    setFormData({
      ...formData,
      answerOptions: [...formData.answerOptions, ""],
    })
  }

  const removeOption = (index: number) => {
    const newOptions = formData.answerOptions.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      answerOptions: newOptions,
      correctAnswerIndex: formData.correctAnswerIndex >= newOptions.length ? 0 : formData.correctAnswerIndex,
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.answerOptions]
    newOptions[index] = value
    setFormData({
      ...formData,
      answerOptions: newOptions,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!question && (
        <div>
          <Label htmlFor="userId">Usuário *</Label>
          <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
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
      )}

      <div>
        <Label htmlFor="questionText">Texto da Pergunta *</Label>
        <Textarea
          id="questionText"
          value={formData.questionText}
          onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
          placeholder="Digite o texto da pergunta"
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="topic">Tópico</Label>
        <Select
          value={formData.topic.toString()}
          onValueChange={(value) => setFormData({ ...formData, topic: Number.parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {topicOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
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
        <div className="flex items-center justify-between mb-3">
          <Label>Opções de Resposta *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-3">
          {formData.answerOptions.map((option, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswerIndex === index}
                  onChange={() => setFormData({ ...formData, correctAnswerIndex: index })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{index + 1}.</span>
              </div>
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
                className="flex-1"
              />
              {formData.answerOptions.length > 2 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">Selecione a opção correta marcando o botão de rádio correspondente</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : question ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  )
}
