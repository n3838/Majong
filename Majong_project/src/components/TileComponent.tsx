import React from "react";
import { Tile } from "../types/mahjong";

interface TileComponentProps {
  tile: Tile;
  onClick?: () => void;
  className?: string;
  size?: "small" | "medium" | "large";
}

const TileComponent: React.FC<TileComponentProps> = ({
  tile,
  onClick,
  className = "",
  size = "medium",
}) => {
  const sizeClasses = {
    small: "w-8 h-12",
    medium: "w-12 h-16",
    large: "w-16 h-20",
  };

  const getFileName = () => {
    switch (tile.type) {
      case "man":
        return `Man${tile.value}.png`;
      case "pin":
        return `Pin${tile.value}.png`;
      case "sou":
        return `Sou${tile.value}.png`;
      case "honor":
        switch (tile.value) {
          case "east":
            return "Ton.png";
          case "south":
            return "Nan.png";
          case "west":
            return "Shaa.png";
          case "north":
            return "Pei.png";
          case "white":
            return "Haku.png";
          case "green":
            return "Hatsu.png";
          case "red":
            return "Chun.png";
        }
    }
    return ""; // 見つからない場合
  };

  // ここを修正しました
  const imageUrl = `/Regular/${getFileName()}`;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-white border-2 border-gray-300 rounded-lg
        flex items-center justify-center
        cursor-pointer transition-all duration-200
        hover:scale-105 hover:shadow-lg overflow-hidden
        ${className}
      `}
      onClick={onClick}
    >
      <img
        src={imageUrl}
        alt={`${tile.type} ${tile.value}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          (
            e.target as HTMLImageElement
          ).parentElement!.innerHTML = `<div class="text-xs text-center text-red-500 p-1">画像<br>Error</div>`;
        }}
      />
    </div>
  );
};

export default TileComponent;
