"use client"

import { useState, useEffect } from "react"
import { Trophy, TrendingUp, BarChart3, Users, Award, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { userApi, type User } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Legend, Tooltip } from "recharts"
import { motion } from "framer-motion"

// Interface para dados de desempenho do aluno
interface StudentPerformance {
  name: string
  totalScore: number
  correctAnswers: number
  incorrectAnswers: number
  totalQuestions: number
  accuracy: number // Porcentagem de acertos
}

export default function MetricsPage() {
  const [students, setStudents] = useState<StudentPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadStudentsData()
  }, [])

  /**
   * Carrega os dados dos alunos e calcula métricas de desempenho
   */
  const loadStudentsData = async () => {
    try {
      setLoading(true)
      const response = await userApi.getAll({ pageSize: 100 })

      if (response.data && Array.isArray(response.data.items)) {
        // Filtra apenas alunos (role: 2) e calcula métricas mockadas
        const studentsData = response.data.items
          .filter((user: User) => user.role === 2 && user.status === 1)
          .map((user: User, index: number) => {
            const totalScore = user.totalScore || 0
            
            // Mocka dados de acertos/erros baseado na pontuação
            // Lógica: Assumindo que cada acerto vale 10 pontos e cada erro não dá pontos
            // Para criar variação realista, usamos um algoritmo baseado no índice e pontuação
            
            // Estima número de questões (entre 10 e 30, baseado na pontuação)
            const baseQuestions = Math.max(10, Math.min(30, Math.floor(totalScore / 10) + 10 + (index % 10)))
            
            // Estima taxa de acerto baseada na pontuação (alunos com mais pontos têm melhor desempenho)
            // Pontuação alta = alta taxa de acerto, pontuação baixa = baixa taxa de acerto
            const scoreRatio = totalScore > 0 ? Math.min(1, totalScore / 300) : 0.3 // Normaliza para 0-1
            const baseAccuracy = 0.4 + (scoreRatio * 0.5) // Entre 40% e 90%
            
            // Adiciona variação aleatória pequena (±5%)
            const accuracyVariation = (Math.random() - 0.5) * 0.1
            const finalAccuracy = Math.max(0.1, Math.min(0.95, baseAccuracy + accuracyVariation))
            
            // Calcula acertos e erros
            const correctAnswers = Math.round(baseQuestions * finalAccuracy)
            const incorrectAnswers = baseQuestions - correctAnswers
            const accuracy = finalAccuracy * 100

            return {
              name: user.name || "Aluno sem nome",
              totalScore,
              correctAnswers,
              incorrectAnswers,
              totalQuestions: baseQuestions,
              accuracy: Math.round(accuracy),
            }
          })
          .sort((a, b) => b.totalScore - a.totalScore) // Ordena por pontuação

        setStudents(studentsData)
      }
    } catch (error) {
      console.error("Error loading students data:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar dados dos alunos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Dados para o gráfico de barras horizontais (Acertos vs Erros)
  const chartData = students.map((student) => ({
    name: student.name,
    Acertos: student.correctAnswers,
    Erros: student.incorrectAnswers,
  }))

  // Dados para o gráfico de ranking (Top 10)
  const topStudents = students.slice(0, 10).map((student) => ({
    name: student.name.length > 15 ? student.name.substring(0, 15) + "..." : student.name,
    Pontuação: student.totalScore,
  }))

  // Dados para o gráfico de pizza (Distribuição de desempenho)
  const performanceDistribution = [
    {
      name: "Excelente (90-100%)",
      value: students.filter((s) => s.accuracy >= 90).length,
      color: "#22c55e", // green-500
    },
    {
      name: "Bom (70-89%)",
      value: students.filter((s) => s.accuracy >= 70 && s.accuracy < 90).length,
      color: "#3b82f6", // blue-500
    },
    {
      name: "Regular (50-69%)",
      value: students.filter((s) => s.accuracy >= 50 && s.accuracy < 70).length,
      color: "#f59e0b", // amber-500
    },
    {
      name: "Precisa Melhorar (<50%)",
      value: students.filter((s) => s.accuracy < 50).length,
      color: "#ef4444", // red-500
    },
  ].filter((item) => item.value > 0)

  // Estatísticas gerais
  const totalStudents = students.length
  const averageScore = totalStudents > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.totalScore, 0) / totalStudents)
    : 0
  const averageAccuracy = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + s.accuracy, 0) / totalStudents)
    : 0
  const totalQuestions = students.reduce((sum, s) => sum + s.totalQuestions, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando métricas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-purple-600" />
          Métricas de Desempenho
        </h1>
        <p className="text-gray-600 mt-2">Análise detalhada do desempenho dos alunos</p>
      </div>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalStudents}</div>
              <p className="text-xs text-blue-600 mt-1">Alunos ativos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Pontuação Média</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{averageScore}</div>
              <p className="text-xs text-green-600 mt-1">Pontos por aluno</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Taxa de Acerto</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{averageAccuracy}%</div>
              <p className="text-xs text-purple-600 mt-1">Média de acertos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Total de Questões</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{totalQuestions}</div>
              <p className="text-xs text-amber-600 mt-1">Questões respondidas</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráfico 1: Barras Horizontais - Acertos vs Erros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Quantidade de Questões por Aluno
            </CardTitle>
            <CardDescription>
              Comparação entre acertos e erros de cada aluno
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="Acertos" fill="#22c55e" name="Acertos" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Erros" fill="#f97316" name="Erros" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráficos 2 e 3 lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 2: Ranking de Pontuação (Top 10) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Top 10 Alunos - Ranking de Pontuação
              </CardTitle>
              <CardDescription>
                Os alunos com maior pontuação total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStudents} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar dataKey="Pontuação" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                      {topStudents.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            index === 0 ? "#fbbf24" : // Ouro para 1º
                            index === 1 ? "#94a3b8" : // Prata para 2º
                            index === 2 ? "#cd7f32" : // Bronze para 3º
                            "#8b5cf6" // Roxo para os demais
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico 3: Distribuição de Desempenho (Pizza) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Distribuição de Desempenho
              </CardTitle>
              <CardDescription>
                Classificação dos alunos por taxa de acerto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

