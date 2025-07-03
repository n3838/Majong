import React, { useState } from "react";
import { Tile, TileType, HonorType } from "../types/mahjong";
import { createTile } from "../utils/mahjongLogic";
import TileComponent from "./TileComponent";

interface TileSelectorProps {
  onTileSelect: (tile: Tile) => void;
  hand: Tile[];
}

const TileSelector: React.FC<TileSelectorProps> = ({ onTileSelect, hand }) => {
  const [selectedSuit, setSelectedSuit] = useState<TileType | "all">("all");

  const getTileCount = (type: TileType, value: number | HonorType): number => {
    return hand.filter((tile) => tile.type === type && tile.value === value)
      .length;
  };

  const renderNumberTiles = (type: TileType) => {
    if (selectedSuit !== "all" && selectedSuit !== type) return null;

    const tiles = [];
    for (let i = 1; i <= 9; i++) {
      const count = getTileCount(type, i);
      const isDisabled = count >= 4 || hand.length >= 13;

      tiles.push(
        <div key={`${type}-${i}`} className="relative">
          <TileComponent
            tile={createTile(type, i)}
            onClick={() => !isDisabled && onTileSelect(createTile(type, i))}
            size="small"
            className={`m-1 ${
              isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
            }`}
          />
          {count > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {count}
            </div>
          )}
        </div>
      );
    }
    return tiles;
  };

  const renderHonorTiles = () => {
    if (selectedSuit !== "all" && selectedSuit !== "honor") return null;

    const honors: HonorType[] = [
      "east",
      "south",
      "west",
      "north",
      "white",
      "green",
      "red",
    ];
    return honors.map((honor) => {
      const count = getTileCount("honor", honor);
      const isDisabled = count >= 4 || hand.length >= 13;

      return (
        <div key={`honor-${honor}`} className="relative">
          <TileComponent
            tile={createTile("honor", honor)}
            onClick={() =>
              !isDisabled && onTileSelect(createTile("honor", honor))
            }
            size="small"
            className={`m-1 ${
              isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
            }`}
          />
          {count > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {count}
            </div>
          )}
        </div>
      );
    });
  };

  const suitButtons = [
    { key: "all", label: "全て", color: "bg-gray-100 text-gray-700" },
    { key: "man", label: "萬子", color: "bg-red-100 text-red-700" },
    { key: "pin", label: "筒子", color: "bg-blue-100 text-blue-700" },
    { key: "sou", label: "索子", color: "bg-green-100 text-green-700" },
    { key: "honor", label: "字牌", color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          牌を選択 / Select Tiles
        </h3>
        <div className="text-sm text-gray-500">{hand.length}/13</div>
      </div>

      {hand.length >= 13 && (
        <div className="mb-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">
            手牌が13枚になりました。これ以上牌を追加できません。
          </p>
        </div>
      )}

      {/* Suit Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suitButtons.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setSelectedSuit(key as TileType | "all")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedSuit === key
                ? color + " ring-2 ring-offset-1 ring-gray-300"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {(selectedSuit === "all" || selectedSuit === "man") && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              萬子 (Characters)
            </h4>
            <div className="flex flex-wrap">{renderNumberTiles("man")}</div>
          </div>
        )}

        {(selectedSuit === "all" || selectedSuit === "pin") && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              筒子 (Circles)
            </h4>
            <div className="flex flex-wrap">{renderNumberTiles("pin")}</div>
          </div>
        )}

        {(selectedSuit === "all" || selectedSuit === "sou") && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              索子 (Bamboo)
            </h4>
            <div className="flex flex-wrap">{renderNumberTiles("sou")}</div>
          </div>
        )}

        {(selectedSuit === "all" || selectedSuit === "honor") && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              字牌 (Honor Tiles)
            </h4>
            <div className="flex flex-wrap">{renderHonorTiles()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TileSelector;
