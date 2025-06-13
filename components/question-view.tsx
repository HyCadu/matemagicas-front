"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import type { Question } from "@/lib/api"
import { getDifficultyLabel, getTopicLabel, getStatusLabel } from "@/lib/api"

interface QuestionViewProps {
  question: Question
}

export function QuestionView({ question }: QuestionViewProps) {
  return (
    <div className="space-y-6">
      <Card className="h-full">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{getDifficultyLabel(question.difficulty)}</Badge>
            <Badge variant="outline">{getTopicLabel(question.topic)}</Badge>
            <Badge variant={question.status === 0 ? "default" : "secondary"}>{getStatusLabel(question.status)}</Badge>
          </div>
          <CardTitle className="text-lg break-words">{question.questionText}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Opções de Resposta:</h4>
            <div className="grid gap-2">
              {question.answerOptions.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    index === question.correctAnswerIndex
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="font-medium text-gray-600 min-w-[1.5rem]">{String.fromCharCode(65 + index)}.</span>
                  <span className="flex-1 break-words">{option}</span>
                  {index === question.correctAnswerIndex && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t text-sm text-gray-600 space-y-1">
            <p>Criada por: {question.userId}</p>
            <p>ID: {question.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
