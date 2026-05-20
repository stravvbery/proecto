import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";

const dbPath = path.join(process.cwd(), "data", "app.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const SERVER_ID = "srv-hondafx-legacy";
const now = new Date().toISOString();

const usersList = [
  { id: "user-stravvbery", username: "stravvbery", isBot: 0 },
  { id: "user-hixxivxq", username: "Hixxivxq", isBot: 1 },
  { id: "user-honda", username: "honda", isBot: 1 },
  { id: "user-ksynaxxxxx", username: "ksynaxxxxx", isBot: 1 },
  { id: "user-rrqxet", username: "rrqxet", isBot: 1 },
  { id: "user-saishiku", username: "saishiku", isBot: 1 },
  { id: "user-vntrpz", username: "vntrpz", isBot: 1 },
];

const rolesList = [
  { id: "role-founder", name: "Founder", color: "#5865F2", position: 8, permissions: '["all"]' },
  { id: "role-admin", name: "Admin", color: "#da373c", position: 7, permissions: '["manage_channels","moderate"]' },
  { id: "role-senior-mod", name: "Senior Mod", color: "#c27c0e", position: 6, permissions: '["moderate","manage_roles_below"]' },
  { id: "role-mod", name: "Mod", color: "#23a559", position: 5, permissions: '["moderate_messages"]' },
  { id: "role-helper", name: "Helper", color: "#eb459e", position: 4, permissions: '["help"]' },
  { id: "role-vip", name: "VIP", color: "#9b59b6", position: 3, permissions: '["vip_channels"]' },
  { id: "role-player", name: "Игрок", color: "#b5bac1", position: 2, permissions: '["basic"]' },
  { id: "role-newbie", name: "Новичок", color: "#80848e", position: 1, permissions: '["read_info"]' },
];

const categoriesList = [
  { id: "cat-info", name: "📜 Информация", position: 0 },
  { id: "cat-chat", name: "💬 Общение", position: 1 },
  { id: "cat-scpsl", name: "🎮 SCP:SL", position: 2 },
  { id: "cat-staff", name: "🛡️ Стафф", position: 3 },
];

const channelsList = [
  { id: "ch-rules", categoryId: "cat-info", name: "правила", topic: "Правила сервера", position: 0, isImportant: 1 },
  { id: "ch-announcements", categoryId: "cat-info", name: "объявления", topic: "Важные объявления", position: 1, isImportant: 1 },
  { id: "ch-news", categoryId: "cat-info", name: "новости", topic: "Новости SCP:SL и сервера", position: 2, isImportant: 1 },
  { id: "ch-chat", categoryId: "cat-chat", name: "болталка", topic: "Общий чат", position: 0, isImportant: 0 },
  { id: "ch-flood", categoryId: "cat-chat", name: "флуд", topic: "Тут можно всё", position: 1, isImportant: 0 },
  { id: "ch-memes", categoryId: "cat-chat", name: "мемы", topic: "Лучшие мемы", position: 2, isImportant: 0 },
  { id: "ch-help", categoryId: "cat-chat", name: "помощь", topic: "Задавайте вопросы", position: 3, isImportant: 0 },
  { id: "ch-servers", categoryId: "cat-scpsl", name: "серверы", topic: "Информация о серверах", position: 0, isImportant: 0 },
  { id: "ch-bugs", categoryId: "cat-scpsl", name: "баги", topic: "Репорты багов", position: 1, isImportant: 0 },
  { id: "ch-suggestions", categoryId: "cat-scpsl", name: "предложения", topic: "Ваши идеи", position: 2, isImportant: 0 },
  { id: "ch-lfg", categoryId: "cat-scpsl", name: "поиск-команды", topic: "Найди тиммейтов", position: 3, isImportant: 0 },
  { id: "ch-admin-chat", categoryId: "cat-staff", name: "админ-чат", topic: "Только для стаффа", position: 0, isImportant: 0 },
  { id: "ch-logs", categoryId: "cat-staff", name: "логи", topic: "Лог действий", position: 1, isImportant: 0 },
  { id: "ch-reports", categoryId: "cat-staff", name: "жалобы", topic: "Жалобы от игроков", position: 2, isImportant: 0 },
];

const userRoleAssignments = [
  { userId: "user-stravvbery", roleId: "role-founder" },
  { userId: "user-hixxivxq", roleId: "role-senior-mod" },
  { userId: "user-honda", roleId: "role-vip" },
  { userId: "user-ksynaxxxxx", roleId: "role-player" },
  { userId: "user-rrqxet", roleId: "role-vip" },
  { userId: "user-saishiku", roleId: "role-helper" },
  { userId: "user-vntrpz", roleId: "role-mod" },
];

// Clear existing data
sqlite.exec("DELETE FROM bot_memories");
sqlite.exec("DELETE FROM mutes");
sqlite.exec("DELETE FROM events");
sqlite.exec("DELETE FROM messages");
sqlite.exec("DELETE FROM user_roles");
sqlite.exec("DELETE FROM memberships");
sqlite.exec("DELETE FROM channels");
sqlite.exec("DELETE FROM categories");
sqlite.exec("DELETE FROM roles");
sqlite.exec("DELETE FROM servers");
sqlite.exec("DELETE FROM users");

// Insert users
const insertUser = sqlite.prepare(
  "INSERT INTO users (id, username, avatar_url, is_bot, created_at) VALUES (?, ?, ?, ?, ?)"
);
for (const u of usersList) {
  insertUser.run(u.id, u.username, `/avatars/${u.username}.svg`, u.isBot, now);
}

// Insert server
sqlite.prepare(
  "INSERT INTO servers (id, name, description, icon_url, owner_id, lore, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
).run(
  SERVER_ID,
  "SCP:SL · hondafx legacy",
  "Русскоязычное SCP:SL комьюнити",
  null,
  "user-stravvbery",
  `Сервер основан в 2018 году hondafx — разработчиком ру-комьюнити SCP: Secret Laboratory. На пике — 4 сервера (Vanilla x2, RP, Modded), до 120 игроков одновременно.\n\nВ мае 2025 года hondafx передал сервер команде stravvbery. При передаче были сохранены: база данных игроков, конфигурации плагинов, система ролей и каналов, история чатов, традиции комьюнити.\n\nСейчас honda (бывший владелец) иногда заходит как VIP — следит за развитием сервера под новым руководством, даёт советы, ностальгирует.`,
  now
);

// Insert categories
const insertCategory = sqlite.prepare(
  "INSERT INTO categories (id, server_id, name, position) VALUES (?, ?, ?, ?)"
);
for (const c of categoriesList) {
  insertCategory.run(c.id, SERVER_ID, c.name, c.position);
}

// Insert channels
const insertChannel = sqlite.prepare(
  "INSERT INTO channels (id, category_id, server_id, name, topic, type, position, is_important) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
for (const ch of channelsList) {
  insertChannel.run(ch.id, ch.categoryId, SERVER_ID, ch.name, ch.topic, "text", ch.position, ch.isImportant);
}

// Insert roles
const insertRole = sqlite.prepare(
  "INSERT INTO roles (id, server_id, name, color, permissions, position) VALUES (?, ?, ?, ?, ?, ?)"
);
for (const r of rolesList) {
  insertRole.run(r.id, SERVER_ID, r.name, r.color, r.permissions, r.position);
}

// Insert memberships
const insertMembership = sqlite.prepare(
  "INSERT INTO memberships (id, user_id, server_id, joined_at) VALUES (?, ?, ?, ?)"
);
for (const u of usersList) {
  insertMembership.run(uuid(), u.id, SERVER_ID, now);
}

// Insert user roles
const insertUserRole = sqlite.prepare(
  "INSERT INTO user_roles (user_id, role_id, server_id) VALUES (?, ?, ?)"
);
for (const ur of userRoleAssignments) {
  insertUserRole.run(ur.userId, ur.roleId, SERVER_ID);
}

// Insert starter events
const insertEvent = sqlite.prepare(
  "INSERT INTO events (id, server_id, type, data, actor_id, created_at) VALUES (?, ?, ?, ?, ?, ?)"
);
insertEvent.run(
  uuid(),
  SERVER_ID,
  "server.founded",
  JSON.stringify({ message: "Сервер основан hondafx в 2018 году" }),
  "user-honda",
  "2018-01-15T12:00:00.000Z"
);
insertEvent.run(
  uuid(),
  SERVER_ID,
  "server.transferred",
  JSON.stringify({ message: "Сервер передан от hondafx к stravvbery", from: "honda", to: "stravvbery" }),
  "user-honda",
  "2025-05-01T12:00:00.000Z"
);

// Seed important channels content
const insertMessage = sqlite.prepare(
  "INSERT INTO messages (id, channel_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)"
);

// Rules
insertMessage.run(uuid(), "ch-rules", "user-stravvbery", `# 📜 Правила сервера "hondafx legacy"

1. **Уважение к участникам** — без оскорблений, токсика и травли
2. **Без спама** — не флудить, не дублировать сообщения
3. **Без NSFW** — любой 18+ контент запрещён
4. **Следуй указаниям стаффа** — модераторы и админы правы по умолчанию
5. **Без читов и эксплойтов** — на сервере и в игре
6. **Русский язык** — основной язык общения
7. **Не выдавай себя за стафф** — если ты не модератор, не притворяйся им
8. **Баги — в #баги** — нашёл баг? Сообщи, не абьюзь

> Нарушение правил → предупреждение → мут → бан
> Решение стаффа — финальное`, now);

// Announcement
insertMessage.run(uuid(), "ch-announcements", "user-stravvbery", `# 🎉 Новое руководство!

Привет всем! Я **stravvbery**, новый владелец сервера. **honda** передал мне управление, и я планирую сохранить и развить всё лучшее, что было создано за эти годы.

Что планируется:
- Обновление плагинов
- Новые ивенты
- Активная модерация
- Открытость к предложениям

Пишите в #предложения, я всё читаю! 🔥`, now);

// News
insertMessage.run(uuid(), "ch-news", "user-stravvbery", `# 📰 Новости — Май 2025

- ✅ Сервер успешно передан новому владельцу
- ✅ Обновлена система ролей
- ✅ Добавлены новые каналы
- 🔄 В процессе: обновление плагинов до последних версий
- 📋 Планируется: первый ивент под новым руководством

Следите за обновлениями! 🛡️`, now);

console.log("✅ Database seeded successfully");
console.log(`   - ${usersList.length} users`);
console.log(`   - 1 server`);
console.log(`   - ${categoriesList.length} categories`);
console.log(`   - ${channelsList.length} channels`);
console.log(`   - ${rolesList.length} roles`);
console.log(`   - ${userRoleAssignments.length} user-role assignments`);
console.log(`   - 2 events`);
console.log(`   - 3 messages (rules, announcement, news)`);

sqlite.close();
