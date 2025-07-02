import {
  Tile,
  WaitingResult,
  ScoringHand,
  TileType,
  HonorType,
} from "../types/mahjong";

/**
 * 牌のIDを生成します。
 * @param tile - 牌オブジェクト
 * @returns 牌の一意なID
 */
const tileToId = (tile: Tile): string => `${tile.type}-${tile.value}`;

/**
 * 牌オブジェクトを生成します。
 * @param type - 牌の種類 (man, pin, sou, honor)
 * @param value - 牌の値
 * @returns 生成された牌オブジェクト
 */
export const createTile = (type: TileType, value: number | HonorType): Tile => {
  return { type, value, id: `${type}-${value}` };
};

/**
 * 手牌をソートします。
 * @param tiles - ソートする手牌
 * @returns ソート済みの手牌
 */
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
    if (a.type !== b.type) {
      return suitOrder[a.type] - suitOrder[b.type];
    }
    if (a.type === "honor") {
      return (
        honorOrder[a.value as HonorType] - honorOrder[b.value as HonorType]
      );
    }
    return (a.value as number) - (b.value as number);
  });
};

/**
 * 和了（あがり）形かどうかを判定するヘルパー関数
 * @param hand - 14枚の手牌
 * @returns 和了形の場合はtrue
 */
const isWinningHand = (hand: Tile[]): boolean => {
  if (hand.length !== 14) return false;

  // 牌のカウンターを作成
  const counts: { [key: string]: number } = {};
  for (const tile of hand) {
    const id = tileToId(tile);
    counts[id] = (counts[id] || 0) + 1;
  }

  // 国士無双のチェック
  const isKokushi = () => {
    const terminals = [
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
    ];
    let pair = false;
    for (const tile of terminals) {
      if (!counts[tile]) return false;
      if (counts[tile] === 2) pair = true;
    }
    return pair;
  };

  // 七対子のチェック
  const isChiitoitsu = () => {
    let pairs = 0;
    for (const key in counts) {
      if (counts[key] === 2) {
        pairs++;
      }
    }
    return pairs === 7;
  };

  if (isKokushi() || isChiitoitsu()) return true;

  // 4面子1雀頭の判定
  const checkMentsu = (
    currentCounts: { [key: string]: number },
    mentsuCount: number
  ): boolean => {
    if (mentsuCount === 4) return true;

    const firstTileId = Object.keys(currentCounts).find(
      (id) => currentCounts[id] > 0
    );
    if (!firstTileId) return false;

    const tile = parseTileId(firstTileId);

    // 刻子 (3枚同じ牌)
    if (currentCounts[firstTileId] >= 3) {
      const nextCounts = { ...currentCounts };
      nextCounts[firstTileId] -= 3;
      if (nextCounts[firstTileId] === 0) delete nextCounts[firstTileId];
      if (checkMentsu(nextCounts, mentsuCount + 1)) return true;
    }

    // 順子 (続き番号の3枚)
    if (
      tile.type !== "honor" &&
      typeof tile.value === "number" &&
      tile.value <= 7
    ) {
      const seqIds = [
        firstTileId,
        `${tile.type}-${tile.value + 1}`,
        `${tile.type}-${tile.value + 2}`,
      ];
      if (seqIds.every((id) => currentCounts[id])) {
        const nextCounts = { ...currentCounts };
        seqIds.forEach((id) => {
          nextCounts[id]--;
          if (nextCounts[id] === 0) delete nextCounts[id];
        });
        if (checkMentsu(nextCounts, mentsuCount + 1)) return true;
      }
    }

    return false;
  };

  for (const pairId in counts) {
    if (counts[pairId] >= 2) {
      const newCounts = { ...counts };
      newCounts[pairId] -= 2;
      if (newCounts[pairId] === 0) delete newCounts[pairId];
      if (checkMentsu(newCounts, 0)) return true;
    }
  }

  return false;
};

/**
 * 待ち牌を計算します。
 * @param hand - 13枚の手牌
 * @returns 待ち牌の情報
 */
export const calculateWaitingTiles = (hand: Tile[]): WaitingResult[] => {
  if (hand.length !== 13) return [];

  const waitingResults: WaitingResult[] = [];
  const allTiles = getAllPossibleTiles();

  for (const tile of allTiles) {
    if (
      hand.some(
        (h) =>
          h.id === tile.id && hand.filter((t) => t.id === tile.id).length >= 4
      )
    )
      continue;

    const tempHand = sortTiles([...hand, tile]);
    if (isWinningHand(tempHand)) {
      const existing = waitingResults.find((r) =>
        r.waitingTiles.some((wt) => wt.id === tile.id)
      );
      if (!existing) {
        waitingResults.push({
          waitingTiles: [tile],
          waitingType: "Normal Wait",
          waitingTypeJapanese: "一般待ち",
          description: `Awaiting ${tile.value} of ${tile.type} suit.`,
        });
      }
    }
  }

  // TODO: より詳細な待ちの形（両面、嵌張など）を判定するロジックをここに追加
  return waitingResults;
};

/**
 * 向聴数（シャンテンすう）を計算します。
 * @param hand - 13枚の手牌
 * @returns 向聴数
 */
export const getShanten = (hand: Tile[]): number => {
  if (hand.length !== 13) return -1;
  for (const tile of getAllPossibleTiles()) {
    if (isWinningHand([...hand, tile])) {
      return 0; // 聴牌
    }
  }
  // ここでは簡略化して、聴牌でない場合は1向聴としています。
  // 正確な向聴数計算はより複雑なアルゴリズムが必要です。
  return 1;
};

/**
 * 手牌の分析（役や点数計算など）。
 * @param hand - 14枚の和了形の手牌
 * @returns 点数計算結果。和了形でない場合はnull。
 */
export const analyzeHand = (hand: Tile[]): ScoringHand | null => {
  if (!isWinningHand(hand)) return null;
  // この機能は現在実装されていません。
  return null;
};

// ヘルパー関数
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

const parseTileId = (
  id: string
): { type: TileType; value: number | HonorType } => {
  const [type, ...valueParts] = id.split("-");
  const valueStr = valueParts.join("-");
  const numValue = parseInt(valueStr, 10);
  return {
    type: type as TileType,
    value: isNaN(numValue) ? (valueStr as HonorType) : numValue,
  };
};
