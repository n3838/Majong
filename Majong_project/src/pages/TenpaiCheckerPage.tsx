import { useState, useEffect } from "react";
import { Tile, WaitingResult } from "../types/mahjong";
import { calculateWaitingTiles, getShanten } from "../utils/mahjongLogic";
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

      // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      // ★ 必ず、次の行のURLをあなたのRender APIサーバーのURLに書き換えてください ★
      // ★ 例: 'https://mahjong-api-xyz.onrender.com/api/hands'             ★
      // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      fetch("https://majong-api.onrender.com/api/hands", {
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

  const loadSampleHand = () => {
    const sampleTiles: Tile[] = [
      { type: "man", value: 1, id: "man-1" },
      { type: "man", value: 2, id: "man-2" },
      { type: "man", value: 3, id: "man-3" },
      { type: "man", value: 4, id: "man-4" },
      { type: "man", value: 5, id: "man-5" },
      { type: "man", value: 6, id: "man-6" },
      { type: "man", value: 7, id: "man-7" },
      { type: "honor", value: "east", id: "honor-east-1" },
      { type: "honor", value: "east", id: "honor-east-2" },
      { type: "honor", value: "east", id: "honor-east-3" },
      { type: "honor", value: "white", id: "honor-white-1" },
      { type: "honor", value: "white", id: "honor-white-2" },
      { type: "sou", value: 9, id: "sou-9" },
    ];
    setHand(sampleTiles);
  };

  const tenpaiStatus = (() => {
    if (hand.length !== 13) return null;
    const shanten = getShanten(hand);
    return {
      isTenpai: shanten === 0,
      message: shanten === 0 ? "テンパイ" : `ノーテン (${shanten}向聴)`,
    };
  })();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <TileSelector onTileSelect={addTile} hand={hand} />
      </div>
      <div className="xl:col-span-2 space-y-8">
        <HandDisplay
          hand={hand}
          onRemoveTile={removeTile}
          onClearHand={clearHand}
          loadSampleHand={loadSampleHand}
        />
        {hand.length === 13 && tenpaiStatus?.isTenpai && (
          <WaitingResults results={waitingResults} />
        )}
        {hand.length === 13 && !tenpaiStatus?.isTenpai && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center py-8 text-gray-500">
            <p className="text-lg mb-2">{tenpaiStatus?.message}</p>
            <p className="text-sm">この手牌はテンパイしていません。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenpaiCheckerPage;
