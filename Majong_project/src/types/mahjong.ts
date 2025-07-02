export type TileType = 'man' | 'pin' | 'sou' | 'honor';
export type HonorType = 'east' | 'south' | 'west' | 'north' | 'white' | 'green' | 'red';

export interface Tile {
  type: TileType;
  value: number | HonorType;
  id: string;
}

export interface WaitingResult {
  waitingTiles: Tile[];
  waitingType: string;
  waitingTypeJapanese: string;
  description: string;
  probability?: number;
  remainingTiles?: number;
}

export interface HandPattern {
  type: 'sequence' | 'triplet' | 'pair' | 'quad';
  tiles: Tile[];
}

export interface ScoringHand {
  han: number;
  fu: number;
  yaku: string[];
  score: number;
}

export const TILE_NAMES = {
  man: { en: 'Characters', ja: '萬子' },
  pin: { en: 'Circles', ja: '筒子' },
  sou: { en: 'Bamboo', ja: '索子' },
  honor: { en: 'Honor', ja: '字牌' }
};

export const HONOR_NAMES = {
  east: { en: 'East', ja: '東' },
  south: { en: 'South', ja: '南' },
  west: { en: 'West', ja: '西' },
  north: { en: 'North', ja: '北' },
  white: { en: 'White', ja: '白' },
  green: { en: 'Green', ja: '發' },
  red: { en: 'Red', ja: '中' }
};

export const YAKU_LIST = {
  riichi: { ja: 'リーチ', han: 1 },
  tanyao: { ja: 'タンヤオ', han: 1 },
  pinfu: { ja: 'ピンフ', han: 1 },
  iipeikou: { ja: '一盃口', han: 1 },
  yakuhai: { ja: '役牌', han: 1 },
  menzenTsumo: { ja: '門前清自摸和', han: 1 },
  sanshokuDoujun: { ja: '三色同順', han: 2 },
  ittsu: { ja: '一気通貫', han: 2 },
  toitoi: { ja: '対々和', han: 2 },
  sanankou: { ja: '三暗刻', han: 2 },
  honroutou: { ja: '混老頭', han: 2 },
  shousangen: { ja: '小三元', han: 2 },
  honitsu: { ja: '混一色', han: 3 },
  junchan: { ja: '純全帯么九', han: 3 },
  ryanpeikou: { ja: '二盃口', han: 3 },
  chinitsu: { ja: '清一色', han: 6 },
  kokushimusou: { ja: '国士無双', han: 13 },
  suuankou: { ja: '四暗刻', han: 13 },
  daisangen: { ja: '大三元', han: 13 },
  shousuushii: { ja: '小四喜', han: 13 },
  daisuushii: { ja: '大四喜', han: 13 },
  tsuuiisou: { ja: '字一色', han: 13 },
  chinroutou: { ja: '清老頭', han: 13 },
  ryuuiisou: { ja: '緑一色', han: 13 },
  chuuren: { ja: '九蓮宝燈', han: 13 }
};