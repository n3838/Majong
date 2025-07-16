import { useState, useEffect } from "react";
import { List, Clock } from "lucide-react";
import { Tile, TileType, HonorType } from "../types/mahjong";
import TileComponent from "../components/TileComponent";
import { sortTiles, createTile } from "../utils/mahjongLogic";

// APIから受け取る履歴データの型
interface ApiHistoryItem {
  id: number;
  createdAt: string;
  tiles: {
    type: string;
    value: string;
  }[];
}

// フロントエンドで使う履歴データの型
interface FrontendHistoryItem {
  id: number;
  createdAt: string;
  tiles: Tile[]; // フロントエンドのTile型を使う
}

const HistoryPage = () => {
  const [history, setHistory] = useState<FrontendHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★ 必ず、次の行のURLをあなたのRender APIサーバーのURLに書き換えてください ★
    // ★ 例: 'https://mahjong-api-xyz.onrender.com/api/hands/history'    ★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    fetch("https://majong-api.onrender.com/api/hands/history")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`サーバーエラー: ${res.status}`);
        }
        return res.json();
      })
      .then((data: ApiHistoryItem[]) => {
        // --- ★ここが修正のポイントです ---
        // APIから受け取ったデータを、フロントエンドで使える形式に変換します
        const formattedHistory: FrontendHistoryItem[] = data.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          tiles: item.tiles.map((dbTile) => {
            // valueが数字か字牌かを判定して、正しい型に変換します
            const isHonor = isNaN(parseInt(dbTile.value, 10));
            const value = isHonor
              ? (dbTile.value as HonorType)
              : Number(dbTile.value);
            // createTileを使って、idを含む正しいTileオブジェクトを再生成します
            return createTile(dbTile.type as TileType, value);
          }),
        }));

        setHistory(formattedHistory);
      })
      .catch((err) => {
        console.error("履歴の取得に失敗:", err);
        setError(
          "履歴の読み込みに失敗しました。サーバーが起動しているか、URLが正しいか確認してください。"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // このフックはページ読み込み時に一度だけ実行されます

  if (loading) {
    return (
      <div className="text-center p-8 text-gray-500">
        履歴を読み込んでいます...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <List className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">入力履歴</h2>
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          まだ記録された手牌がありません。
        </p>
      ) : (
        <div className="space-y-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Clock size={16} />
                <span>{new Date(item.createdAt).toLocaleString("ja-JP")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sortTiles(item.tiles).map((tile, index) => (
                  <TileComponent
                    key={`${tile.id}-${index}`}
                    tile={tile}
                    size="small"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
