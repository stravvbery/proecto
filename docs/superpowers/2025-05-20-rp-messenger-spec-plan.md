# SCP:SL RP Messenger — "hondafx legacy"

> **Spec + Implementation Plan (единый документ)**
> **Дата:** 2025-05-20
> **Skill-флоу:** using-superpowers → brainstorming → writing-plans → ui-designer → design-system → color-palette → generate-component → tailwind-ui-rules → executing-plans → audit-design → verification-before-completion

---

## 1. Что делаем (Goal)

Веб-мессенджер в стиле Discord (адаптивный, mobile-friendly) с 1 предзаготовленным сервером и 6 LLM-ботами, которые отыгрывают RP. Лор: пользователь `stravvbery` выкупил сервер у `hondafx` — известного разработчика ру-комьюнити SCP:SL.

Боты — **живые**: читают новости/правила/объявления, реагируют на админ-действия (новая роль, новый канал, мут), обсуждают события между собой, запоминают важное, имеют персональную память и характер.

---

## 2. Архитектура (Architecture)

```
Browser (stravvbery)
  ↕ Socket.IO + REST
Custom server.ts (Next.js 15 + Socket.IO в одном процессе)
  ├─ REST API (CRUD серверов/каналов/ролей/сообщений/модерации)
  ├─ Event Bus (recordEvent на каждом админ-действии)
  ├─ Socket.IO rooms = каналы (presence, realtime sync)
  └─ Bot Orchestrator
       ├─ Tick: пока я онлайн → раз в 10-30s бот пишет в #болталку
       ├─ MsgReactor: моё msg → 80%+ ответ бота | бот-msg → 30% chain (max-depth=5)
       └─ EventReactor: админ-действие → 1-3 бота реагируют (с вероятностью по типу)
  → AgentRouter (OpenAI-compatible) → GLM / DeepSeek / Gemini Flash / Haiku
  → SQLite (better-sqlite3 + Drizzle)
```

---

## 3. Технический стек (Tech Stack)

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 15 (App Router) + TypeScript |
| Сервер | Custom server.ts (http.createServer + Socket.IO) |
| Реалтайм | Socket.IO (rooms = каналы) |
| БД | better-sqlite3 + Drizzle ORM (миграции, seed) |
| Стили | Tailwind CSS + shadcn/ui (Discord-clone) |
| Иконки | lucide-react |
| LLM | AgentRouter (sk-Open...), модели: GLM, DeepSeek v3/v4pro, Gemini Flash, Claude Haiku 4.5. **Opus запрещён.** |
| Markdown | react-markdown + remark-gfm + rehype-sanitize |
| Эмодзи | Unicode + shortcodes + emoji-picker-react |

---

## 4. Дизайн-система (Design System)

### Цвета (Discord-clone)
- **Фон чата:** `#313338`
- **Фон сайдбара:** `#2b2d31`
- **Фон списка серверов:** `#1e1f22`
- **Акцент (blurple):** `#5865F2`
- **Акцент-hover:** `#4752c4`
- **Текст:** `#f2f3f5` / secondary: `#b5bac1`
- **Онлайн:** `#23a559` / офлайн: `#80848e`
- **Красный (danger):** `#da373c`
- **Жёлтый (warn):** `#f0b232`
- **Канал по умолчанию:** `#949ba4`
- **Категория:** `#949ba4` (12px, uppercase, letter-spacing)

### Типографика
- **Шрифт:** `gg sans` / fallback: `Inter, system-ui, -apple-system, sans-serif`
- **h1:** 20px/700 (заголовок канала)
- **body:** 16px/1.375rem (сообщения)
- **caption:** 12px/400 (таймстемпы, категории)
- **small:** 13px/400 (username в сообщении)

### Тени / Border radius
- Сообщения: без теней, hover-фон `#2e3035`
- Карточки: `radius: 4px`
- Модальные окна: `radius: 8px`, shadow: `0 8px 24px rgba(0,0,0,0.24)`
- Список серверов: `radius: 50%` (круглые иконки), hover: `radius: 35%`

### Spacing
- Базовый: 4px grid (4, 8, 12, 16, 20, 24, 32, 48)
- Отступы сообщений: `px-4 py-0.5` (0.125rem)
- Gap между сообщениями: `0` (вплотную)
- Padding канала в сайдбаре: `6px 8px`

### Mobile
- Breakpoints: `320` / `375` / `768` / `1024`
- < 768px: drawer'ы (левый — каналы, правый — участники), hamburger
- Touch targets: минимум 44x44px
- Чат занимает всю ширину, top-bar с названием канала и кнопками drawer'ов

---

## 5. Лор сервера (Server Lore)

> 🟢 **SCP:SL · hondafx legacy**
>
> Сервер основан в 2018 году `hondafx` — разработчиком ру-комьюнити SCP: Secret Laboratory. На пике — 4 сервера (Vanilla x2, RP, Modded), до 120 игроков одновременно.
>
> В мае 2025 года `hondafx` передал сервер команде `stravvbery`. При передаче были сохранены: база данных игроков, конфигурации плагинов, система ролей и каналов, история чатов, традиции комьюнити.
>
> Сейчас `honda` (бывший владелец) иногда заходит как VIP — следит за развитием сервера под новым руководством, даёт советы, ностальгирует.

---

## 6. Юзеры (Users)

| Ник | Модель | Роль | RP-характер |
|---|---|---|---|
| **stravvbery** (ты) | — | **Founder** (все права) | Новый владелец сервера |
| Hixxivxq | glm-4.6 | Senior Mod | Про-геймер, говорит сухо и по делу, киберспорт-отношение, мало слов |
| honda | deepseek-v3 | VIP (founder emeritus) | Бывший владелец сервера, олд-мудрец, заходит "посмотреть как у нового хозяина", даёт советы, ностальгирует |
| ksynaxxxxx | gemini-2.5-flash | Игрок | Школьник-токсик, КАПСИТ, спорит, мемы, кринж, любит провоцировать |
| rrqxet | glm-4.5 | VIP | Стример, шуточки, "лайк подписка колокольчик", байты, рофлы |
| saishiku | claude-haiku-4.5 | Helper | Анимешник, философствует, любит SCP-049/035, говорит загадками, помогает новичкам |
| vntrpz | deepseek-chat | Mod | Олд-ворчун с релиза 2018, "раньше было лучше", бубнит, но в душе добрый |

---

## 7. Роли сервера (Roles)

| Роль | Цвет | Права |
|---|---|---|
| Founder | `#5865F2` | Всё |
| Admin | `#da373c` | Управление каналами, модерация |
| Senior Mod | `#c27c0e` | Модерация, управление ролями (назначать ниже) |
| Mod | `#23a559` | Модерация сообщений |
| Helper | `#eb459e` | Помощь, отвечать на вопросы |
| VIP | `#9b59b6` | Спец-роль, доступ к VIP-каналам |
| Игрок | `#b5bac1` | Базовые права |
| Новичок | `#80848e` | Только чтение инфо-каналов |

---

## 8. Структура каналов (Channels)

| Категория | Каналы |
|---|---|
| 📜 Информация | `#правила` · `#объявления` · `#новости` |
| 💬 Общение | `#болталка` (auto-life) · `#флуд` · `#мемы` · `#помощь` |
| 🎮 SCP:SL | `#серверы` · `#баги` · `#предложения` · `#поиск-команды` |
| 🛡️ Стафф (только Founder/Admin/Mod) | `#админ-чат` · `#логи` · `#жалобы` |

**"Важные каналы"** — `#правила`, `#объявления`, `#новости` — их содержимое всегда полностью в контексте каждого бота.

---

## 9. Как работают боты (Bot System)

### A. Tick — авто-жизнь в #болталке
- Пока `stravvbery` онлайн (Socket.IO presence) → tick активен
- Интервал: 10-30 секунд (случайный)
- Выбирается случайный бот (не stravvbery)
- Бот получает контекст (см. пункт 9.D) и генерирует сообщение
- Cooldown: каждый бот не чаще 1 раза в 30 сек

### B. MsgReactor — реакция на сообщения
- На сообщение stravvbery → 80% шанс ответа 1-3 ботов (задержка 2-8 сек, имитация "печатает")
- На сообщение бота → 30% шанс продолжения другим ботом (chain, max-depth=5)
- Cooldown канала: 5 сек между авто-сообщениями

### C. EventReactor — реакция на админ-действия
- Я сделал действие → event записывается в `events` table
- Через 5-30 сек 1-3 бота реагируют в #болталке

| Тип события | Шанс реакции | Пример |
|---|---|---|
| `announcement.posted` (#правила/#объявления/#новости) | 90% | `honda: "О, stravvbery затянул гайки"` |
| `role.assigned` | 80% | `Hixxivxq: "поздравляю"` |
| `member.muted` | 70% | `ksynaxxxxx: "ПОДЕЛОМ"` |
| `member.banned` | 70% | `vntrpz: "давно пора было"` |
| `channel.created` | 50% | `rrqxet: "новый канал, го"` |
| `channel.renamed` | 30% | `saishiku: "имя отражает суть..."` |
| `channel.deleted` | 30% | `vntrpz: "раньше каналы не удаляли просто так"` |
| `message.deleted` | 10% | Редко |

### D. Контекст бота (что видит LLM)
При КАЖДОМ вызове бот получает:
1. **System prompt** — персона + лор сервера + инструкция по форматированию
2. **Текущее состояние сервера** — имя, лор, список ролей, список каналов, кто онлайн
3. **Последние 15-20 событий** из `events` table (с таймстемпами)
4. **Содержимое "важных каналов"** (#правила, #объявления, #новости) — полностью
5. **Топ-5 персональных воспоминаний** из `bot_memories` table
6. **Последние 30 сообщений текущего канала**
7. Если event-reactor — само событие как "триггер"

### E. Memory extraction (память бота)
После каждого ответа бота — лёгкая модель (Flash/Haiku) извлекает 0-2 ключевых факта:
```
remember("stravvbery запретил капс в чате", importance=7)
remember("ksynaxxxxx получил мут за спам", importance=5)
```
Хранится в `bot_memories` table. Топ-5 по importance всегда в контексте.

---

## 10. Форматирование сообщений (Markdown + Emoji)

### Поддержка
- **bold**, *italic*, ***bold italic***, ~~strikethrough~~, `inline code`
- ```code blocks``` (с подсветкой языка)
- > цитаты (вложенные)
- # Заголовки, списки (нумерованные/ненумерованные)
- [ссылки](url)
- ||спойлеры|| (кастомный синтаксис)
- @mentions (подсвечиваются, кликабельны)
- #channel-mentions

### Эмодзи
- Unicode: 😂 🔥 💀 👀 🤔 ✅ ❌ ⚠️ 🎮 🛡️ 💬 📜 🎉
- Shortcodes в инпуте → рендерятся как Unicode: `:fire:` → 🔥, `:skull:` → 💀
- Emoji picker в интерфейсе ввода (emoji-picker-react)

### Безопасность
- rehype-sanitize — запрещён HTML, только markdown
- `<script>`, `<iframe>`, `onclick` — удаляются

---

## 11. Админ-функции (твои)

1. **Управление каналами и категориями**
   - Создать/удалить/переименовать канал
   - Создать/удалить/переименовать категорию
   - Drag-and-drop порядок каналов (опционально, в v2)

2. **RolesManager**
   - Создать роль (имя, цвет, права)
   - Редактировать роль
   - Назначить роль юзеру / снять роль
   - RBAC — права проверяются на каждом запросе

3. **Модерация**
   - Редактировать любое сообщение
   - Удалить сообщение (с записью в `events` + `#логи`)
   - Mute юзера (с длительностью: 5 мин / 1 час / 24 часа / навсегда)
   - Ban юзера (с записью в events)
   - Контекстное меню (правый клик по сообщению / юзеру)

4. **Настройки сервера**
   - Изменить имя сервера
   - Изменить лор/описание
   - Загрузить иконку/баннер

---

## 12. Auth (Dev-login)

- Без паролей (локальная разработка)
- Страница `/login` — выпадающий список из 7 юзеров → выбрать → "Войти"
- JWT в httpOnly cookie (jose, без внешних библиотек)
- Middleware проверяет cookie на `/app/*` маршрутах
- Сессия: `{ userId, username, serverId }`

---

## 13. Socket.IO события

| Событие | Направление | Описание |
|---|---|---|
| `message:new` | server→clients | Новое сообщение в канале |
| `message:edit` | server→clients | Сообщение отредактировано |
| `message:delete` | server→clients | Сообщение удалено |
| `channel:created` | server→clients | Создан канал |
| `channel:deleted` | server→clients | Удалён канал |
| `channel:renamed` | server→clients | Переименован |
| `role:updated` | server→clients | Роль изменена |
| `member:muted` | server→clients | Мут |
| `member:banned` | server→clients | Бан |
| `presence:update` | server↔clients | Кто онлайн/офлайн |
| `typing:start` | server→clients | Бот "печатает" |
| `typing:stop` | server→clients | Бот закончил |
| `join:channel` | client→server | Подписка на room канала |
| `leave:channel` | client→server | Отписка |

---

## 14. Структура БД (Database Schema)

```sql
-- users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  is_bot INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- servers
CREATE TABLE servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  owner_id TEXT REFERENCES users(id),
  lore TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0
);

-- channels
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  topic TEXT,
  type TEXT DEFAULT 'text',
  position INTEGER DEFAULT 0,
  is_important INTEGER DEFAULT 0
);

-- roles
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#b5bac1',
  permissions TEXT DEFAULT '[]',
  position INTEGER DEFAULT 0
);

-- memberships
CREATE TABLE memberships (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  joined_at TEXT DEFAULT (datetime('now'))
);

-- user_roles
CREATE TABLE user_roles (
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  edited_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- events (event log)
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON
  actor_id TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- bot_memories (персональная память)
CREATE TABLE bot_memories (
  id TEXT PRIMARY KEY,
  bot_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  importance INTEGER DEFAULT 5,
  created_at TEXT DEFAULT (datetime('now'))
);

-- mutes
CREATE TABLE mutes (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  server_id TEXT REFERENCES servers(id) ON DELETE CASCADE,
  muted_by TEXT REFERENCES users(id),
  reason TEXT,
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 15. REST API эндпоинты

| Method | Path | Auth | Описание |
|---|---|---|---|
| POST | `/api/auth/login` | — | Dev-login |
| GET | `/api/auth/me` | cookie | Текущий юзер |
| GET | `/api/servers` | cookie | Список серверов юзера |
| GET | `/api/servers/[id]` | cookie | Детали сервера |
| PATCH | `/api/servers/[id]` | Founder | Обновить имя/лор/иконку |
| GET | `/api/servers/[id]/channels` | cookie | Каналы сервера (сгруппированы) |
| POST | `/api/servers/[id]/channels` | Admin+ | Создать канал |
| PATCH | `/api/servers/[id]/channels/[chId]` | Admin+ | Обновить канал |
| DELETE | `/api/servers/[id]/channels/[chId]` | Admin+ | Удалить канал |
| GET | `/api/servers/[id]/categories` | cookie | Категории |
| POST | `/api/servers/[id]/categories` | Admin+ | Создать категорию |
| DELETE | `/api/servers/[id]/categories/[catId]` | Admin+ | Удалить категорию |
| GET | `/api/servers/[id]/roles` | cookie | Роли сервера |
| POST | `/api/servers/[id]/roles` | Admin+ | Создать роль |
| PATCH | `/api/servers/[id]/roles/[roleId]` | Admin+ | Обновить роль |
| DELETE | `/api/servers/[id]/roles/[roleId]` | Admin+ | Удалить роль |
| POST | `/api/servers/[id]/members/[userId]/roles` | Admin+ | Назначить роль |
| DELETE | `/api/servers/[id]/members/[userId]/roles/[roleId]` | Admin+ | Снять роль |
| GET | `/api/channels/[id]/messages?before=&limit=50` | cookie | Сообщения канала |
| PATCH | `/api/channels/[id]/messages/[msgId]` | Founder | Редактировать сообщение |
| DELETE | `/api/channels/[id]/messages/[msgId]` | Mod+ | Удалить сообщение |
| POST | `/api/moderation/[userId]/mute` | Mod+ | Замутить |
| DELETE | `/api/moderation/[userId]/mute` | Mod+ | Размутить |
| POST | `/api/moderation/[userId]/ban` | Admin+ | Забанить |

---

## 16. Файловая структура проекта

```
F:\WorkFLow\Proecto\
├── package.json
├── next.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── server.ts                         # Custom Next.js + Socket.IO
├── .env.local                        # AGENT_ROUTER_API_KEY=sk-Open...
├── README.md
├── docs/superpowers/
│   └── 2025-05-20-rp-messenger-spec-plan.md   # ← этот файл
├── public/avatars/
│   ├── stravvbery.svg
│   ├── Hixxivxq.svg
│   ├── honda.svg
│   ├── ksynaxxxxx.svg
│   ├── rrqxet.svg
│   ├── saishiku.svg
│   └── vntrpz.svg
├── data/
│   └── app.db                       # SQLite
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Tailwind + design tokens
│   │   ├── page.tsx                 # Redirect to /login
│   │   ├── login/
│   │   │   └── page.tsx             # Dev-login page
│   │   └── app/
│   │       ├── layout.tsx           # Discord shell layout (4 колонки)
│   │       └── [serverId]/
│   │           └── [channelId]/
│   │               └── page.tsx     # Chat page
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── me/route.ts
│       ├── servers/
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── channels/
│       │       │   ├── route.ts
│       │       │   └── [chId]/route.ts
│       │       ├── categories/
│       │       │   ├── route.ts
│       │       │   └── [catId]/route.ts
│       │       ├── roles/
│       │       │   ├── route.ts
│       │       │   └── [roleId]/route.ts
│       │       └── members/
│       │           └── [userId]/roles/route.ts
│       ├── channels/
│       │   └── [id]/messages/
│       │       ├── route.ts
│       │       └── [msgId]/route.ts
│       └── moderation/
│           └── [userId]/
│               ├── mute/route.ts
│               └── ban/route.ts
├── components/
│   ├── ui/                          # shadcn (button, dialog, dropdown-menu, context-menu, tooltip, scroll-area, avatar, input, select, toast)
│   ├── sidebar/
│   │   ├── ServerList.tsx           # Левый столбец — иконки серверов
│   │   ├── ServerIcon.tsx           # Одна иконка сервера
│   │   ├── ChannelList.tsx          # Второй столбец — список каналов
│   │   ├── ChannelGroup.tsx         # Группа каналов (категория)
│   │   ├── ChannelItem.tsx          # Один канал в списке
│   │   └── UserPanel.tsx            # Панель юзера внизу
│   ├── chat/
│   │   ├── ChatArea.tsx             # Третий столбец — чат
│   │   ├── ChannelHeader.tsx        # Заголовок канала
│   │   ├── MessageList.tsx          # Список сообщений
│   │   ├── MessageItem.tsx          # Одно сообщение
│   │   ├── MessageInput.tsx         # Поле ввода
│   │   ├── DayDivider.tsx           # Разделитель по дням
│   │   ├── TypingIndicator.tsx      # "Бот печатает..."
│   │   ├── MarkdownRenderer.tsx     # Рендер markdown + эмодзи
│   │   ├── MessageReactions.tsx     # Реакции на сообщение
│   │   └── MessageContextMenu.tsx   # ПКМ по сообщению
│   ├── members/
│   │   ├── MemberList.tsx           # Четвёртый столбец — список участников
│   │   ├── MemberItem.tsx           # Один участник
│   │   └── MemberContextMenu.tsx    # ПКМ по участнику
│   ├── modals/
│   │   ├── CreateChannelModal.tsx
│   │   ├── EditChannelModal.tsx
│   │   ├── CreateCategoryModal.tsx
│   │   ├── CreateRoleModal.tsx
│   │   ├── EditRoleModal.tsx
│   │   └── ServerSettingsModal.tsx
│   └── mobile/
│       ├── MobileShell.tsx          # Mobile wrapper
│       └── MobileTopBar.tsx         # Верхняя панель с hamburger
├── lib/
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema
│   │   ├── client.ts               # DB client
│   │   ├── migrate.ts              # Миграции
│   │   └── seed.ts                 # Seed данные
│   ├── llm/
│   │   ├── agent-router.ts         # AgentRouter клиент
│   │   ├── personas.ts             # System prompts + character cards
│   │   ├── orchestrator.ts         # Tick + MsgReactor + EventReactor
│   │   └── memory.ts               # Memory extraction
│   ├── socket/
│   │   ├── server.ts               # Socket.IO server setup
│   │   ├── events.ts               # Socket event handlers
│   │   └── client.ts               # Client-side socket hook
│   ├── auth/
│   │   ├── session.ts              # JWT sign/verify
│   │   └── permissions.ts          # RBAC check
│   ├── events.ts                   # Event recording
│   └── utils.ts
├── hooks/
│   ├── useSocket.ts
│   ├── useChannel.ts
│   ├── useMessages.ts
│   ├── useMembers.ts
│   └── useMediaQuery.ts
└── types/
    └── index.ts
```

---

## 17. Фазы имплементации

### Phase 0 — Bootstrap
- `npx create-next-app@latest` в `F:\WorkFLow\Proecto` (TypeScript, Tailwind, App Router, src/)
- Установить deps: `better-sqlite3`, `drizzle-orm`, `drizzle-kit`, `socket.io`, `socket.io-client`, `jose`, `openai`, `react-markdown`, `remark-gfm`, `rehype-sanitize`, `emoji-picker-react`, `lucide-react`, `uuid`
- `npx shadcn@latest init` (neutral, zinc, CSS variables)
- `npx shadcn@latest add button dialog dropdown-menu context-menu tooltip scroll-area avatar input select toast`
- Создать `server.ts` — кастомный http-сервер, который оборачивает Next.js и Socket.IO
- Создать `.env.local` с `AGENT_ROUTER_API_KEY`
- `mkdir` структуру папок
- **Checkpoint:** `npm run dev` запускается, Next.js + Socket.IO работают

### Phase 1 — DB Schema + Seed
- Написать `lib/db/schema.ts` — все таблицы через Drizzle
- Написать `lib/db/client.ts` — better-sqlite3 connection + drizzle wrapper
- Написать `drizzle.config.ts`
- `npx drizzle-kit generate` + `npx drizzle-kit migrate`
- Написать `lib/db/seed.ts`:
  - 7 юзеров
  - 1 сервер "SCP:SL · hondafx legacy" с лором
  - 4 категории, ~12 каналов
  - 8 ролей
  - Memberships + user_roles (stravvbery=Founder, боты по списку)
  - Пара стартовых событий в events (основание/передача сервера)
- **Checkpoint:** `npx tsx src/lib/db/seed.ts` заполняет БД

### Phase 2 — Auth
- `lib/auth/session.ts` — sign/verify JWT (jose, HS256, httpOnly cookie)
- `POST /api/auth/login` — принимает `{ username }`, проверяет в БД, возвращает cookie
- `GET /api/auth/me` — расшифровывает cookie, возвращает user
- Middleware в `src/middleware.ts` — редиректит с `/app/*` на `/login` без cookie
- Страница `/login` — выпадающий список 7 юзеров + кнопка "Войти"
- `src/app/page.tsx` — redirect на `/login`
- **Checkpoint:** Можно залогиниться под любым из 7 юзеров

### Phase 3 — REST CRUD + Events
- Реализовать все эндпоинты из секции 15
- `lib/permissions.ts` — `checkPermission(userId, serverId, action)` через роли
- Каждый мутирующий эндпоинт вызывает `recordEvent(...)` из `lib/events.ts`
- `recordEvent` пишет в `events` table + эмитит Socket.IO `event:new`
- **Checkpoint:** Можно создать/удалить канал через curl/Insomnia

### Phase 4 — Socket.IO Server
- `lib/socket/server.ts` — initSocketServer(io):
  - `join:channel` / `leave:channel` → подписка на room
  - `message:new` → запись в БД + broadcast в room
  - `typing:*` → broadcast в room
  - `presence:*` → отслеживание кто онлайн (Map userId→Set<socketId>)
- Auth middleware для socket: проверять JWT из handshake auth
- Интеграция с `server.ts`
- **Checkpoint:** Открыл 2 вкладки, отправил msg — пришло в обе

### Phase 5 — LLM Bot Orchestrator
- `lib/llm/agent-router.ts` — OpenAI-совместимый клиент (baseURL = AgentRouter, key из env)
- `lib/llm/personas.ts` — 6 character cards (system prompts):
  ```
  Ты — {ник}, {роль} на сервере "SCP:SL · hondafx legacy".
  Твой характер: {описание}.
  Ты общаешься с другими участниками сервера: {список юзеров с ролями}.
  Форматируй сообщения: используй markdown (bold, italic, code, списки), эмодзи, НЕ используй HTML.
  Ты НЕ модель, ты НЕ ИИ. Ты реальный человек, игрок SCP:SL.
  Отвечай кратко (1-4 предложения), в характере.
  ```
- `lib/llm/orchestrator.ts`:
  - `buildBotContext(botId, channelId)` → собирает полный контекст (секция 9.D)
  - `tickLoop()` — setInterval, пока stravvbery online → случайный бот пишет в #болталку
  - `msgReactor(channelId, message)` — после нового сообщения → шанс ответа
  - `eventReactor(event)` — после нового события → шанс реакции
  - Cooldown tracker (Map botId→timestamp)
- `lib/llm/memory.ts` — extractMemories(botId, message) → function-call remember()
- Интеграция: orchestrator запускается/стопается в `server.ts`, подписывается на Socket.IO события
- **Checkpoint:** Бот реально пишет в #болталку осмысленное сообщение

### Phase 6 — UI Layout (Discord shell)
- `src/app/app/layout.tsx` — 4-колоночный flex: ServerList (w-18) | ChannelList (w-60) | Chat (flex-1) | MemberList (w-60, hidden < 1024)
- `ServerList.tsx` — вертикальный скролл, круглые иконки, active-индикатор (белая полоска слева), hover-анимация (скругление)
- `ChannelList.tsx` — имя сервера сверху, список ChannelGroup'ов, скролл
- `ChannelGroup.tsx` — кликабельный заголовок (стрелка сворачивания), список ChannelItem
- `ChannelItem.tsx` — иконка #/🔒 + имя канала, active-стиль, unread-индикатор
- `UserPanel.tsx` — внизу сайдбара: аватарка + имя + микрофон/наушники (статика)
- `MemberList.tsx` — справа, сгруппированы по ролям, каждый MemberItem
- **Checkpoint:** UI выглядит как Discord

### Phase 7 — Mobile Responsive
- `useMediaQuery` hook — `(max-width: 767px)`
- Mobile: вместо 4 колонок → 1 колонка (чат) + два drawer'а (левый — каналы, правый — участники)
- `MobileTopBar.tsx` — hamburger слева, название канала, кнопка участников справа
- Drawer'ы через `sheet` из shadcn/ui
- Touch-friendly: min-height 44px, достаточные отступы
- ServerList в mobile: горизонтальный скролл сверху или в drawer
- **Checkpoint:** На 375px viewport всё читаемо, drawer'ы открываются

### Phase 8 — Chat UI
- `ChatArea.tsx` — основной компонент чата
- `ChannelHeader.tsx` — # иконка, имя канала, описание (topic), иконки справа
- `MessageList.tsx`:
  - Загрузка сообщений из API + Socket.IO подписка
  - Автоскролл вниз при новых сообщениях (если уже внизу)
  - DayDivider между днями
  - Группировка сообщений одного юзера (аватарка только у первого)
- `MessageItem.tsx`:
  - Аватарка + имя (цвет роли) + время + контент
  - Hover: фон `#2e3035`, кнопки действий (редактировать, удалить, реакции)
  - @mentions подсвечиваются жёлтым фоном
  - ПКМ → MessageContextMenu
- `MessageInput.tsx`:
  - Textarea с авто-расширением
  - Enter → отправить, Shift+Enter → новая строка
  - Кнопка emoji-picker
  - Placeholder: `Напишите сообщение в #канал`
- `MarkdownRenderer.tsx` — react-markdown + remark-gfm + rehype-sanitize + кастомные (spoiler, mention, channel-mention)
- `TypingIndicator.tsx` — "Hixxivxq печатает..." с анимированными точками
- **Checkpoint:** Чат работает: пишу → сообщение появляется, markdown рендерится, эмодзи работают

### Phase 9 — Admin Modals
- `CreateChannelModal.tsx` — тип (текст/голос), имя, категория, topic
- `EditChannelModal.tsx` — имя, topic, категория, is_important toggle
- `CreateCategoryModal.tsx` — имя
- `CreateRoleModal.tsx` — имя, цвет (color picker), чекбоксы прав
- `EditRoleModal.tsx` — то же + список участников с этой ролью
- `ServerSettingsModal.tsx` — имя, лор, иконка
- Context menus:
  - `MessageContextMenu.tsx` — Редактировать, Удалить, Копировать текст
  - `MemberContextMenu.tsx` — Назначить роль, Mute, Ban, Профиль
- Все модальные окна через `dialog` из shadcn/ui
- Подтверждение для деструктивных действий (AlertDialog)
- **Checkpoint:** Можно создать/удалить канал через UI, всё синхронизируется

### Phase 10 — Polish
- Анимации: fadeIn для сообщений, slideIn для drawer'ов, scale для модалок
- Skeletons: Skeleton-компоненты при загрузке каналов/сообщений/участников
- Empty states: "В этом канале пока нет сообщений" с иконкой
- Toasts: успех/ошибка для всех действий (sonner)
- Онлайн-индикаторы: зелёная точка на аватарке
- Typing indicator: плавное появление/исчезновение
- SCP favicon (⚛️ или кастомный)
- Scrollbar styling (тонкий, как в DC)
- Цвета ролей в никах (и в чате, и в списке участников)
- **Checkpoint:** Всё выглядит отполированным, не "сырым"

### Phase 11 — Verification
- [ ] `npm run build` — 0 errors
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 warnings
- [ ] Smoke-тест вручную:
  - [ ] Логин под `stravvbery`
  - [ ] Вижу сервер, лор, 6 ботов в списке участников
  - [ ] Захожу в #болталку → через 10-30 сек бот пишет
  - [ ] Пишу сообщение → бот отвечает в характере
  - [ ] Markdown + эмодзи рендерятся
  - [ ] Создаю канал → появляется у всех + 1-2 бота отреагировали
  - [ ] Меняю роль → бот поздравил/обсудил
  - [ ] Мутю бота → бот замолкает, другие обсудили
  - [ ] Mobile (375px) — drawer'ы, чат, всё работает
  - [ ] 2 вкладки — сообщения синхронизируются через Socket.IO
- **Checkpoint:** Всё работает, проект готов

---

## 18. Риски и решения (Risks & Mitigations)

| Риск | Решение |
|---|---|
| Точные model-ID AgentRouter неизвестны | Проверю `GET /v1/models` в Phase 5, ID лежат константами — поправить 1 минута |
| $100 бюджет — перерасход | Tick 10-30s, rate-limit, контекст ограничен. При среднем расходе ~2k tok/запрос хватит на 500K+ сообщений |
| Бесконечные цепочки бот-бот | max-depth=5 в reactor |
| Дубли сообщений при PM2/cluster | В README: single-process only |
| rehype-sanitize слишком агрессивный | Кастомные allowedTags: `span` (для mentions/spoiler), разрешённые атрибуты |
| SQLite конкурентность | WAL mode + single-process, для local-dev достаточно |
| Next.js + Socket.IO custom server | Работает локально и на Railway/Render/VPS. НЕ на Vercel. |
| Боты не помнят контекст между рестартами | `bot_memories` + `events` в БД, сохраняются |

---

## 19. README (будет создан)

```markdown
# SCP:SL RP Messenger — "hondafx legacy"

Discord-подобный мессенджер с живыми LLM-ботами для RP.

## Запуск

```bash
npm install
cp .env.example .env.local   # заполнить AGENT_ROUTER_API_KEY
npx tsx src/lib/db/seed.ts   # заполнить БД
npm run dev                   # http://localhost:3000
```

## Важно

- Single-process only (не использовать PM2 cluster — дубли сообщений ботов)
- Для продакшена: Railway / Render / VPS (custom server, НЕ Vercel)
- API ключ в .env.local, никогда не коммитить
```

---

## 20. Статус

- [ ] Phase 0 — Bootstrap
- [ ] Phase 1 — DB Schema + Seed
- [ ] Phase 2 — Auth
- [ ] Phase 3 — REST CRUD + Events
- [ ] Phase 4 — Socket.IO
- [ ] Phase 5 — LLM Bot Orchestrator
- [ ] Phase 6 — UI Layout
- [ ] Phase 7 — Mobile
- [ ] Phase 8 — Chat
- [ ] Phase 9 — Admin Modals
- [ ] Phase 10 — Polish
- [ ] Phase 11 — Verification

---

> **Готово к имплементации.** Следующий шаг — Phase 0: Bootstrap (create-next-app + deps + custom server.ts).