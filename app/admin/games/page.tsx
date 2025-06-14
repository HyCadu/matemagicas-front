"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Edit, Calendar, User, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { gameApi, userApi, type Game, type User as ApiUser, getDifficultyLabel, getStatusLabel } from "@/lib/api"
import { GameForm } from "@/components/game-form"
import { GameView } from "@/components/game-view"
import { GameResultForm } from "@/components/game-result-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadGames()
    loadUsers()
  }, [])

  useEffect(() => {
    loadGames()
  }, [filters])

  const loadGames = async () => {
    try {
      setLoading(true)
      const params = {
        ...(filters.userId && filters.userId !== "all" && { UserId: filters.userId }),
        ...(filters.startDate && { Date: filters.startDate }),
        pageSize: 100,
      }
      const response = await gameApi.getAll(params)

      if (response.data && Array.isArray(response.data.items)) {
        const validGames = response.data.items.filter(game => {
          const userExists = users.some(user => user.id === game.userId && user.status === 1)
          return game.userId && userExists
        })
        
        setGames(validGames)
      } else {
        console.error("Games API response is not in expected format:", response.data)
        setGames([])
        toast({
          title: "Aviso",
          description: "Formato de resposta inesperado da API",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading games:", error)
      setGames([])
      toast({
        title: "Erro",
        description: "Falha ao carregar partidas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll({ pageSize: 100 })
      if (response.data && Array.isArray(response.data.items)) {
        setUsers(response.data.items.filter((user) => user.status === 1))
      } else {
        console.error("Users API response is not in expected format:", response.data)
        setUsers([])
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      setUsers([])
    }
  }

  const handleCreateGame = () => {
    setSelectedGame(null)
    setIsFormOpen(true)
  }

  const handleViewGame = (game: Game) => {
    setSelectedGame(game)
    setIsViewOpen(true)
  }

  const handleEditGame = (game: Game) => {
    setSelectedGame(game)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    loadGames()
  }

  const getStatusLabel = (game: Game) => {
    if (game.score > 0 || game.correctAnswers > 0 || game.incorrectAnswers > 0) {
      return { label: "Finalizada", color: "bg-green-100 text-green-800" }
    }
    return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" }
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || "Usuário não encontrado"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando partidas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partidas</h1>
          <p className="text-gray-600 mt-2">Gerencie as partidas de matemática</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateGame}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Partida
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedGame ? "Editar Partida" : "Nova Partida"}</DialogTitle>
              <DialogDescription>
                {selectedGame
                  ? "Edite as informações da partida"
                  : "Crie uma nova pré-partida para um usuário"}
              </DialogDescription>
            </DialogHeader>
            <GameForm game={selectedGame} onSuccess={handleFormSuccess} users={users} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="userFilter">Usuário</Label>
              <Select value={filters.userId} onValueChange={(value) => setFilters({ ...filters, userId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => {
          const status = getStatusLabel(game)
          return (
            <Card key={game.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <CardTitle className="text-lg">{getUserName(game.userId)}</CardTitle>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <CardDescription>
                      Tópicos:{" "}
                      {game.topics.map((topic, index) => (
                        <span key={index} className="mr-1">
                          {index > 0 && ", "}
                          {topic}
                        </span>
                      ))}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewGame(game)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {status.label !== "Finalizada" && (
                      <Button variant="outline" size="sm" onClick={() => handleEditGame(game)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {game.score > 0 && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Pontuação: {game.score}</span>
                    </div>
                  )}
                  {game.correctAnswers > 0 && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>
                        Acertos: {game.correctAnswers}/{game.correctAnswers + game.incorrectAnswers}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhuma partida encontrada</p>
          <Button className="mt-4" onClick={handleCreateGame}>
            <Plus className="h-4 w-4 mr-2" />
            Criar primeira partida
          </Button>
        </div>
      )}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Partida</DialogTitle>
          </DialogHeader>
          {selectedGame && <GameView game={selectedGame} userName={getUserName(selectedGame.userId)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
