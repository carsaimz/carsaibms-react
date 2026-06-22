# Carsai BMS — React/Node.js Rewrite

Portal do Cliente PWA instalável, construído com React + Vite + Express + MySQL.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Base de dados | MySQL / MariaDB |
| Auth | JWT (access 15min + refresh httpOnly 30 dias) |
| Estado | TanStack Query + Zustand |
| Offline | Dexie (IndexedDB) + Background Sync |
| PWA | vite-plugin-pwa + Workbox |
| PDF | jsPDF (gerado no cliente) |

## Começar

```bash
# 1. Instalar dependências
cd server && npm install
cd ../client && npm install

# 2. Configurar ambiente
cp server/.env.example server/.env
# Editar server/.env com credenciais da BD

# 3. Criar base de dados e tabelas
cd server && npm run db:migrate

# 4. Iniciar (terminal 1 — backend)
cd server && npm run dev

# 5. Iniciar (terminal 2 — frontend)
cd client && npm run dev
```

## Credenciais demo

| Conta | Email | Senha |
|---|---|---|
| Admin | admin@carsai.co.mz | password |
| Cliente | cliente@carsai.co.mz | password |

## URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/api/health

## Estrutura

```
carsai-react/
├── server/          # API REST (Express + TypeScript)
│   └── src/
│       ├── db/      # Conexão MySQL + schema + migrations
│       ├── middleware/ # Auth JWT + error handler
│       ├── routes/  # auth, customer, payments, public
│       └── utils/   # JWT, money, email
├── client/          # PWA React (Vite + TypeScript)
│   └── src/
│       ├── components/ # UI kit + shared components
│       ├── hooks/   # useOnlineStatus, useNotifications, useFlushQueue
│       ├── layouts/ # AuthLayout, CustomerLayout
│       ├── lib/     # API client, offline DB, format, invoice
│       ├── pages/   # auth/, customer/
│       └── store/   # Zustand: auth
└── ROADMAP.md       # Roteiro completo por fases
```

## Fases

- **Fase 1 ✅** — Portal do Cliente (pedidos, facturas, tickets, perfil, notificações, pagamentos)
- **Fase 2** — Site Público + Loja (catálogo, blog, contacto, checkout)
- **Fase 3** — Painel Admin (dashboard, produtos, relatórios, gestão)
- **Fase 4** — Staff + POS (tarefas, caixa, recibos térmicos, offline)
- **Fase 5** — Extras avançados (push notifications, WebSockets, command palette)

## PWA

A app é instalável em Android, iOS 16.4+, Windows e macOS.
Em mobile, toque em "Adicionar ao ecrã inicial".
Funciona offline com cache de pedidos e facturas (IndexedDB).
