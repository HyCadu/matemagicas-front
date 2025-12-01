"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { gameApi, getLoggedUser, difficultyOptions, topicOptions } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Volume2, ArrowLeft, Play, Star } from "lucide-react"
import { GameButton } from "@/components/ui/game-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function PlayMenuPage() {
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<number[]>([1])
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1)
  const user = getLoggedUser()

  // Função para determinar o número de estrelas com base na pontuação
  const getStars = (score: number) => {
    let filledStars = 0
    if (score > 0 && score <= 30) {
      filledStars = 1
    } else if (score > 30 && score <= 90) {
      filledStars = 2
    } else if (score > 91) {
      filledStars = 3
    }
    
    return {
      filled: filledStars,
      empty: 3 - filledStars,
    }
  }

  // Carrega todos os games do usuário
  const loadGames = async () => {
    setLoading(true)
    try {
      const response = await gameApi.getAll({ UserId: user.id, pageSize: 20 })
      setGames(response.data.items)
    } catch (e) {
      setGames([])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user) {
      router.push("/play")
      return
    }
    loadGames()
    // eslint-disable-next-line
  }, [])

  // Função para criar novo game
  const handleCreateGame = async () => {
    setCreating(true)
    try {
      await gameApi.create({
        userId: user.id,
        topics: selectedTopics,
        difficulty: selectedDifficulty,
      })
      await loadGames()
      setShowCreateModal(false)
      // Resetar os valores do modal para o padrão
      setSelectedTopics([1])
      setSelectedDifficulty(1)
    } catch (e) {
      console.error("Erro ao criar jogo:", e)
    }
    setCreating(false)
  }

  if (!user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="flex flex-col items-center justify-center space-y-8"
    >
      
{/* Bandeira no topo */}
<div className="relative -mt-12 mb-8 flex justify-center">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-8 py-3 rounded-full border-4 border-yellow-600 shadow-xl">
            <h2 className="text-2xl font-bold text-yellow-900">MATEMÁGICAS</h2>
          </div>
        </div>
      {/* Placa principal com níveis */}
      <Card className="p-8 w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-purple-400 shadow-xl">
        

        {/* Grid de níveis */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {loading || creating ? (
            <span className="col-span-full text-purple-700 text-lg font-bold text-center">Carregando...</span>
          ) : (
            games.map((game, idx) => {
              const stars = getStars(game.score || 0)
              return (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/play/game/${game.id}`)}
                  className="bg-gradient-to-b from-purple-300 to-purple-500 border-4 border-purple-600 rounded-2xl p-4 cursor-pointer shadow-lg hover:shadow-xl flex flex-col items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{idx + 1}</div>
                    <div className="flex justify-center space-x-1">
                      {[...Array(stars.filled)].map((_, i) => (
                        <Star key={`filled-${i}`} className="w-4 h-4 text-yellow-500" fill="currentColor" />
                      ))}
                      {[...Array(stars.empty)].map((_, i) => (
                        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
          {/* Botão Novo Nível, se houver menos de 3 jogos */}
          {!loading && !creating && games.length < 3 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-b from-green-400 to-green-600 border-4 border-green-600 rounded-2xl p-4 cursor-pointer shadow-lg hover:shadow-xl flex flex-col items-center justify-center"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">+</div>
                <p className="text-sm text-white font-bold">Novo Nível</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Texto de seleção */}
        <div className="bg-gradient-to-b from-yellow-300 to-yellow-400 border-4 border-yellow-600 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-yellow-900">Selecione uma fase</p>
        </div>
      </Card>

      {/* Botões de navegação */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 mt-8">
        <GameButton onClick={() => router.push("/play")} variant="secondaryGame" size="medium">
          <ArrowLeft className="w-6 h-6" />
        </GameButton>
        {/* O botão Play pode ser adicionado se houver uma lógica clara para ele aqui */}
        {/* <GameButton onClick={() => startGame("easy")} variant="primary" size="medium">
          <Play className="w-6 h-6" />
        </GameButton> */}
      </div>

      {/* Modal de criação de novo nível */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="p-8 w-full max-w-2xl border-4 border-yellow-600 rounded-2xl p-4 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-700 text-center mb-4">Criar Novo Nível</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Seleção de Tema com Checkboxes */}
            <div className="grid gap-2">
              <Label htmlFor="topic" className="text-lg font-bold text-purple-700">Tema</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {topicOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`topic-${option.value}`}
                      checked={selectedTopics.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTopics([...selectedTopics, option.value])
                        } else {
                          setSelectedTopics(selectedTopics.filter((t) => t !== option.value))
                        }
                      }}
                      className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor={`topic-${option.value}`}
                      className="text-md font-medium text-purple-700 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Seleção de Dificuldade com Select */}
            <div className="grid gap-2">
              <Label htmlFor="difficulty" className="text-lg font-bold text-purple-700">Dificuldade</Label>
              <Select value={selectedDifficulty.toString()} onValueChange={(value) => setSelectedDifficulty(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma dificuldade" />
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
          </div>
          <DialogFooter className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="px-6 py-3 text-lg rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleCreateGame} disabled={creating} className="px-6 py-3 text-lg rounded-full bg-purple-600 text-white hover:bg-purple-700">
              {creating ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
} 