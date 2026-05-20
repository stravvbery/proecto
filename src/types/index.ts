export interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  isBot: boolean;
  createdAt: string;
}

export interface Server {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  ownerId: string;
  lore: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  serverId: string;
  name: string;
  position: number;
}

export interface Channel {
  id: string;
  categoryId: string | null;
  serverId: string;
  name: string;
  topic: string | null;
  type: string;
  position: number;
  isImportant: boolean;
}

export interface Role {
  id: string;
  serverId: string;
  name: string;
  color: string;
  permissions: string[];
  position: number;
}

export interface Membership {
  id: string;
  userId: string;
  serverId: string;
  joinedAt: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  serverId: string;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  editedAt: string | null;
  createdAt: string;
  user?: User;
  roleColor?: string;
}

export interface ServerEvent {
  id: string;
  serverId: string;
  type: string;
  data: Record<string, unknown>;
  actorId: string | null;
  createdAt: string;
}

export interface BotMemory {
  id: string;
  botId: string;
  content: string;
  importance: number;
  createdAt: string;
}

export interface Mute {
  id: string;
  userId: string;
  serverId: string;
  mutedBy: string | null;
  reason: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface MemberWithRoles extends User {
  roles: Role[];
  isOnline?: boolean;
}

export interface ChannelGroup {
  category: Category;
  channels: Channel[];
}

export interface SessionPayload {
  userId: string;
  username: string;
  serverId: string;
}
