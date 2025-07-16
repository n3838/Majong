import { BookOpen, RotateCcw, Target, AlertCircle } from "lucide-react";
import { Tile } from "../types/mahjong";
import { sortTiles, getShanten } from "../utils/mahjongLogic";
import TileComponent from "./TileComponent";

// Propsの型定義を修正
interface HandDisplayProps {
  hand: Tile[];
  onRemoveTile: (index: number) => void;
  onClearHand?: () => void;
  loadRandomHand?: () => void; // ★ プロパティ名を「loadRandomHand」に修正しました
}

const HandDisplay: React.FC<HandDisplayProps> = ({
  hand,
  onRemoveTile,
  onClearHand,
  loadRandomHand,
}) => {
  const sortedHand = sortTiles(hand);
  const shanten = hand.length === 13 ? getShanten(hand) : null;

  const getShantenStatus = () => {
    if (hand.length !== 13) return null;
    if (shanten === 0) {
      return {
        text: "テンパイ / Ready Hand",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <Target className="w-4 h-4" />,
      };
    } else if (shanten !== null) {
      return {
        text: `ノーテン (${shanten}向聴) / Not Ready (${shanten} away)`,
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    }
    return null;
  };

  const handleTileClick = (tile: Tile) => {
    const originalIndex = hand.findIndex((t) => t.id === tile.id);
    if (originalIndex !== -1) {
      onRemoveTile(originalIndex);
    }
  };

  const shantenStatus = getShantenStatus();

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">
            現在の手牌 / Current Hand ({hand.length}/13)
          </h3>
          {shantenStatus && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${shantenStatus.color}`}
            >
              {shantenStatus.icon}
              {shantenStatus.text}
            </div>
          )}
        </div>

        {/* 呼び出す関数を「loadRandomHand」に修正しました */}
        <div className="flex items-center gap-2">
          {loadRandomHand && (
            <button
              onClick={loadRandomHand}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 
                                text-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              ランダム
            </button>
          )}
          {onClearHand && hand.length > 0 && (
            <button
              onClick={onClearHand}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 
                                text-gray-700 rounded-lg transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              リセット
            </button>
          )}
        </div>
      </div>

      <div className="min-h-20 bg-white rounded-lg p-4 border-2 border-dashed border-gray-200">
        {sortedHand.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-gray-400">
            牌を選択してください / Select tiles to add to your hand
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedHand.map((tile, index) => (
              <div key={`${tile.id}-${index}`} className="relative group">
                <TileComponent
                  tile={tile}
                  size="medium"
                  onClick={() => handleTileClick(tile)}
                  className="cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200 
                           hover:ring-2 hover:ring-red-300 hover:ring-opacity-50"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HandDisplay;
