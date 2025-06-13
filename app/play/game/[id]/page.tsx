"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { gameApi, questionApi, type Question, type UpdateGameRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2 } from "lucide-react"
import { GameButton } from "@/components/ui/game-button"

export default function PlayGamePage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [game, setGame] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchQuestions = useCallback(async (questionIds: any[]) => {
    const fetchedQuestions: Question[] = []
    for (const questionId of questionIds) {
      try {
        // Garantir que o ID seja uma string
        const idString = typeof questionId === 'object' && questionId.toString ? questionId.toString().match(/\(\'(.*)\'\)/)?.[1] || String(questionId) : String(questionId);
        const response = await questionApi.getById(idString)
        fetchedQuestions.push(response.data)
      } catch (error) {
        console.error(`Erro ao carregar questão ${questionId}:`, error)
      }
    }
    return fetchedQuestions
  }, [])

  useEffect(() => {
    if (!id) return
    const loadGameAndQuestions = async () => {
      setLoading(true)
      try {
        const gameResponse = await gameApi.getById(id as string)
        let fetchedGameData = gameResponse.data;

        // Se a API retornar um array, pegue o primeiro elemento
        if (Array.isArray(fetchedGameData)) {
          fetchedGameData = fetchedGameData[0];
        }

        setGame(fetchedGameData);

        if (fetchedGameData?.questionsIds && fetchedGameData.questionsIds.length > 0) {
          const fetched = await fetchQuestions(fetchedGameData.questionsIds)
          setQuestions(fetched)
        } else {
          setQuestions([])
          toast({
            title: "Aviso",
            description: "Nenhuma questão encontrada para este jogo.",
            variant: "default",
          })
        }
      } catch (e) {
        setGame(null)
        setQuestions([])
        toast({
          title: "Erro",
          description: "Falha ao carregar jogo. Tente novamente.",
          variant: "destructive",
        })
      }
      setLoading(false)
    }
    loadGameAndQuestions()
  }, [id, fetchQuestions, toast])

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return // Evita múltiplas respostas

    setSelectedAnswerIndex(answerIndex)
    const currentQuestion = questions[currentQuestionIndex]

    const correct = answerIndex === currentQuestion.correctAnswerIndex
    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      setScore((prev) => prev + 10) // Exemplo: 10 pontos por acerto
      setCorrectAnswersCount((prev) => prev + 1)
    } else {
      setIncorrectAnswersCount((prev) => prev + 1)
    }
  }

  const handleNextQuestion = async () => {
    setShowFeedback(false)
    setSelectedAnswerIndex(null)
    setIsCorrect(null)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Jogo finalizado
      toast({
        title: "Jogo Finalizado!",
        description: "Você completou todas as questões.",
        variant: "default",
      })
      // Calcular o score final como porcentagem de acertos
      const finalScore = questions.length > 0 ? (correctAnswersCount / questions.length) * 100 : 0;
      // Atualizar o status do game na API (Ex: score, correctAnswers, incorrectAnswers)
      try {
        const updateData: UpdateGameRequest = {
          score: finalScore,
          correctAnswers: correctAnswersCount,
          incorrectAnswers: incorrectAnswersCount,
        }
        await gameApi.update(id as string, updateData)
        console.log("Game updated successfully!")
      } catch (e) {
        console.error("Error updating game: ", e)
      }
      router.push("/play/menu") // Redirecionar para o menu
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-2xl text-white font-bold z-10">Carregando jogo...</span>
      </div>
    )
  }

  if (!game || questions.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center z-10">
          <span className="text-2xl text-white font-bold">Jogo não encontrado ou sem questões!</span>
          <Button className="mt-8 bg-white text-purple-800 font-extrabold text-lg px-8 py-3 rounded-full shadow-lg border-2 border-purple-400 hover:bg-gray-100" onClick={() => router.push("/play/menu")}>Voltar ao menu</Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center space-y-8 h-full"
    >
      {/* Ícone de som */}
      <div className="absolute top-8 right-8">
        <GameButton onClick={() => {}} variant="primary" size="medium">
          <Volume2 className="w-6 h-6" />
        </GameButton>
      </div>

      {/* Progresso */}
      <div className="text-white text-xl font-bold">
        Pergunta {currentQuestionIndex + 1}/{questions.length} | ⭐ {score}
      </div>

      {currentQuestion && (
        <>
          {/* Pergunta */}
          <Card className="p-8 w-full max-w-2xl text-center bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-purple-400 shadow-xl">
            <div className="text-4xl sm:text-6xl md:text-8xl font-bold text-yellow-900">
              {currentQuestion.questionText}
            </div>
          </Card>

          {/* Opções de resposta */}
          <div className="space-y-4 w-full max-w-md">
            {currentQuestion.answerOptions.map((option: string, index: number) => (
              <motion.button
                key={index}
                whileHover={{ scale: selectedAnswerIndex === null ? 1.02 : 1 }}
                whileTap={{ scale: selectedAnswerIndex === null ? 0.98 : 1 }}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswerIndex !== null}
                className={`w-full h-16 text-3xl font-bold rounded-2xl border-4 transition-all duration-300 ${
                  selectedAnswerIndex === index
                    ? isCorrect
                      ? "bg-gradient-to-b from-green-400 to-green-600 border-green-700 text-white"
                      : "bg-gradient-to-b from-red-400 to-red-600 border-red-700 text-white"
                    : showFeedback && index === currentQuestion.correctAnswerIndex // Mostrar correta se a resposta foi dada
                      ? "bg-gradient-to-b from-green-400 to-green-600 border-green-700 text-white"
                      : "bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-600 text-yellow-900 hover:from-yellow-400 hover:to-yellow-600"
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-3xl font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}
              >
                {isCorrect ? "🎉 Correto!" : "😊 Tente novamente!"}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      {showFeedback && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextQuestion}
          className="mt-6 w-full max-w-md h-16 bg-gradient-to-b from-blue-400 to-blue-600 border-4 border-blue-700 text-white text-xl font-bold rounded-2xl shadow-lg hover:from-blue-500 hover:to-blue-700"
        >
          {currentQuestionIndex < questions.length - 1 ? "Próxima Questão" : "Finalizar Jogo"}
        </motion.button>
      )}
    </motion.div>
  )
} 