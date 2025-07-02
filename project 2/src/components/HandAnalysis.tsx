import React from 'react';
import { Award, Calculator, Star } from 'lucide-react';
import { Tile, ScoringHand } from '../types/mahjong';
import { analyzeHand } from '../utils/mahjongLogic';

interface HandAnalysisProps {
  hand: Tile[];
}

const HandAnalysis: React.FC<HandAnalysisProps> = ({ hand }) => {
  if (hand.length !== 14) {
    return null;
  }

  const analysis = analyzeHand(hand);

  if (!analysis) {
    return (
      <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-100">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">手牌分析 / Hand Analysis</h3>
        </div>
        <p className="text-red-600">この手牌は完成していません / This hand is not complete</p>
      </div>
    );
  }

  const getScoreColor = (han: number) => {
    if (han >= 13) return 'text-purple-600 bg-purple-100';
    if (han >= 6) return 'text-red-600 bg-red-100';
    if (han >= 3) return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getScoreLabel = (han: number) => {
    if (han >= 13) return '役満 / Yakuman';
    if (han >= 11) return '三倍満 / Sanbaiman';
    if (han >= 8) return '倍満 / Baiman';
    if (han >= 6) return '跳満 / Haneman';
    if (han >= 5) return '満貫 / Mangan';
    return '通常 / Regular';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-purple-100">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">手牌分析 / Hand Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">翻数 / Han</span>
          </div>
          <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(analysis.han)}`}>
            {analysis.han}翻
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">符 / Fu</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">
            {analysis.fu}符
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-600">点数 / Score</span>
          </div>
          <div className="text-2xl font-bold text-green-600 bg-green-100 px-3 py-1 rounded-lg">
            {analysis.score.toLocaleString()}点
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">役 / Yaku</h4>
        {analysis.yaku.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {analysis.yaku.map((yaku, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium"
              >
                {yaku}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">役なし / No yaku</p>
        )}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-700">{getScoreLabel(analysis.han)}</span>
        </div>
        <p className="text-sm text-purple-600">
          {analysis.han >= 13 
            ? '最高得点の役満です！' 
            : analysis.han >= 5 
            ? '高得点の手牌です！' 
            : '基本的な得点の手牌です。'}
        </p>
      </div>
    </div>
  );
};

export default HandAnalysis;