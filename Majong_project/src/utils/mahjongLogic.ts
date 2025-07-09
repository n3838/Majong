import {
  Tile,
  WaitingResult,
  ScoringHand,
  TileType,
  HonorType,
} from "../types/mahjong";

// ==============================================================================
// ユーティリティ関数
// ==============================================================================

const tileToId = (tile: {
  type: TileType;
  value: number | HonorType;
}): string => `${tile.type}-${String(tile.value)}`;

export const createTile = (type: TileType, value: number | HonorType): Tile => {
  return { type, value, id: tileToId({ type, value }) };
};

export const sortTiles = (tiles: Tile[]): Tile[] => {
  const suitOrder: Record<TileType, number> = {
    man: 1,
    pin: 2,
    sou: 3,
    honor: 4,
  };
  const honorOrder: Record<HonorType, number> = {
    east: 1,
    south: 2,
    west: 3,
    north: 4,
    white: 5,
    green: 6,
    red: 7,
  };

  return [...tiles].sort((a, b) => {
    if (a.type !== b.type) return suitOrder[a.type] - suitOrder[b.type];
    if (a.type === "honor")
      return (
        honorOrder[a.value as HonorType] - honorOrder[b.value as HonorType]
      );
    return (a.value as number) - (b.value as number);
  });
};

const getTileCounts = (tiles: Tile[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const tile of tiles) {
    const id = tileToId(tile);
    counts[id] = (counts[id] || 0) + 1;
  }
  return counts;
};

const getAllPossibleTiles = (): Tile[] => {
  const tiles: Tile[] = [];
  const suits: TileType[] = ["man", "pin", "sou"];
  suits.forEach((suit) => {
    for (let i = 1; i <= 9; i++) tiles.push(createTile(suit, i));
  });
  const honors: HonorType[] = [
    "east",
    "south",
    "west",
    "north",
    "white",
    "green",
    "red",
  ];
  honors.forEach((honor) => tiles.push(createTile("honor", honor)));
  return tiles;
};

// ==============================================================================
// シャンテン数計算ロジック
// ==============================================================================

/**
 * 通常手の面子・搭子を抜き出す再帰関数
 */
const findBestCombination = (
  counts: number[],
  mentsu: number,
  taatsu: number
): number => {
  let currentShanten = 8 - mentsu * 2 - taatsu;

  const i = counts.findIndex((c) => c > 0);
  if (i === -1 || mentsu + taatsu >= 4) {
    return currentShanten;
  }

  // Path 1: 刻子として抜き出す
  if (counts[i] >= 3) {
    counts[i] -= 3;
    currentShanten = Math.min(
      currentShanten,
      findBestCombination(counts, mentsu + 1, taatsu)
    );
    counts[i] += 3; // バックトラック
  }

  // Path 2: 順子として抜き出す
  if (i < 27 && i % 9 <= 6 && counts[i + 1] > 0 && counts[i + 2] > 0) {
    counts[i]--;
    counts[i + 1]--;
    counts[i + 2]--;
    currentShanten = Math.min(
      currentShanten,
      findBestCombination(counts, mentsu + 1, taatsu)
    );
    counts[i]++;
    counts[i + 1]++;
    counts[i + 2]++; // バックトラック
  }

  // Path 3: 搭子として抜き出す
  if (mentsu + taatsu < 4) {
    // 対子
    if (counts[i] >= 2) {
      counts[i] -= 2;
      currentShanten = Math.min(
        currentShanten,
        findBestCombination(counts, mentsu, taatsu + 1)
      );
      counts[i] += 2;
    }
    // 両面・嵌張
    if (i < 27 && i % 9 <= 7 && counts[i + 1] > 0) {
      counts[i]--;
      counts[i + 1]--;
      currentShanten = Math.min(
        currentShanten,
        findBestCombination(counts, mentsu, taatsu + 1)
      );
      counts[i]++;
      counts[i + 1]++;
    }
    // 辺張
    if (i < 27 && i % 9 <= 6 && counts[i + 2] > 0) {
      counts[i]--;
      counts[i + 2]--;
      currentShanten = Math.min(
        currentShanten,
        findBestCombination(counts, mentsu, taatsu + 1)
      );
      counts[i]++;
      counts[i + 2]++;
    }
  }

  // Path 4: この牌を孤立牌として扱う
  counts[i]--;
  currentShanten = Math.min(
    currentShanten,
    findBestCombination(counts, mentsu, taatsu)
  );
  counts[i]++; // バックトラック

  return currentShanten;
};

/**
 * 通常手のシャンテン数を計算する
 */
const getNormalShanten = (hand: Tile[]): number => {
  const tileToIndex = (tile: Tile): number => {
    if (tile.type === "man") return (tile.value as number) - 1;
    if (tile.type === "pin") return (tile.value as number) - 1 + 9;
    if (tile.type === "sou") return (tile.value as number) - 1 + 18;
    const honorMap: Record<HonorType, number> = {
      east: 27,
      south: 28,
      west: 29,
      north: 30,
      white: 31,
      green: 32,
      red: 33,
    };
    return honorMap[tile.value as HonorType];
  };
  const initialCounts = new Array(34).fill(0);
  hand.forEach((tile) => initialCounts[tileToIndex(tile)]++);

  let minShanten = 8;

  // Case 1: 雀頭なし（ヘッドレス）で計算
  minShanten = Math.min(
    minShanten,
    findBestCombination([...initialCounts], 0, 0)
  );

  // Case 2: 雀頭候補を全て試す
  for (let i = 0; i < 34; i++) {
    if (initialCounts[i] >= 2) {
      const tempCounts = [...initialCounts];
      tempCounts[i] -= 2; // 雀頭を抜く
      // 雀頭があるのでシャンテン数の基本値-1
      minShanten = Math.min(
        minShanten,
        findBestCombination(tempCounts, 0, 0) - 1
      );
    }
  }

  return minShanten;
};

/**
 * 七対子のシャンテン数を計算する
 */
const getChiitoitsuShanten = (counts: Record<string, number>): number => {
  let pairs = 0;
  for (const id in counts) {
    pairs += Math.floor(counts[id] / 2);
  }
  return 6 - pairs;
};

/**
 * 国士無双のシャンテン数を計算する
 */
const getKokushiShanten = (counts: Record<string, number>): number => {
  const terminalsAndHonors = new Set([
    "man-1",
    "man-9",
    "pin-1",
    "pin-9",
    "sou-1",
    "sou-9",
    "honor-east",
    "honor-south",
    "honor-west",
    "honor-north",
    "honor-white",
    "honor-green",
    "honor-red",
  ]);
  let uniqueTypes = 0;
  let hasPair = false;
  for (const id of terminalsAndHonors) {
    if (counts[id]) {
      uniqueTypes++;
      if (counts[id] >= 2) hasPair = true;
    }
  }
  return hasPair ? 12 - uniqueTypes : 13 - uniqueTypes;
};

// ==============================================================================
// 公開（export）するメイン関数
// ==============================================================================

/**
 * 手牌全体のシャンテン数を計算します。
 */
export const getShanten = (hand: Tile[]): number => {
  const tileCount = hand.length;
  if (tileCount % 3 !== 1 && tileCount % 3 !== 2) return 8;

  const counts = getTileCounts(hand);

  return Math.min(
    getNormalShanten(hand),
    getChiitoitsuShanten(counts),
    getKokushiShanten(counts)
  );
};

/**
 * 和了（あがり）形かどうかを判定します。
 */
export const isWinningHand = (hand: Tile[]): boolean => {
  if (hand.length !== 14) return false;
  return getShanten(hand) === -1;
};

/**
 * 待ち牌を計算します。
 */
export const calculateWaitingTiles = (hand: Tile[]): WaitingResult[] => {
  if (hand.length !== 13 || getShanten(hand) !== 0) {
    return [];
  }

  const waitingTiles: WaitingResult[] = [];
  const allPossibleTiles = getAllPossibleTiles();
  const currentCounts = getTileCounts(hand);

  for (const tile of allPossibleTiles) {
    if ((currentCounts[tile.id] || 0) >= 4) continue;

    const tempHand = [...hand, tile];
    if (isWinningHand(tempHand)) {
      if (
        !waitingTiles.some((res) =>
          res.waitingTiles.some((wt) => wt.id === tile.id)
        )
      ) {
        waitingTiles.push({
          waitingTiles: [tile],
          waitingType: "Normal Wait",
          waitingTypeJapanese: "通常待ち",
          description: `この牌であがれます`,
        });
      }
    }
  }
  return waitingTiles;
};

/**
 * 和了形の手牌を分析します (今回はダミー実装)
 */
export const analyzeHand = (hand: Tile[]): ScoringHand | null => {
  if (!isWinningHand(hand)) return null;
  // TODO: ここに点数計算のロジックを実装
  return { han: 0, fu: 0, yaku: [], score: 0 };
};
