import { useState, useEffect } from "react";
import { Tile, WaitingResult } from "../types/mahjong";
import {
  calculateWaitingTiles,
  getShanten,
  generateRandomHand,
} from "../utils/mahjongLogic";
import TileSelector from "../components/TileSelector";
import HandDisplay from "../components/HandDisplay";
import WaitingResults from "../components/WaitingResults";

const TenpaiCheckerPage = () => {
  const [hand, setHand] = useState<Tile[]>([]);
  const [waitingResults, setWaitingResults] = useState<WaitingResult[]>([]);

  useEffect(() => {
    if (hand.length === 13) {
      const shanten = getShanten(hand);
      if (shanten === 0) {
        const results = calculateWaitingTiles(hand);
        setWaitingResults(results);
      } else {
        setWaitingResults([]);
      }

      const tilesForApi = hand.map((tile) => ({
        type: tile.type,
        value: String(tile.value),
      }));

      fetch("https://<あなたのAPIサーバーのURL>.onrender.com/api/hands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tiles: tilesForApi }),
      })
        .then((response) => response.json())
        .then((data) => console.log("手牌が記録されました:", data.id))
        .catch((error) => console.error("手牌の記録に失敗しました:", error));
    } else {
      setWaitingResults([]);
    }
  }, [hand]);

  const addTile = (tile: Tile) => {
    if (hand.length < 13) {
      setHand([...hand, tile]);
    }
  };

  const removeTile = (index: number) => {
    setHand(hand.filter((_, i) => i !== index));
  };

  const clearHand = () => {
    setHand([]);
  };

  // ★ サンプル読み込み関数を、ランダム生成関数に修正しました
  const loadRandomHand = () => {
    const randomHand = generateRandomHand();
    setHand(randomHand);
  };

  const tenpaiStatus = (() => {
    if (hand.length !== 13) return null;
    const shanten = getShanten(hand);
    return {
      isTenpai: shanten === 0,
      message: shanten === 0 ? "テンパイ" : `ノーテン (${shanten}向聴)`,
      color:
        shanten === 0
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700",
    };
  })();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <TileSelector onTileSelect={addTile} hand={hand} />
      </div>
      <div className="xl:col-span-2 space-y-8">
        {/* ★ HandDisplayに渡すプロパティ名を「loadRandomHand」に修正しました */}
        <HandDisplay
          hand={hand}
          onRemoveTile={removeTile}
          onClearHand={clearHand}
          loadRandomHand={loadRandomHand}
        />
        {hand.length === 13 && tenpaiStatus && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div
              className={`p-4 rounded-lg text-center font-bold text-lg ${tenpaiStatus.color}`}
            >
              {tenpaiStatus.message}
            </div>
            {tenpaiStatus.isTenpai && (
              <div className="mt-6">
                <WaitingResults results={waitingResults} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenpaiCheckerPage;
