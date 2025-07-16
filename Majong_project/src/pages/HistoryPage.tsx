import { useState, useEffect } from "react";
import { List, Clock, RefreshCw } from "lucide-react"; // RefreshCwアイコンをインポート
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

  // --- ★ここからが修正のポイントです ---
  // データを取得するロジックを、再利用可能な関数にまとめます
  const fetchHistory = () => {
    setLoading(true); // 更新中であることがわかるようにloadingをtrueに
    setError(null); // エラー表示をリセット

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
        const formattedHistory: FrontendHistoryItem[] = data.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          tiles: item.tiles.map((dbTile) => {
            const isHonor = isNaN(parseInt(dbTile.value, 10));
            const value = isHonor
              ? (dbTile.value as HonorType)
              : Number(dbTile.value);
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
  };

  // ページが最初に読み込まれた時に一度だけデータを取得します
  useEffect(() => {
    fetchHistory();
  }, []);
  // --- ★ここまでが修正のポイントです ---

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
        <p>{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <List className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">入力履歴</h2>
        </div>
        {/* ★ 更新ボタンを追加 */}
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "更新中..." : "更新"}
        </button>
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
