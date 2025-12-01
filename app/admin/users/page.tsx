"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, UserX, LogIn, AlertCircle, Mail, Calendar, Trophy, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { userApi, type User, getStatusLabel, getRoleLabel, testApiConnection } from "@/lib/api"
import { motion } from "framer-motion"
import { UserForm } from "@/components/user-form"
import { LoginForm } from "@/components/login-form"
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkApiConnection()
    loadUsers()
  }, [])

  /**
   * Verifica a conexão com a API e atualiza o estado de conexão
   * Exibe um toast de aviso caso haja problemas de conectividade
   */
  const checkApiConnection = async () => {
    const connected = await testApiConnection()
    setApiConnected(connected)
    if (!connected) {
      toast({
        title: "Aviso",
        description: "Problemas de conectividade com a API detectados",
        variant: "destructive",
      })
    }
  }

  /**
   * Carrega a lista de usuários da API
   * Atualiza o estado de conexão e exibe mensagens de erro apropriadas
   * em caso de falha na requisição
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getAll({ pageSize: 100 })

      if (response.data && Array.isArray(response.data.items)) {
        setUsers(response.data.items)
        setApiConnected(true)
      } else {
        console.error("API response is not in expected format:", response.data)
        setUsers([])
        toast({
          title: "Aviso",
          description: "Formato de resposta inesperado da API",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error loading users:", error)
      setUsers([])
      setApiConnected(false)

      let errorMessage = "Falha ao carregar usuários"
      if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
        errorMessage = "Erro de rede: Verifique sua conexão com a internet"
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Prepara o formulário para criar um novo usuário
   * Limpa o usuário selecionado e abre o modal de formulário
   */
  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  /**
   * Prepara o formulário para editar um usuário existente
   * Define o usuário selecionado e abre o modal de formulário
   * @param user - Usuário a ser editado
   */
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  /**
   * Remove um usuário do sistema
   * Exibe mensagens de sucesso ou erro após a operação
   * @param id - ID do usuário a ser deletado
   */
  const handleDeleteUser = async (id: string) => {
    try {
      await userApi.delete(id)
      toast({
        title: "Sucesso",
        description: "Usuário deletado com sucesso",
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao deletar usuário",
        variant: "destructive",
      })
    }
  }

  /**
   * Inativa um usuário no sistema
   * Exibe mensagens de sucesso ou erro após a operação
   * @param id - ID do usuário a ser inativado
   */
  const handleInactivateUser = async (id: string) => {
    try {
      await userApi.inactivate(id)
      toast({
        title: "Sucesso",
        description: "Usuário inativado com sucesso",
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao inativar usuário",
        variant: "destructive",
      })
    }
  }

  /**
   * Callback executado após sucesso na operação do formulário
   * Fecha o modal e recarrega a lista de usuários
   */
  const handleFormSuccess = () => {
    setIsFormOpen(false)
    loadUsers()
  }

  /**
   * Formata uma data para o padrão brasileiro
   * Trata casos onde a data pode ser nula ou inválida
   * @param dateString - String da data a ser formatada
   * @returns Data formatada ou mensagem de erro
   */
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Não informada"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR")
    } catch {
      return "Inválida"
    }
  }

  /**
   * Obtém as iniciais do nome do usuário para o avatar
   * @param name - Nome do usuário
   * @returns Iniciais (máximo 2 caracteres)
   */
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "??"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  /**
   * Obtém a cor do gradiente baseado no role do usuário
   * @param role - Role do usuário
   * @returns Classes CSS para gradiente
   */
  const getRoleGradient = (role: number): string => {
    switch (role) {
      case 1: // Professor
        return "from-purple-500 to-pink-500"
      case 2: // Aluno
        return "from-blue-500 to-cyan-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando usuários...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Alerta de problemas de conexão */}
      {apiConnected === false && (
        <Alert className="mb-4 sm:mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span>Problemas de conectividade com a API. Algumas funcionalidades podem não estar disponíveis.</span>
            <Button variant="outline" size="sm" onClick={checkApiConnection}>
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Gerencie os usuários da plataforma</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Botão e modal de novo usuário */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateUser} disabled={apiConnected === false} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                <DialogDescription>
                  {selectedUser ? "Edite as informações do usuário" : "Preencha os dados para criar um novo usuário"}
                </DialogDescription>
              </DialogHeader>
              <UserForm user={selectedUser} onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid de cards de usuários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.isArray(users) &&
          users.length > 0 &&
          users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50">
                {/* Header com gradiente */}
                <div className={`bg-gradient-to-r ${getRoleGradient(user.role)} p-4 sm:p-6`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white text-lg sm:text-xl font-bold truncate">
                          {user.name || "Nome não disponível"}
                        </CardTitle>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <Badge 
                            variant={user.status === 0 ? "secondary" : "default"} 
                            className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
                          >
                            {getStatusLabel(user.status)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-white/10 text-white border-white/30 hover:bg-white/20"
                          >
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {/* Botões de ação */}
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        disabled={apiConnected === false}
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={apiConnected === false} 
                            className="h-8 w-8 p-0 text-white hover:bg-white/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[95vw] sm:w-[400px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar usuário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O usuário será permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
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
                    {/* Email */}
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <span className="text-gray-700 truncate">{user.email || "Email não disponível"}</span>
                    </div>

                    {/* Data de Nascimento */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700">
                        <span className="text-gray-500">Nascimento:</span> {formatDate(user.dateOfBirth)}
                      </span>
                    </div>

                    {/* Pontuação Total */}
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">
                        <span className="text-gray-500">Pontuação:</span>{" "}
                        <span className="font-bold text-yellow-600">{user.totalScore || 0} pontos</span>
                      </span>
                    </div>

                    {/* ID (menos proeminente) */}
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-400 font-mono truncate" title={user.id}>
                        ID: {user.id || "ID não disponível"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

        {/* Mensagem quando não há usuários */}
        {(!Array.isArray(users) || users.length === 0) && !loading && (
          <div className="col-span-full text-center py-8 sm:py-12">
            <p className="text-sm sm:text-lg text-gray-500">
              {apiConnected === false ? "Não foi possível carregar usuários" : "Nenhum usuário encontrado"}
            </p>
            {apiConnected !== false && (
              <Button className="mt-4" onClick={handleCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro usuário
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
