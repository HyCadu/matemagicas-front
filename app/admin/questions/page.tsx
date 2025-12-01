"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, HelpCircle, CheckCircle2, List, Minus, X, Divide } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { questionApi, type Question, getDifficultyLabel, getTopicLabel, getStatusLabel } from "@/lib/api"
import { motion } from "framer-motion"
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

  /**
   * Obtém a cor do gradiente baseado no tópico da pergunta
   * @param topicId - ID do tópico
   * @returns Classes CSS para gradiente
   */
  const getTopicGradient = (topicId: string): string => {
    // IDs dos tópicos fornecidos
    const topicIds: Record<string, string> = {
      "68e03b1d0532b43ba1179b54": "from-green-500 to-emerald-500", // Soma
      "692dcebbc84c3bce2539fb7a": "from-red-500 to-rose-500", // Subtração
      "692dcec8c84c3bce2539fb7b": "from-blue-500 to-cyan-500", // Divisão
      "692dced4c84c3bce2539fb7c": "from-purple-500 to-pink-500", // Multiplicação
    }
    return topicIds[topicId] || "from-gray-500 to-gray-600"
  }

  /**
   * Obtém o ícone baseado no tópico
   * @param topicId - ID do tópico
   * @returns Componente de ícone
   */
  const getTopicIcon = (topicId: string) => {
    const topicIcons: Record<string, React.ReactNode> = {
      "692dceafc84c3bce2539fb79": <Plus className="h-5 w-5" />, // Soma
      "692dcebbc84c3bce2539fb7a": <Minus className="h-5 w-5" />, // Subtração
      "692dcec8c84c3bce2539fb7b": <Divide className="h-5 w-5" />, // Divisão (÷)
      "692dced4c84c3bce2539fb7c": <X className="h-5 w-5" />, // Multiplicação
    }
    return topicIcons[topicId] || <Plus className="h-5 w-5" /> // Desconhecido = Adição
  }

  /**
   * Obtém o nome do tópico baseado no ID
   * @param topicId - ID do tópico
   * @returns Nome do tópico
   */
  const getTopicNameById = (topicId: string): string => {
    const topicNames: Record<string, string> = {
      "692dceafc84c3bce2539fb79": "Adição",
      "692dcebbc84c3bce2539fb7a": "Subtração",
      "692dcec8c84c3bce2539fb7b": "Divisão",
      "692dced4c84c3bce2539fb7c": "Multiplicação",
    }
    return topicNames[topicId] || "Desconhecido"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50">
              {/* Header com gradiente baseado no tópico */}
              <div className={`bg-gradient-to-r ${getTopicGradient((question as any).topicId || String(question.topic))} p-4 sm:p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-white mt-1">
                      {getTopicIcon((question as any).topicId || String(question.topic))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-base sm:text-lg font-bold line-clamp-2">
                        {question.questionText}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
                        >
                          {getDifficultyLabel(question.difficulty)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
                        >
                          {(question as any).topicId ? getTopicNameById((question as any).topicId) : getTopicLabel(question.topic)}
                        </Badge>
                        {question.status === 0 && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-white/20 text-white border-white/30"
                          >
                            {getStatusLabel(question.status)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Botões de ação */}
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewQuestion(question)}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        >
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
              </div>

              {/* Conteúdo do card */}
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  {/* Opções de resposta */}
                  <div className="flex items-center gap-2 text-sm">
                    <List className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="text-gray-500">Opções:</span>{" "}
                      <span className="font-bold text-purple-600">{question.answerOptions.length} alternativas</span>
                    </span>
                  </div>

                  {/* Resposta correta */}
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="text-gray-500">Resposta correta:</span>{" "}
                      <span className="font-bold text-green-600">
                        {String.fromCharCode(65 + question.correctAnswerIndex)}
                      </span>
                    </span>
                  </div>

                  {/* ID (menos proeminente) */}
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-400 font-mono truncate" title={question.id}>
                      ID: {question.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
