# 🎮 Jogo da Velha Online - Monorepo

Jogo da velha multiplayer em tempo real usando Next.js, Express e Ably.

## 🏗️ Arquitetura

Este projeto segue uma arquitetura **autoritativa** onde:

- ✅ **Backend** é a fonte única da verdade
- ✅ **Clientes** apenas enviam jogadas e recebem atualizações
- ✅ **Estado** é mantido em memória no servidor
- ✅ **Realtime** via Ably para sincronização instantânea

## 📁 Estrutura do Monorepo

```
jogo-da-velha-1v1/
├── frontend/           # Next.js App Router + TailwindCSS
│   ├── src/
│   │   ├── app/       # Páginas e rotas
│   │   └── lib/       # Tipos compartilhados
│   ├── Dockerfile
│   └── package.json
│
├── backend/           # Express + TypeScript
│   ├── src/
│   │   ├── lib/      # Lógica do jogo + Store + Ably
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Conta no [Ably](https://ably.com) (gratuita)

### 1️⃣ Configurar variáveis de ambiente

Copie os arquivos `.env.example` e renomeie para `.env`:

```bash
# Na raiz do projeto
cp .env.example .env

# No frontend
cp frontend/.env.example frontend/.env

# No backend
cp backend/.env.example backend/.env
```

Edite os arquivos `.env` e adicione suas chaves do Ably:

```env
ABLY_API_KEY=sua_chave_api_aqui
NEXT_PUBLIC_ABLY_KEY=sua_chave_publica_aqui
```

### 2️⃣ Com Docker

#### Modo Desenvolvimento (com hot-reload ♻️)

```bash
# Iniciar em modo desenvolvimento com atualização automática
npm run docker:dev

# ou
docker-compose -f docker-compose.dev.yml up --build

# Parar
npm run docker:dev:down
```

**Vantagens do modo dev:**
- ✅ Atualização automática ao salvar arquivos
- ✅ Logs em tempo real
- ✅ Ideal para desenvolvimento

#### Modo Produção

```bash
# Iniciar em modo produção (otimizado)
npm run docker:prod

# ou
docker-compose up --build

# Parar
npm run docker:prod:down
```

**Acesso:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### 3️⃣ Desenvolvimento Local (sem Docker)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Como Usar

1. Acesse http://localhost:3000
2. Clique em "Criar partida"
3. Compartilhe a URL com outro jogador
4. Joguem em tempo real! 🎉

## 🧩 Stack Tecnológica

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **Ably** (WebSocket client)

### Backend
- **Node.js + Express**
- **TypeScript**
- **Ably REST** (publicação de eventos)
- **UUID** (geração de IDs)

### DevOps
- **Docker** (containerização)
- **Docker Compose** (orquestração)

## 📡 Fluxo de Dados

```
Cliente A                Backend                 Cliente B
   │                       │                        │
   ├─ POST /api/move ────►│                        │
   │                       ├─ Valida jogada        │
   │                       ├─ Atualiza estado      │
   │                       ├─ Publica via Ably ───►│
   │◄──────────────────────┤                        │
   │     (atualização via WebSocket)                │
```

## 🔒 Regras de Negócio

- ✅ Apenas o servidor calcula o estado do jogo
- ✅ Clientes não podem manipular o tabuleiro diretamente
- ✅ Todas as jogadas são validadas no backend
- ✅ Estado é sincronizado em tempo real via Ably

## 🛠️ Próximas Melhorias

- ✅ Identificar jogadores (X vs O)
- ✅ Impedir 3º jogador na mesma partida
- ✅ Sistema de lobby
- [x] Chat em tempo real
- [ ] Persistência com Redis
- [ ] Expiração automática de partidas
- [ ] Ranking de jogadores

## 📝 Licença

MIT

---
