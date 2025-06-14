"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { questionApi, type Question, getDifficultyLabel, getTopicLabel, getStatusLabel } from "@/lib/api"
import { QuestionForm } from "@/components/question-form"
import { QuestionView } from "@/components/question-view"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadQuestions()
  }, [showInactive])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const response = await questionApi.getAll({ 
        pageSize: 100,
        Status: showInactive ? undefined : 1 // Filtra apenas ativas se showInactive for false
      })

      if (response.data && Array.isArray(response.data.items)) {
        setQuestions(response.data.items)
      } else {
        console.error("Questions API response is not in expected format:", response.data)
        setQuestions([])
        toast({
          title: "Aviso",
          description: "Formato de resposta inesperado da API",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading questions:", error)
      setQuestions([])
      toast({
        title: "Erro",
        description: "Falha ao carregar perguntas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuestion = () => {
    setSelectedQuestion(null)
    setIsFormOpen(true)
  }

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setIsFormOpen(true)
  }

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setIsViewOpen(true)
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      await questionApi.delete(id)
      toast({
        title: "Sucesso",
        description: "Pergunta deletada com sucesso",
      })
      loadQuestions()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao deletar pergunta",
        variant: "destructive",
      })
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    loadQuestions()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando perguntas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perguntas</h1>
          <p className="text-gray-600 mt-2">Gerencie as perguntas dos jogos</p>
        </div>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Button
            variant={showInactive ? "default" : "outline"}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "Ocultar Inativas" : "Mostrar Inativas"}
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Pergunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedQuestion ? "Editar Pergunta" : "Nova Pergunta"}</DialogTitle>
                <DialogDescription>
                  {selectedQuestion
                    ? "Edite as informações da pergunta"
                    : "Preencha os dados para criar uma nova pergunta"}
                </DialogDescription>
              </DialogHeader>
              <QuestionForm question={selectedQuestion} onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.map((question) => (
          <Card key={question.id} className="h-full flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between h-full">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-2 break-words">{question.questionText}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{getDifficultyLabel(question.difficulty)}</Badge>
                    <Badge variant="outline">{getTopicLabel(question.topic)}</Badge>
                    <Badge variant={question.status === 0 ? "default" : "secondary"}>
                      {getStatusLabel(question.status)}
                    </Badge>
                  </div>
                  <CardDescription>{question.answerOptions.length} opções de resposta</CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" size="sm" onClick={() => handleViewQuestion(question)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditQuestion(question)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar pergunta</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação fará uma exclusão lógica da pergunta. Ela não será mais exibida nos jogos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-shrink-0">
              <div className="text-sm text-gray-600">
                <p>Criada por: {question.userId}</p>
                <p>ID: {question.id}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhuma pergunta encontrada</p>
          <Button className="mt-4" onClick={handleCreateQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Criar primeira pergunta
          </Button>
        </div>
      )}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar Pergunta</DialogTitle>
          </DialogHeader>
          {selectedQuestion && <QuestionView question={selectedQuestion} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
