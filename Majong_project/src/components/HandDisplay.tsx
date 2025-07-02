import React from 'react';
import { X, Target, Calculator, AlertCircle } from 'lucide-react';
import { Tile } from '../types/mahjong';
import { sortTiles, getShanten } from '../utils/mahjongLogic';
import TileComponent from './TileComponent';

interface HandDisplayProps {
  hand: Tile[];
  onRemoveTile: (index: number) => void;
  onClearHand?: () => void;
}

const HandDisplay: React.FC<HandDisplayProps> = ({ hand, onRemoveTile, onClearHand }) => {
  const sortedHand = sortTiles(hand);
  const shanten = hand.length === 13 ? getShanten(hand) : null;
  
  const getShantenStatus = () => {
    if (hand.length === 0) return null;
    
    if (hand.length !== 13) {
      return {
        text: `手牌: ${hand.length}/13`,
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <Calculator className="w-4 h-4" />
      };
    }
    
    if (shanten === 0) {
      return {
        text: 'テンパイ / Ready Hand',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <Target className="w-4 h-4" />
      };
    } else if (shanten !== null) {
      return {
        text: `ノーテン (${shanten}向聴) / Not Ready (${shanten} away)`,
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <AlertCircle className="w-4 h-4" />
      };
    }
    
    return null;
  };

  const handleTileClick = (tile: Tile, displayIndex: number) => {
    // Find the original index in the unsorted hand array
    const originalIndex = hand.findIndex((t, i) => 
      t.type === tile.type && 
      t.value === tile.value && 
      !hand.slice(0, i).some((prev) => 
        prev.type === tile.type && prev.value === tile.value
      )
    );
    
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
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${shantenStatus.color}`}>
              {shantenStatus.icon}
              {shantenStatus.text}
            </div>
          )}
        </div>
        {hand.length > 0 && (
          <button
            onClick={onClearHand}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            すべてクリア
          </button>
        )}
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
                  onClick={() => handleTileClick(tile, index)}
                  className="cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200 
                           hover:ring-2 hover:ring-red-300 hover:ring-opacity-50"
                />
                {/* Hover indicator */}
                <div className="absolute inset-0 bg-red-500 bg-opacity-0 group-hover:bg-opacity-10 
                              rounded-lg transition-all duration-200 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {hand.length > 0 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            牌をクリックして削除 / Click tiles to remove them
          </p>
        </div>
      )}
      
      {hand.length === 13 && shanten === 0 && (
        <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-medium">
            🎯 テンパイです！待ち牌を確認してください / You're in tenpai! Check your waiting tiles
          </p>
        </div>
      )}
      
      {hand.length === 13 && shanten !== null && shanten > 0 && (
        <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
          <p className="text-sm text-red-700 font-medium">
            ❌ ノーテンです（{shanten}向聴）/ Not in tenpai ({shanten} away from ready)
          </p>
        </div>
      )}
      
      {hand.length > 13 && (
        <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
          <p className="text-sm text-red-700 font-medium">
            ⚠ 手牌が多すぎます（{hand.length}/13）/ Too many tiles in hand ({hand.length}/13)
          </p>
        </div>
      )}
    </div>
  );
};

export default HandDisplay;