# Matemágicas - Plataforma de Jogos Matemáticos

## 📋 Visão Geral
Matemágicas é uma plataforma educacional focada em jogos matemáticos, desenvolvida para auxiliar no aprendizado de matemática de forma interativa e divertida.

## 🎮 Áreas do Sistema

### 1. Área Administrativa (`/admin`)

#### 1.1 Gerenciamento de Usuários (`/admin/users`)
- **Funcionalidades:**
  - Listagem de usuários com status e perfil
  - Criação de novos usuários
  - Edição de dados de usuários
  - Inativação de usuários
  - Visualização de estatísticas (pontuação total, partidas jogadas)
  - Filtros por status e perfil

#### 1.2 Gerenciamento de Perguntas (`/admin/questions`)
- **Funcionalidades:**
  - CRUD completo de perguntas
  - Categorização por tópicos:
    - 1: Adição
    - 2: Subtração
    - 3: Multiplicação
    - 4: Divisão
  - Níveis de dificuldade:
    - 1: Fácil
    - 2: Médio
    - 3: Difícil
  - Sistema de múltipla escolha com ou mais opções
  - Visualização detalhada de perguntas
  - Filtros por tópico e dificuldade

#### 1.3 Gerenciamento de Partidas (`/admin/games`)
- **Funcionalidades:**
  - Criação de partidas personalizadas
  - Acompanhamento de resultados
  - Estatísticas de desempenho
  - Filtros por:
    - Usuário
    - Data
    - Tópicos
    - Dificuldade

### 2. Área de Jogos (`/play`)

#### 2.1 Jogos Matemáticos
- **Tipos de Operações:**
  - Adição
  - Subtração
  - Multiplicação
  - Divisão
- **Níveis de Dificuldade:**
  - Fácil: Operações básicas
  - Médio: Operações intermediárias
  - Difícil: Operações complexas

#### 2.2 Sistema de Pontuação
- Pontuação baseada em:
  - Acertos
  - Tempo de resposta
  - Dificuldade da questão
- Ranking de jogadores
- Histórico de partidas

## 🛠️ Tecnologias Utilizadas

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui (Componentes)
- Lucide Icons


## 📦 Estrutura do Projeto

```
matemagicas-frontend/
├── app/
│   ├── admin/
│   │   ├── users/      # Gerenciamento de usuários
│   │   ├── questions/  # Gerenciamento de perguntas
│   │   └── games/      # Gerenciamento de partidas
│   └── play/           # Área de jogos
├── components/
│   ├── ui/            # Componentes base
│   ├── question-form/ # Formulários de perguntas
│   ├── game-form/     # Formulários de jogos
│   └── user-form/     # Formulários de usuários
└── lib/
    └── api.ts         # Integração com API
```

## 🔐 Níveis de Acesso

### Administrador
- Acesso total ao sistema
- Gerenciamento de usuários
- Criação e edição de perguntas
- Monitoramento de partidas

### Professor
- Criação de perguntas
- Acompanhamento de desempenho dos alunos
- Geração de relatórios

### Aluno
- Acesso aos jogos
- Visualização de seu próprio desempenho
- Histórico de partidas

## 🎯 Funcionalidades Principais

### Sistema de Perguntas
- Banco de questões categorizado
- Diferentes níveis de dificuldade
- Sistema de múltipla escolha
- Validação de respostas

### Sistema de Partidas
- Partidas personalizadas
- Diferentes modos de jogo
- Sistema de pontuação
- Histórico de desempenho

### Sistema de Usuários
- Perfis personalizados
- Níveis de acesso
- Estatísticas individuais
- Histórico de atividades

## 📊 Métricas e Estatísticas

### Usuários
- Total de partidas
- Pontuação média


### Partidas
- Duração média
- Pontuação média
- Distribuição por tópico
- Tendências de desempenho

## 🔄 Fluxo de Jogo

1. **Seleção de Modo**
   - Escolha de tópicos
   - Seleção de dificuldade
   - Configuração de tempo

2. **Execução**
   - Apresentação de questões
   - Registro de respostas
   - Cálculo de pontuação

3. **Resultados**
   - Exibição de desempenho
   - Análise de erros
   - Sugestões de melhoria

## 📱 Responsividade
- Design adaptativo
- Interface otimizada para:
  - Desktop
  - Tablet
  - Mobile

## 🔒 Segurança
- Autenticação JWT
- Validação de dados
- Proteção de rotas
- Sanitização de inputs