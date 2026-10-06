export type CharacterClass = 
  | 'Dark Knight' 
  | 'Blade Knight' 
  | 'Dark Wizard' 
  | 'Soul Master' 
  | 'Fairy Elf' 
  | 'Muse Elf' 
  | 'Magic Gladiator' 
  | 'Dark Lord' 
  | 'Summoner' 
  | 'Rage Fighter';

export interface CharacterData {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level: number;
  resets: number;
  masterResets: number;
  experience: number;
  levelUpPoints: number;
  strength: number;
  agility: number;
  vitality: number;
  energy: number;
  leadership: number;
  zen: number;
  pkLevel: number; // 1-3 Hero/Normal, 4-6 Murderer/Red
  pkCount: number;
  currentMap: string;
  positionX: number;
  positionY: number;
  isOnline: boolean;
  guildName?: string;
  guildLogo?: string;
}

export interface AccountData {
  id: string;
  loginName: string;
  email: string;
  vaultZen: number;
  wCoins: number;
  createdAt: string;
  characters: CharacterData[];
}

export interface GuildData {
  id: string;
  name: string;
  masterName: string;
  memberCount: number;
  score: number;
  logo: string;
  castleOwner: boolean;
}

export interface GameEvent {
  id: string;
  name: string;
  thaiName: string;
  description: string;
  intervalMinutes: number;
  nextRunInSeconds: number;
  rewards: string[];
  recommendedLevel: string;
}

export interface ServerInfo {
  name: string;
  version: string;
  season: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  onlinePlayers: number;
  maxPlayers: number;
  totalAccounts: number;
  totalGuilds: number;
  uptimeHours: number;
  expRate: string;
  masterExpRate: string;
  dropRate: string;
  chaosMachineRate: string;
  serverTime: string;
}

export type DbEngine = 'postgresql' | 'mysql';

export interface DatabaseConnectionConfig {
  engine: DbEngine;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  charset: string;
  ssl: boolean;
}
