import React from "react";
import { Target, TrendingUp, Info } from "lucide-react";
import { WaitingResult } from "../types/mahjong";
import TileComponent from "./TileComponent";

interface WaitingResultsProps {
  results: WaitingResult[];
}

const WaitingResults: React.FC<WaitingResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg mb-2">待ち牌が見つかりません</p>
        <p className="text-sm">No waiting tiles found for this hand</p>
      </div>
    );
  }

  const totalRemainingTiles = results.reduce(
    (sum, result) => sum + (result.remainingTiles || 0),
    0
  );
  const averageProbability =
    results.reduce((sum, result) => sum + (result.probability || 0), 0) /
    results.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            待ち牌 / Waiting Tiles ({results.length} patterns)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>平均確率: {averageProbability.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Info className="w-4 h-4" />
            <span>残り枚数: {totalRemainingTiles}枚</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {result.waitingTiles.map((tile, tileIndex) => (
                  <TileComponent
                    key={`${tile.id}-${tileIndex}`}
                    tile={tile}
                    size="medium"
                    className="shadow-md"
                  />
                ))}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">
                    {result.waitingTypeJapanese}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({result.waitingType})
                  </span>
                  {result.probability && (
                    <div className="ml-auto flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        確率: {result.probability}%
                      </div>
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        残り: {result.remainingTiles}枚
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{result.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            🎯 これらの牌のいずれかでアガリ完成！
          </p>
        </div>
        <p className="text-xs text-green-600">
          Any of these tiles will complete your winning hand. Higher probability
          tiles are more likely to appear.
        </p>
      </div>
    </div>
  );
};

export default WaitingResults;
