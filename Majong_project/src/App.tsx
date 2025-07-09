import { useState, useEffect } from "react";
import { Sparkles, RotateCcw, Info, BookOpen } from "lucide-react";
import { Tile, WaitingResult } from "./types/mahjong";
import { calculateWaitingTiles, getShanten } from "./utils/mahjongLogic";
import TileSelector from "./components/TileSelector";
import HandDisplay from "./components/HandDisplay";
import WaitingResults from "./components/WaitingResults";

function App() {
  const [hand, setHand] = useState<Tile[]>([]);
  const [waitingResults, setWaitingResults] = useState<WaitingResult[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (hand.length === 13) {
      // 聴牌（テンパイ）計算のロジック
      const shanten = getShanten(hand);
      if (shanten === 0) {
        const results = calculateWaitingTiles(hand);
        setWaitingResults(results);
      } else {
        setWaitingResults([]);
      }

      // --- ★ここからが追加するロジックです ---
      // サーバーに送るために、牌のデータをPrismaのスキーマに合うように整形します
      const tilesForApi = hand.map((tile) => ({
        type: tile.type,
        value: String(tile.value), // valueを文字列に統一します
      }));

      // 整形したデータをRender上のAPIサーバーに送信します
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
        .then((response) => {
          if (!response.ok) {
            console.error(
              "サーバーエラー:",
              response.status,
              response.statusText
            );
            return response.json().then((err) => Promise.reject(err));
          }
          return response.json();
        })
        .then((data) => {
          console.log("手牌が記録されました:", data.id);
        })
        .catch((error) => {
          console.error("手牌の記録に失敗しました:", error);
        });
      // --- ★ここまでが追加するロジックです ---
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

  const getTenpaiStatus = () => {
    if (hand.length !== 13) return null;
    const shanten = getShanten(hand);
    return {
      isTenpai: shanten === 0,
      message:
        shanten === 0
          ? "テンパイ / Ready Hand"
          : `ノーテン (${shanten}向聴) / Not Ready (${shanten} away)`,
      color:
        shanten === 0
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-red-100 text-red-700 border-red-200",
    };
  };

  const tenpaiStatus = getTenpaiStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  麻雀テンパイ判定ツール
                </h1>
                <p className="text-sm text-gray-600">
                  Mahjong Tenpai Detection Tool
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSampleHand}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 
                         text-blue-700 rounded-lg transition-colors text-sm font-medium"
              >
                <BookOpen className="w-4 h-4" />
                サンプル
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="使い方 / How to use"
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                onClick={clearHand}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 
                         text-gray-700 rounded-lg transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                リセット
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">
                使い方 / How to Use
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    基本操作 / Basic Operations
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      • 牌を選択して手牌に追加 / Click tiles to add to hand
                    </li>
                    <li>
                      • 手牌の牌をクリックして削除 / Click hand tiles to remove
                    </li>
                    <li>
                      • 13枚でテンパイ判定 / 13 tiles for tenpai detection
                    </li>
                    <li>• 向聴数を自動計算 / Automatic shanten calculation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    機能 / Features
                  </h4>
                  <ul className="space-y-1">
                    <li>• テンパイ・ノーテン判定 / Tenpai/No-ten detection</li>
                    <li>
                      • 待ち牌の種類と確率表示 / Waiting tiles with
                      probabilities
                    </li>
                    <li>• 向聴数表示 / Shanten number display</li>
                    <li>• サンプル手牌で練習 / Practice with sample hands</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1">
            <TileSelector onTileSelect={addTile} hand={hand} />
          </div>
          <div className="xl:col-span-2 space-y-8">
            <HandDisplay
              hand={hand}
              onRemoveTile={removeTile}
              onClearHand={clearHand}
            />
            {hand.length === 13 && tenpaiStatus && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                  <div
                    className={`flex items-center justify-center p-4 rounded-lg border text-lg font-bold ${tenpaiStatus.color}`}
                  >
                    {tenpaiStatus.message}
                  </div>
                  {tenpaiStatus.isTenpai ? (
                    <div className="mt-6">
                      <WaitingResults results={waitingResults} />
                    </div>
                  ) : (
                    <div className="mt-6 text-center py-8 text-gray-500">
                      <p className="text-lg mb-2">ノーテンです</p>
                      <p className="text-sm">
                        この手牌はテンパイしていません。牌を入れ替えてテンパイを目指してください。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {hand.length < 13 && (
              <div className="bg-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">
                    手牌を{13 - hand.length}枚追加してください
                  </p>
                  <p className="text-sm">
                    Add {13 - hand.length} more tiles to check for tenpai
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>麻雀テンパイ判定ツール / Mahjong Tenpai Detection Tool</p>
            <p className="mt-1">
              13枚の手牌でテンパイ・ノーテンを正確に判定 / Accurate tenpai
              detection for 13-tile hands
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
