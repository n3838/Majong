import {
  Tile,
  WaitingResult,
  ScoringHand,
  TileType,
  HonorType,
} from "../types/mahjong";

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

// --- ここからが新しいシャンテン数計算ロジック ---

// 国士無双のシャンテン数を計算
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

// 七対子のシャンテン数を計算
const getChiitoitsuShanten = (counts: Record<string, number>): number => {
  let pairs = 0;
  for (const id in counts) {
    if (counts[id] >= 2) pairs++;
  }
  return 6 - pairs;
};

// 通常手のシャンテン数を計算する再帰関数
const calculateNormalShantenRecursive = (
  hand: Tile[],
  mentsu: number,
  taatsu: number
): number => {
  if (hand.length === 0) return 8 - mentsu * 2 - taatsu;

  let minShanten = 8 - mentsu * 2 - taatsu;
  const t1 = hand[0];

  // 1. 刻子として抜き出す
  if (hand.length >= 3 && hand[1].id === t1.id && hand[2].id === t1.id) {
    minShanten = Math.min(
      minShanten,
      calculateNormalShantenRecursive(hand.slice(3), mentsu + 1, taatsu)
    );
  }

  // 2. 順子として抜き出す
  if (t1.type !== "honor") {
    const t2Index = hand.findIndex(
      (t) => t.type === t1.type && t.value === (t1.value as number) + 1
    );
    if (t2Index !== -1) {
      const t3Index = hand.findIndex(
        (t) => t.type === t1.type && t.value === (t1.value as number) + 2
      );
      if (t3Index !== -1) {
        const nextHand = [...hand];
        nextHand.splice(t3Index, 1);
        nextHand.splice(t2Index, 1);
        nextHand.splice(0, 1);
        minShanten = Math.min(
          minShanten,
          calculateNormalShantenRecursive(nextHand, mentsu + 1, taatsu)
        );
      }
    }
  }

  // 3. 塔子として抜き出す
  // ペア
  if (hand.length >= 2 && hand[1].id === t1.id) {
    if (mentsu * 2 + taatsu < 8) {
      minShanten = Math.min(
        minShanten,
        calculateNormalShantenRecursive(hand.slice(2), mentsu, taatsu + 1)
      );
    }
  }
  // カンチャン・ペンチャン
  if (t1.type !== "honor") {
    for (let diff = 1; diff <= 2; diff++) {
      const t2Index = hand.findIndex(
        (t) => t.type === t1.type && t.value === (t1.value as number) + diff
      );
      if (t2Index !== -1) {
        if (mentsu * 2 + taatsu < 8) {
          const nextHand = [...hand];
          nextHand.splice(t2Index, 1);
          nextHand.splice(0, 1);
          minShanten = Math.min(
            minShanten,
            calculateNormalShantenRecursive(nextHand, mentsu, taatsu + 1)
          );
        }
      }
    }
  }

  // 4. 何もせず、1枚を孤立牌として扱う
  minShanten = Math.min(
    minShanten,
    calculateNormalShantenRecursive(hand.slice(1), mentsu, taatsu)
  );

  return minShanten;
};

// 通常手のシャンテン数を計算するメイン関数
const getNormalShanten = (hand: Tile[]): number => {
  let minShanten = 8;
  const sortedHand = sortTiles(hand);
  const counts = getTileCounts(hand);

  // 雀頭候補をすべて試す
  for (const id in counts) {
    if (counts[id] >= 2) {
      const handWithoutPair = [...sortedHand];
      handWithoutPair.splice(
        handWithoutPair.findIndex((t) => t.id === id),
        1
      );
      handWithoutPair.splice(
        handWithoutPair.findIndex((t) => t.id === id),
        1
      );
      minShanten = Math.min(
        minShanten,
        calculateNormalShantenRecursive(handWithoutPair, 0, 0) - 1
      );
    }
  }

  // ヘッドレス（雀頭なし）の場合
  minShanten = Math.min(
    minShanten,
    calculateNormalShantenRecursive(sortedHand, 0, 0)
  );

  return minShanten;
};

/**
 * 手牌全体のシャンテン数を計算します。
 * @param hand - 13枚または14枚の手牌
 * @returns シャンテン数 (和了形は-1)
 */
export const getShanten = (hand: Tile[]): number => {
  const tileCount = hand.length;
  if (tileCount < 1) return 8;

  const counts = getTileCounts(hand);
  let minShanten = 8;

  if (tileCount >= 13) {
    minShanten = Math.min(
      getKokushiShanten(counts),
      getChiitoitsuShanten(counts)
    );
  }

  minShanten = Math.min(minShanten, getNormalShanten(hand));

  return minShanten;
};

/**
 * 和了（あがり）形かどうかを判定します。
 * @param hand - 14枚の手牌
 * @returns 和了形の場合はtrue
 */
export const isWinningHand = (hand: Tile[]): boolean => {
  if (hand.length !== 14) return false;
  return getShanten(hand) === -1;
};

/**
 * 待ち牌を計算します。
 * @param hand - 13枚の手牌
 * @returns 待ち牌の結果リスト
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
      // 既存の待ち牌リストになければ追加
      if (
        !waitingTiles.some((res) =>
          res.waitingTiles.some((wt) => wt.id === tile.id)
        )
      ) {
        waitingTiles.push({
          waitingTiles: [tile],
          waitingType: "Normal Wait",
          waitingTypeJapanese: "通常待ち",
          description: "",
        });
      }
    }
  }
  return waitingTiles;
};

// --- ヘルパー関数 ---
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

// analyzeHand関数は変更なし
export const analyzeHand = (hand: Tile[]): ScoringHand | null => {
  if (!isWinningHand(hand)) return null;
  return null;
};
