"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { gameApi, type CreateGameRequest, type User, difficultyOptions, getTopicLabel, questionApi, type Question, type Game, type UpdateGameRequest } from "@/lib/api"
import { Checkbox } from "@/components/ui/checkbox"

// Definição dos tópicos disponíveis para o jogo
const gameTopicOptions = [
  { value: 1, label: "Adição" },
  { value: 2, label: "Subtração" },
  { value: 3, label: "Multiplicação" },
  { value: 4, label: "Divisão" },
]

// Interface que define as props do componente
interface GameFormProps {
  onSuccess: () => void  // Callback chamado após sucesso na criação/atualização
  users: User[]          // Lista de usuários disponíveis
  game?: Game | null     // Jogo existente (opcional, usado para edição)
}

export function GameForm({ onSuccess, users, game }: GameFormProps) {
  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    userId: game?.userId || "",
    topics: game?.topics || [] as number[],
    difficulty: game?.difficulty ?? 1,
    questionsIds: game?.questionsIds || [] as string[],
  })
  const [questions, setQuestions] = useState<Question[]>([])  // Lista de questões disponíveis
  const [loading, setLoading] = useState(false)              // Estado de carregamento
  const { toast } = useToast()                               // Hook para exibir notificações

  // Efeito para carregar todas as questões ativas ao montar o componente (apenas uma vez)
  useEffect(() => {
    async function loadQuestions() {
      try {
        // Carrega todas as questões ativas (status = 1) sem filtro de tópico inicial
        const response = await questionApi.getAll({ 
          pageSize: 100,
          Status: 1,
        })
        setQuestions(response.data.items)
      } catch {
        setQuestions([])
      }
    }
    loadQuestions()
  }, []) // Vazio, executa apenas no montagem

  // Filtra as questões com base nos tópicos e dificuldade selecionados no frontend
  const filteredQuestions = questions.filter(q => 
    (formData.topics.length === 0 || (q.topic && formData.topics.includes(q.topic))) &&
    (q.difficulty === formData.difficulty)
  )

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações básicas
    if (!formData.userId || formData.topics.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um usuário e pelo menos um tópico",
        variant: "destructive",
      })
      return
    }
    // Garante que haja questões selecionadas apenas das questões FILTRADAS
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

      // Lógica para atualizar ou criar um novo jogo
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

  // Função para alternar a seleção de tópicos
  const toggleTopic = (topicValue: number) => {
    setFormData((prev) => {
      const newTopics = prev.topics.includes(topicValue)
        ? prev.topics.filter((t) => t !== topicValue)
        : [...prev.topics, topicValue]
      
      // Limpa as questões selecionadas quando mudar os tópicos
      return {
        ...prev,
        topics: newTopics,
        questionsIds: [] // Limpa as questões selecionadas
      }
    })
  }

  // Função para lidar com a mudança de dificuldade
  const handleDifficultyChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      difficulty: value,
      questionsIds: [] // Limpa as questões selecionadas ao mudar a dificuldade
    }))
  }

  // Função para alternar a seleção de questões
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

  // Renderização do formulário
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Seleção de usuário */}
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

      {/* Seleção de dificuldade como checkboxes lado a lado */}
      <div>
        <Label htmlFor="difficulty">Dificuldade</Label>
        <div className="flex flex-wrap gap-4 mt-2">
          {difficultyOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`difficulty-${option.value}`}
                checked={formData.difficulty === option.value}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleDifficultyChange(option.value)
                  }
                }}
              />
              <label
                htmlFor={`difficulty-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Seleção de tópicos */}
      <div>
        <Label className="mb-2 block">Tópicos *</Label>
        <div className="space-y-2">
          {gameTopicOptions.map((topic) => (
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

        {/* Exibição dos tópicos selecionados */}
        {formData.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.topics.map((topicValue) => {
              const topic = gameTopicOptions.find((t) => t.value === topicValue)
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

      {/* Seleção de questões */}
      <div>
        <Label className="mb-2 block">Questões do Jogo *</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
          {filteredQuestions.map((q) => ( // Renderiza as questões filtradas
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
          {filteredQuestions.length === 0 && formData.topics.length > 0 && (
            <p className="text-sm text-gray-500">Nenhuma questão encontrada para os tópicos selecionados.</p>
          )}
          {formData.topics.length === 0 && (
            <p className="text-sm text-gray-500">Selecione um tópico para ver as questões.</p>
          )}
          {filteredQuestions.length === 0 && formData.topics.length > 0 && (
            <p className="text-sm text-gray-500">Nenhuma questão encontrada para a dificuldade selecionada.</p>
          )}
          {filteredQuestions.length === 0 && formData.topics.length === 0 && (
            <p className="text-sm text-gray-500">Selecione um tópico e/ou dificuldade para ver as questões.</p>
          )}
        </div>
      </div>

      {/* Botão de submissão */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (game ? "Atualizando..." : "Criando...") : (game ? "Atualizar Partida" : "Criar Partida")}
        </Button>
      </div>
    </form>
  )
}
