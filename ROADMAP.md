# Carsai BMS — Reescrita em React (Projecto Independente)

> Reescrita completa, 100% independente do código PHP. Backend próprio em
> Node.js/Express + MySQL, frontend React + Vite + PWA. Projecto de longo
> prazo — este documento é o roteiro de continuidade entre sessões.

---

## 🏗️ Arquitectura

```
carsai-react/
├── server/                 # API REST própria (Node.js + Express)
│   ├── src/
│   │   ├── db/              # Conexão MySQL + schema + migrations
│   │   ├── middleware/      # Auth (JWT), error handler, validation
│   │   ├── routes/          # Endpoints por área (auth, customer, admin...)
│   │   ├── utils/            # Helpers (money, dates, pdf, email)
│   │   └── index.ts          # Entry point
│   └── package.json
│
├── client/                  # PWA React
│   ├── src/
│   │   ├── pages/            # Páginas por área (customer/, admin/, ...)
│   │   ├── layouts/           # Layouts (CustomerLayout, AuthLayout...)
│   │   ├── components/        # Componentes reutilizáveis (UI kit)
│   │   ├── lib/                # API client, offline cache (Dexie/IndexedDB)
│   │   ├── hooks/               # Hooks customizados
│   │   └── store/                # Estado global (Zustand)
│   ├── public/                    # manifest.json, ícones PWA
│   └── package.json
│
└── ROADMAP.md               # Este ficheiro
```

### Stack escolhida
| Camada | Tecnologia | Porquê |
|---|---|---|
| Backend | Node.js + Express + TypeScript | API REST própria, sem dependência PHP |
| BD | MySQL (mysql2) | Reaproveita conhecimento do esquema original, mas tabelas novas |
| Auth | JWT (access + refresh tokens) | Stateless, ideal para PWA offline |
| Frontend | React 18 + Vite + TypeScript | Build rápido, HMR, ecossistema maduro |
| Estilos | Tailwind CSS | Consistência visual rápida |
| Routing | React Router v6 | Padrão de mercado |
| Estado servidor | TanStack Query | Cache, refetch, optimistic updates |
| Estado local | Zustand | Simples, leve |
| PWA | vite-plugin-pwa + Workbox | Offline, instalável, cache de assets/API |
| Offline DB | Dexie (IndexedDB) | Cache local de pedidos/facturas para uso offline |
| Gráficos | Recharts | Dashboards |
| PDF | jsPDF + autotable | Facturas/recibos no cliente (sem servidor) |

---

## 🗺️ Roteiro de Desenvolvimento

### ✅ Fase 1 — Fundação + Portal do Cliente (EM CURSO)
- [x] Scaffold do monorepo
- [x] Backend: servidor Express, conexão MySQL, schema inicial
- [x] Backend: autenticação JWT (registo, login, refresh, perfil)
- [x] Backend: rotas do cliente (pedidos, facturas, pagamentos, tickets, perfil)
- [x] Frontend: scaffold Vite + React + Tailwind + PWA
- [x] Frontend: autenticação (login/registo/logout, guarda de rotas)
- [x] Frontend: layout do cliente (sidebar, topbar, navegação mobile)
- [x] Frontend: Dashboard do cliente (resumo, últimos pedidos, notificações)
- [x] Frontend: Lista + detalhe de pedidos
- [x] Frontend: Facturas (visualização + download PDF client-side)
- [x] Frontend: Pagamentos (iniciar pagamento M-Pesa/PayPal/Stripe — endpoints preparados)
- [x] Frontend: Tickets de suporte (lista, criar, conversação)
- [x] Frontend: Perfil (editar dados, alterar senha)
- [x] PWA: manifest, service worker, cache offline de catálogo e pedidos
- [x] PWA: indicador online/offline, sincronização ao reconectar

### 🔜 Fase 2 — Site Público + Loja
- [ ] Backend: rotas públicas (produtos, serviços, blog, contacto)
- [ ] Backend: carrinho + checkout + criação de pedidos
- [ ] Frontend: páginas públicas (Home, Produtos, Serviços, Blog, Contacto)
- [ ] Frontend: carrinho + checkout
- [ ] SEO: SSR ou pré-renderização (Vite SSG / Astro híbrido a considerar)

### 🔜 Fase 3 — Painel Admin
- [ ] Backend: rotas admin (CRUD produtos/serviços/pedidos/clientes/utilizadores)
- [ ] Backend: relatórios + exportação XLSX (exceljs)
- [ ] Frontend: dashboard com gráficos (Recharts)
- [ ] Frontend: gestão de produtos/serviços/categorias (com upload de imagens)
- [ ] Frontend: gestão de pedidos + facturas PDF
- [ ] Frontend: gestão de utilizadores + permissões (RBAC)
- [ ] Frontend: definições do sistema + gateways de pagamento

### 🔜 Fase 4 — Staff + POS
- [ ] Backend: rotas staff (tarefas, tickets, mensagens)
- [ ] Backend: rotas POS (vendas, stock, recibos)
- [ ] Frontend: área staff (tarefas, calendário)
- [ ] Frontend: POS — carrinho rápido, pagamento, recibo térmico (impressão)
- [ ] POS: modo offline total (vendas guardadas localmente, sincroniza depois)

### ✅ Fase 6 — App Móvel Nativa (Capacitor) + CI/CD
- [x] Capacitor configurado (`capacitor.config.ts`) — appId `com.carsaibms.lite`
- [x] Plugins: Camera, Push Notifications, Splash Screen, Status Bar, App, Network, Preferences, Share, Filesystem
- [x] Scanner de código de barras (`@capacitor-mlkit/barcode-scanning`) — ML Kit offline, integrado no POS
- [x] Campo `barcode` adicionado a produtos (separado do SKU) — pesquisável na API e no POS
- [x] Firebase completo: Push (Web+Native), Auth (Google Sign-In nativo), Analytics (screen tracking automático), Crashlytics (erros), Remote Config (feature flags), Firestore (camada realtime opcional p/ tickets)
- [x] i18n completo: PT + EN com 120+ chaves, troca instantânea sem reload, LangSwitcher em todos os layouts, aplicado em Dashboard, Login, POS, Perfil, Facturas, Tickets, Home, Contacto, Orçamento
- [x] Endpoint `/api/auth/google` — troca ID token Firebase por JWT próprio, cria conta automaticamente se não existir
- [x] Tabela `push_tokens` — multi-dispositivo por utilizador
- [x] Push wired em: confirmação de pagamento, notificações admin
- [x] `MOBILE.md` — guia completo de setup, keystore, Firebase, build local e CI
- [x] GitHub Actions: `ci.yml` (lint+build client/server), `release-android.yml` (APK+AAB assinados, anexados a Release), `deploy-server.yml`, `deploy-client.yml`, `db-migrate.yml`

### 🔜 Próximos passos sugeridos
- [ ] iOS (`npx cap add ios` + GoogleService-Info.plist)
- [ ] Scanner de código de barras via câmara no browser (web, sem app nativa)
- [ ] Google Play Console — submissão automática via `fastlane` ou `r0adkll/upload-google-play`
- [ ] Testes E2E (Playwright) no pipeline CI

---

## 🔑 Variáveis de Ambiente

### `server/.env`
```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=carsai_react
JWT_SECRET=troque_isto_em_producao
JWT_REFRESH_SECRET=troque_isto_tambem
CORS_ORIGIN=http://localhost:5173
```

### `client/.env`
```env
VITE_API_URL=http://localhost:4000/api
```

---

## 🚀 Como executar (desenvolvimento)

```bash
# Backend
cd server
npm install
npm run db:migrate   # cria as tabelas
npm run dev          # http://localhost:4000

# Frontend
cd client
npm install
npm run dev          # http://localhost:5173
```

---

## 📌 Decisões de Design

1. **Independência total**: nenhuma rota chama PHP. O backend Node é a única API.
2. **Esquema de BD novo**: tabelas redesenhadas (`carsai_react` schema), mais simples que o original, com migrations versionadas em `server/src/db/migrations/`.
3. **JWT em vez de sessões PHP**: `access_token` (15 min) + `refresh_token` (30 dias, httpOnly cookie).
4. **Offline-first no cliente**: TanStack Query + Dexie — dados em cache, mutações em fila quando offline.
5. **Monetary values**: armazenados em cêntimos (integer) no backend, formatados no frontend — evita problemas de precisão.

---

## 📂 Estado Actual dos Ficheiros (Fase 1)

```
server/src/
  index.ts                  ✅ Servidor Express + middlewares
  db/connection.ts          ✅ Pool MySQL
  db/schema.sql             ✅ Schema inicial (users, customers, orders, ...)
  db/migrate.ts             ✅ Script de migração
  middleware/auth.ts        ✅ Verificação JWT
  middleware/error.ts       ✅ Handler de erros centralizado
  routes/auth.ts            ✅ /api/auth/* (register, login, refresh, me)
  routes/customer.ts        ✅ /api/customer/* (orders, invoices, tickets, profile)
  routes/payments.ts        ✅ /api/payments/* (initiate, webhook, status)
  utils/jwt.ts              ✅ Geração/verificação de tokens
  utils/money.ts            ✅ Formatação monetária

client/src/
  main.tsx                  ✅ Entry point + PWA registration
  App.tsx                   ✅ Router principal
  lib/api.ts                ✅ Cliente HTTP (fetch wrapper + refresh automático)
  lib/db.ts                 ✅ Dexie (cache offline)
  store/auth.ts             ✅ Estado de autenticação (Zustand)
  layouts/CustomerLayout.tsx ✅ Sidebar + topbar + nav mobile
  layouts/AuthLayout.tsx     ✅ Layout de login/registo
  pages/auth/Login.tsx       ✅
  pages/auth/Register.tsx    ✅
  pages/customer/Dashboard.tsx  ✅
  pages/customer/Orders.tsx     ✅
  pages/customer/OrderDetail.tsx ✅
  pages/customer/Invoices.tsx    ✅
  pages/customer/Tickets.tsx     ✅
  pages/customer/TicketDetail.tsx ✅
  pages/customer/Profile.tsx      ✅
  components/ui/*                 ✅ Button, Card, Badge, Input, Modal, Toast
  public/manifest.json             ✅
  public/sw registration            ✅ (via vite-plugin-pwa)
```

**Próxima sessão**: Fase 2 (site público + loja) ou aprofundar Fase 1
(notificações push, sync offline do POS preview). A decidir.
