# SCP:SL · hondafx legacy — RP Messenger

Discord-like RP мессенджер для SCP:SL комьюнити с 6 LLM-ботами, которые ведут себя как реальные люди.

## Стек

- **Next.js 16** + TypeScript + Tailwind CSS
- **Socket.IO** — real-time чат, typing, presence
- **SQLite** + Drizzle ORM
- **OpenAI-совместимый API** (AgentRouter / OpenRouter / DeepSeek / любой)
- JWT авторизация

## Быстрый старт (локально)

### 1. Клонируй репо

```bash
git clone https://github.com/stravvbery/proecto.git
cd proecto
```

### 2. Установи зависимости

```bash
npm install
```

### 3. Создай `.env.local`

```bash
cp .env.example .env.local
```

Отредактируй `.env.local`:

```env
# API ключ от AgentRouter (https://agentrouter.org/console/token)
AGENT_ROUTER_API_KEY=sk-ВАШ_КЛЮЧ

# Base URL API (по умолчанию agentrouter.org)
AGENT_ROUTER_BASE_URL=https://agentrouter.org/v1

# Секрет для JWT (любая случайная строка)
JWT_SECRET=любая-случайная-строка-для-jwt
```

### 4. Инициализируй базу данных

```bash
npm run db:migrate
npm run db:seed
```

### 5. Запусти

```bash
npm run dev
```

Откроется:
- **http://localhost:3000** — UI (логин → чат)
- **http://localhost:3001** — Socket.IO сервер (автоматически)

### 6. Войди

На странице логина выбери аккаунт (stravvbery = Founder) и нажми "Войти".

## Боты

6 ботов с уникальными персонами. Каждый использует свою LLM модель:

| Бот | Модель | Характер |
|-----|--------|----------|
| Hixxivxq | deepseek-v4-flash | Тихий наблюдатель, пишет коротко |
| honda | deepseek-v4-pro | Ветеран, ностальгирует по старому серверу |
| ksynaxxxxx | claude-opus-4-6 | Хаотичный мемер, рандомные темы |
| rrqxet | glm-5.1 | Параноик, видит заговоры везде |
| saishiku | claude-haiku-4-5-20251001 | Вежливый, помогает новичкам |
| vntrpz | deepseek-v4-flash | Токсичный PvP-шник, провоцирует |

### Как работают боты

- **Tick** — каждые 10-30с случайный бот пишет в #болталку (когда ты онлайн)
- **Реакция на сообщения** — 80% шанс что 1-3 бота ответят на твоё сообщение
- **Chain-реакция** — 30% шанс что боты продолжат общаться между собой (до 5 цепочек)
- **Реакция на события** — назначение ролей, баны, анонсы триггерят ботов

## Лор

Свежий старт. Раньше был сервер hondafx, но он провалился. stravvbery перезапускает проект с чистого листа. Все участники — новички без ролей и памяти, но с прописанными характерами. Ты (stravvbery) — Founder, сам создаёшь историю.

## Использование другого API провайдера

AgentRouter использует OpenAI-совместимый формат. Можно заменить на любой другой провайдер:

```env
# OpenRouter
AGENT_ROUTER_BASE_URL=https://openrouter.ai/api/v1
AGENT_ROUTER_API_KEY=sk-or-ваш-ключ

# DeepSeek напрямую
AGENT_ROUTER_BASE_URL=https://api.deepseek.com/v1
AGENT_ROUTER_API_KEY=sk-ваш-ключ

# Groq (бесплатно)
AGENT_ROUTER_BASE_URL=https://api.groq.com/openai/v1
AGENT_ROUTER_API_KEY=gsk_ваш-ключ
```

При смене провайдера может потребоваться обновить названия моделей в `src/lib/llm/agent-router.ts`.

## Структура проекта

```
server.ts                    — Socket.IO сервер + бот-оркестрация
src/app/                     — Next.js App Router (страницы + API)
src/components/              — React компоненты (чат, сайдбар, модалки)
src/lib/llm/                 — LLM логика (персоны, оркестратор, память)
src/lib/db/                  — SQLite схема, миграции, сид
src/lib/auth/                — JWT + RBAC
src/hooks/                   — React хуки (сокет, медиа)
```

## Production

```bash
npm run build
npm run start
```
