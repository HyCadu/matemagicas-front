import axios from "axios"

const API_BASE_URL = "/api"  // Usando o proxy local

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
})

// Add response interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.config.url, response.status, response.data)
    return response
  },
  (error) => {
    console.error("API Error Details:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    return Promise.reject(error)
  },
)

// Updated Types based on Swagger documentation with null safety
export interface User {
  id: string
  name: string
  dateOfBirth: string
  email: string
  password: string
  totalScore: number
  role: number
  status: number
  gameHistory: number[] | null
}

export interface Question {
  id: string
  userId: string
  questionText: string
  answerOptions: string[]
  correctAnswerIndex: number
  difficulty: number
  topic: number
  status: number
}

export interface Game {
  id: string
  userId: string
  date: string
  score: number
  correctAnswers: number
  incorrectAnswers: number
  questionsIds: string[] | null
  topics: number[]
  difficulty: number
}

export interface PagedResult<T> {
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
  items: T[]
}

export interface CreateUserRequest {
  name: string
  dateOfBirth: string
  email: string
  password: string
  role: number
}

export interface UpdateUserRequest {
  name?: string
  dateOfBirth?: string
  email?: string
  password?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateQuestionRequest {
  userId: string
  questionText: string
  answersOptions: string[]
  correctAnswerIndex: number
  difficulty: number
  topic: number
}

export interface UpdateQuestionRequest {
  questionText?: string
  answersOptions?: string[]
  correctAnswerIndex?: number
  difficulty?: number
  topic?: number
}

export interface CreateGameRequest {
  userId: string
  topics: number[]
  difficulty: number
}

export interface UpdateGameRequest {
  score?: number
  correctAnswers?: number
  incorrectAnswers?: number
  topics?: number[]
  difficulty?: number
}

// API Functions with better error handling
export const userApi = {
  getAll: async (params?: {
    Name?: string
    DateOfBirth?: string
    "Email.Value"?: string
    "Password.Value"?: string
    TotalScore?: number
    Role?: number
    Status?: number
    pageNumber?: number
    pageSize?: number
  }) => {
    try {
      return await api.get<PagedResult<User>>("/users", { params })
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },
  getById: async (id: string) => {
    try {
      return await api.get<User>(`/users/${id}`)
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },
  create: async (data: CreateUserRequest) => {
    try {
      console.log("Creating user with data:", data)
      return await api.post<User>("/users", data)
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  },
  update: async (id: string, data: UpdateUserRequest) => {
    try {
      console.log(`Updating user ${id} with data:`, data)
      return await api.put<User>(`/users/${id}`, data)
    } catch (error) {
      console.error(`Error updating user ${id}:`, error)
      throw error
    }
  },
  delete: async (id: string) => {
    try {
      return await api.delete(`/users/${id}`)
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  },
  inactivate: async (id: string) => {
    try {
      return await api.put(`/users/${id}/inactivate`)
    } catch (error) {
      console.error(`Error inactivating user ${id}:`, error)
      throw error
    }
  },
  login: async (data: LoginRequest) => {
    try {
      return await api.post("/users/login", data)
    } catch (error) {
      console.error("Error logging in:", error)
      throw error
    }
  },
}

export const questionApi = {
  getAll: async (params?: {
    UserId?: string
    QuestionText?: string
    AnswerOptions?: string[]
    CorrectAnswerIndex?: number
    Difficulty?: number
    Topic?: number
    Status?: number
    pageNumber?: number
    pageSize?: number
  }) => {
    try {
      return await api.get<PagedResult<Question>>("/questions", { params })
    } catch (error) {
      console.error("Error fetching questions:", error)
      throw error
    }
  },
  getById: async (id: string) => {
    try {
      return await api.get<Question>(`/questions/${id}`)
    } catch (error) {
      console.error(`Error fetching question ${id}:`, error)
      throw error
    }
  },
  create: async (data: CreateQuestionRequest) => {
    try {
      return await api.post<Question>("/questions", data)
    } catch (error) {
      console.error("Error creating question:", error)
      throw error
    }
  },
  update: async (id: string, data: UpdateQuestionRequest) => {
    try {
      return await api.put<Question>(`/questions/${id}`, data)
    } catch (error) {
      console.error(`Error updating question ${id}:`, error)
      throw error
    }
  },
  delete: async (id: string) => {
    try {
      return await api.delete(`/questions/${id}`)
    } catch (error) {
      console.error(`Error deleting question ${id}:`, error)
      throw error
    }
  },
}

export const gameApi = {
  getAll: async (params?: {
    UserId?: string
    Date?: string
    Score?: number
    CorrectAnswers?: number
    IncorrectAnswers?: number
    QuestionsIds?: string[]
    Topics?: number[]
    pageNumber?: number
    pageSize?: number
  }) => {
    try {
      return await api.get<PagedResult<Game>>("/games", { params })
    } catch (error) {
      console.error("Error fetching games:", error)
      throw error
    }
  },
  getById: async (id: string) => {
    try {
      return await api.get<Game>(`/games/${id}`)
    } catch (error) {
      console.error(`Error fetching game ${id}:`, error)
      throw error
    }
  },
  create: async (data: CreateGameRequest) => {
    try {
      return await api.post<Game>("/games", data)
    } catch (error) {
      console.error("Error creating game:", error)
      throw error
    }
  },
  update: async (id: string, data: UpdateGameRequest) => {
    try {
      return await api.put<Game>(`/games/${id}`, data)
    } catch (error) {
      console.error(`Error updating game ${id}:`, error)
      throw error
    }
  },
}

// Test API connectivity
export const testApiConnection = async () => {
  try {
    console.log("Testing API connection...")
    const response = await fetch(`${API_BASE_URL}/users?pageSize=1`)
    console.log("API connection test result:", response.status, response.statusText)
    return response.ok
  } catch (error) {
    console.error("API connection test failed:", error)
    return false
  }
}

// Helper functions for enum conversions
export const difficultyOptions = [
  { value: 0, label: "Fácil" },
  { value: 1, label: "Médio" },
  { value: 2, label: "Difícil" },
]

export const topicOptions = [
  { value: 1, label: "Adição" },
  { value: 2, label: "Subtração" },
  { value: 3, label: "Multiplicação" },
  { value: 4, label: "Divisão" },

]

export const statusOptions = [
  { value: 1, label: "Ativo" },
  { value: 0, label: "Inativo" },
]

export const roleOptions = [
  { value: 1, label: "Professor" },
  { value: 2, label: "Aluno" },
]

export const getDifficultyLabel = (difficulty: number): string => {
  switch (difficulty) {
    case 0:
      return "Fácil"
    case 1:
      return "Médio"
    case 2:
      return "Difícil"
    default:
      return "Desconhecido"
  }
}

export const getTopicLabel = (topic: number): string => {
  switch (topic) {
    case 1:
      return "Adição"
    case 2:
      return "Subtração"
    case 3:
      return "Multiplicação"
    case 4:
      return "Divisão"
    default:
      return "Desconhecido"
  }
}

export const getStatusLabel = (status: number): string => {
  return statusOptions.find((s) => s.value === status)?.label || "Desconhecido"
}

export const getRoleLabel = (role: number): string => {
  return roleOptions.find((r) => r.value === role)?.label || "Desconhecido"
}

// Função utilitária para obter usuário logado do localStorage
export function getLoggedUser() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("matemagicas:user")
    return user ? JSON.parse(user) : null
  }
  return null
}
