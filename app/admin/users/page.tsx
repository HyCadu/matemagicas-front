"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, UserX, LogIn, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { userApi, type User, getStatusLabel, getRoleLabel, testApiConnection } from "@/lib/api"
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
   * Retorna o número de partidas jogadas pelo usuário
   * Trata casos onde o histórico pode ser nulo ou indefinido
   * @param gameHistory - Array de números representando o histórico de jogos
   * @returns Número de partidas jogadas
   */
  const getGameHistoryCount = (gameHistory: number[] | null | undefined): number => {
    return Array.isArray(gameHistory) ? gameHistory.length : 0
  }

  /**
   * Formata uma data para o padrão brasileiro
   * Trata casos onde a data pode ser nula ou inválida
   * @param dateString - String da data a ser formatada
   * @returns Data formatada ou mensagem de erro
   */
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Data não disponível"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR")
    } catch {
      return "Data inválida"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.isArray(users) &&
          users.length > 0 &&
          users.map((user) => (
            <Card key={user.id} className="h-full">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2">
                      <span className="break-all">{user.name || "Nome não disponível"}</span>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={user.status === 0 ? "default" : "secondary"} className="text-xs">
                          {getStatusLabel(user.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm break-all">
                      {user.email || "Email não disponível"}
                    </CardDescription>
                  </div>
                  {/* Botões de ação do usuário */}
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      disabled={apiConnected === false}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* Botão de inativação */}
                    {user.status === 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={apiConnected === false} className="h-8 w-8 p-0">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[95vw] sm:w-[400px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Inativar usuário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja inativar este usuário?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleInactivateUser(user.id)}>
                              Inativar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Botão de exclusão */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={apiConnected === false} className="h-8 w-8 p-0">
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
              </CardHeader>
              {/* Conteúdo do card com informações do usuário */}
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="space-y-1">
                    <p>Data de Nascimento: {formatDate(user.dateOfBirth)}</p>
                    <p>Pontuação Total: {user.totalScore || 0}</p>
                  </div>
                  <div className="space-y-1 break-words">
                    <p>Partidas Jogadas: {getGameHistoryCount(user.gameHistory)}</p>
                    <p>ID: {user.id || "ID não disponível"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
