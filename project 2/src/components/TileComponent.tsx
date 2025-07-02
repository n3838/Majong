import React from 'react';
import { Tile, HONOR_NAMES } from '../types/mahjong';

interface TileComponentProps {
  tile: Tile;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const TileComponent: React.FC<TileComponentProps> = ({ 
  tile, 
  onClick, 
  className = '', 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-12 text-xs',
    medium: 'w-12 h-16 text-sm',
    large: 'w-16 h-20 text-base'
  };

  const getTileDisplay = () => {
    if (tile.type === 'honor') {
      return HONOR_NAMES[tile.value as keyof typeof HONOR_NAMES].ja;
    }
    return tile.value.toString();
  };

  const getTileColor = () => {
    switch (tile.type) {
      case 'man': return 'text-red-600 border-red-200 bg-red-50';
      case 'pin': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'sou': return 'text-green-600 border-green-200 bg-green-50';
      case 'honor': return 'text-purple-600 border-purple-200 bg-purple-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getSuitSymbol = () => {
    switch (tile.type) {
      case 'man': return '萬';
      case 'pin': return '筒';
      case 'sou': return '索';
      case 'honor': return '';
      default: return '';
    }
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${getTileColor()}
        border-2 rounded-lg flex flex-col items-center justify-center
        font-bold cursor-pointer transition-all duration-200
        hover:scale-105 hover:shadow-lg hover:border-opacity-60
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <span className="leading-none">{getTileDisplay()}</span>
        {tile.type !== 'honor' && (
          <span className="text-xs leading-none mt-0.5">{getSuitSymbol()}</span>
        )}
      </div>
    </div>
  );
};

export default TileComponent;