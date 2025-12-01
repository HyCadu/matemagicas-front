"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, Trophy, Target } from "lucide-react"
import type { Game } from "@/lib/api"
import { getDifficultyLabel, topicOptions } from "@/lib/api"

interface GameViewProps {
  game: Game
  userName: string
}

export function GameView({ game, userName }: GameViewProps) {
  const getStatusLabel = () => {
    if (game.score > 0 || game.correctAnswers > 0 || game.incorrectAnswers > 0) {
      return { label: "Finalizada", color: "bg-green-100 text-green-800" }
    }
    return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" }
  }

  const getTopicLabel = (topicValue: number) => {
    return topicOptions.find((t) => t.value === topicValue)?.label || `Tópico ${topicValue}`
  }

  const getPercentage = () => {
    const total = game.correctAnswers + game.incorrectAnswers
    if (total > 0) {
      return Math.round((game.correctAnswers / total) * 100)
    }
    return null
  }

  const status = getStatusLabel()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex gap-2 mb-3">
            <Badge className={status.color}>{status.label}</Badge>
            <Badge variant="outline">{getDifficultyLabel(game.difficulty)}</Badge>
          </div>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {userName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tópicos:</h4>
            <div className="flex flex-wrap gap-2">
              {game.topics.map((topic, index) => (
                <Badge key={index} variant="outline">
                  {getTopicLabel(topic)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span>Data: {new Date(game.date).toLocaleString("pt-BR")}</span>
            </div>

            {game.questionsIds && game.questionsIds.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-gray-600" />
                <span>Perguntas: {game.questionsIds.length}</span>
              </div>
            )}
          </div>

          {(game.score > 0 || game.correctAnswers > 0 || game.incorrectAnswers > 0) && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Resultados:</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {game.score > 0 && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium">Pontuação</div>
                      <div className="text-2xl font-bold text-yellow-600">{game.score}</div>
                    </div>
                  </div>
                )}

                {game.correctAnswers > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Acertos</div>
                        <div className="text-2xl font-bold text-green-600">
                          {game.correctAnswers}/{game.correctAnswers + game.incorrectAnswers}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Aproveitamento</div>
                        <div className="text-2xl font-bold text-blue-600">{getPercentage()}%</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
