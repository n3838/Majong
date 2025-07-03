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

  const getImageUrl = () => {
    const type = tile.type.charAt(0).toUpperCase() + tile.type.slice(1);

    if (tile.type === "honor") {
      const value =
        String(tile.value).charAt(0).toUpperCase() +
        String(tile.value).slice(1);
      return `/Black/${type}-${value}.png`; // 例: /Black/Honor-East.png
    } else {
      const value = tile.value;
      return `/Black/${type}${value}.png`; // 例: /Black/Man1.png
    }
  };

  const imageUrl = getImageUrl();

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
