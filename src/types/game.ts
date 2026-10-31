/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CharacterOrigin = 'vagabond' | 'merchant' | 'mercenary' | 'noble';

export type CharacterRank =
  | 'humble'        // کەسێکی سادە
  | 'trader'        // بازرگان
  | 'captain'       // فەرماندەی بەکرێگیراوان
  | 'vassal'        // میری دەربار
  | 'high_lord'     // خاوەن دەسەڵات و قەڵا
  | 'king';         // شای شاهان و سەرکردەی باڵا

export interface PlayerEquipment {
  weapon: { nameKu: string; nameEn: string; attackBonus: number; cost: number; owned: boolean };
  shield: { nameKu: string; nameEn: string; defenseBonus: number; cost: number; owned: boolean };
  armor: { nameKu: string; nameEn: string; defenseBonus: number; cost: number; owned: boolean };
  horse: { nameKu: string; nameEn: string; speedBonus: number; cost: number; owned: boolean };
}

export interface PlayerCharacter {
  name: string;
  origin: CharacterOrigin;
  rank: CharacterRank;
  gold: number;
  renown: number;          // ناوودەنگ (0-1000)
  honor: number;           // شکۆ (-100 to 100)
  influence: number;       // نفوز (0-500)
  partyLimit: number;
  inventoryLimit: number;
  currentDay: number;
  allegiance: string | null; // Kingdom ID or null (independent)
  fiefs: string[];          // List of settlement IDs owned by player
  workshops: Workshop[];
  troops: PartyTroop[];
  inventory: TradeItem[];
  equipment: PlayerEquipment;
  worldPosition: { x: number; z: number };
}

export interface Workshop {
  id: string;
  settlementId: string;
  type: 'brewery' | 'smithy' | 'oil_press' | 'tannery' | 'weaver';
  nameKu: string;
  nameEn: string;
  weeklyIncome: number;
  cost: number;
}

export interface TroopUnit {
  id: string;
  nameKu: string;
  nameEn: string;
  tier: 1 | 2 | 3 | 4 | 5;
  type: 'infantry' | 'archer' | 'cavalry';
  wage: number;
  upgradeCost: number;
  hp: number;
  attack: number;
  defense: number;
  nextUpgradeId?: string;
}

export interface PartyTroop {
  troopId: string;
  count: number;
}

export interface TradeGood {
  id: string;
  nameKu: string;
  nameEn: string;
  category: 'food' | 'raw' | 'luxury' | 'military';
  basePrice: number;
  weight: number;
}

export interface TradeItem {
  goodId: string;
  quantity: number;
  boughtPrice?: number;
}

export interface Settlement {
  id: string;
  nameKu: string;
  nameEn: string;
  kingdomId: string;
  type: 'city' | 'castle' | 'village';
  boardX: number; // 3D board coordinates
  boardZ: number;
  ownerLordId: string;
  prosperity: number; // 0 to 100
  garrison: number;
  unrest: number;
  taxYield: number;
  descriptionKu: string;
  descriptionEn: string;
  marketGoods: Record<string, { stock: number; price: number }>;
  recruitPool: { troopId: string; count: number; cost: number }[];
}

export interface Lord {
  id: string;
  nameKu: string;
  nameEn: string;
  titleKu: string;
  titleEn: string;
  kingdomId: string;
  avatarColor: string;
  relationWithPlayer: number; // -100 to 100
  personality: 'chivalrous' | 'ruthless' | 'cunning' | 'ambitious' | 'loyal';
  fiefs: string[];
  armySize: number;
  influence: number;
  blackmailLeverage?: string;
  isKing: boolean;
  demandsKu: string;
  demandsEn: string;
}

export interface Kingdom {
  id: string;
  nameKu: string;
  nameEn: string;
  kingId: string;
  colorHex: string;
  bannerColor: number;
  capitalId: string;
  warWith: string[]; // Kingdom IDs
  relationWithPlayer: number; // -100 to 100
  descriptionKu: string;
  descriptionEn: string;
  cultureKu: string;
  cultureEn: string;
}

export interface RoamingParty {
  id: string;
  nameKu: string;
  nameEn: string;
  type: 'bandit' | 'caravan' | 'lord' | 'player';
  factionId?: string;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  troopsCount: number;
}

export interface BattleState {
  enemyNameKu: string;
  enemyNameEn: string;
  enemyType: 'bandits' | 'enemy_lord' | 'garrison';
  enemyTroops: { nameKu: string; count: number; hp: number }[];
  playerTroops: { nameKu: string; count: number; hp: number }[];
  turn: number;
  log: string[];
  battlePhase: 'tactics' | 'fighting' | 'resolved';
  winner?: 'player' | 'enemy';
  lootGold: number;
  lootRenown: number;
}

export interface BoardGameState {
  day: number;
  player: PlayerCharacter;
  kingdoms: Record<string, Kingdom>;
  settlements: Record<string, Settlement>;
  lords: Record<string, Lord>;
  roamingParties: RoamingParty[];
  activeSettlement: Settlement | null;
  activeBattle: BattleState | null;
  gamePhase: 'intro' | 'board' | 'settlement' | 'battle' | 'politics' | 'trade' | 'game_over';
  selectedSettlementId?: string;
  lang: 'ku' | 'en';
  soundMuted: boolean;
  cameraPreset: 'tactical' | 'board' | 'close' | 'overview';
}
