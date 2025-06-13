"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { gameApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Volume2, ArrowLeft, Play, Star } from "lucide-react"
import { GameButton } from "@/components/ui/game-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Função utilitária para obter usuário logado do localStorage
function getLoggedUser() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("matemagicas:user")
    return user ? JSON.parse(user) : null
  }
  return null
}

export default function PlayMenuPage() {
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
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
        topics: [0],
        difficulty: 0,
      })
      await loadGames()
    } catch (e) {}
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
      {/* Ícone de som */}
      <div className="absolute top-8 right-8">
        <GameButton onClick={() => {}} variant="secondaryGame" size="medium">
          <Volume2 className="w-6 h-6" />
        </GameButton>
      </div>
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
          {/* Botão Novo Nível, se houver menos de 4 jogos */}
          {!loading && !creating && games.length < 4 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateGame}
              className="bg-gradient-to-b from-green-400 to-green-600 border-4 border-green-700 rounded-2xl p-4 cursor-pointer shadow-lg hover:shadow-xl flex flex-col items-center justify-center"
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
    </motion.div>
  )
} 