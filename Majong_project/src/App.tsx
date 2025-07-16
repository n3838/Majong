import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Sparkles, List } from "lucide-react";
import TenpaiCheckerPage from "./pages/TenpaiCheckerPage";
import HistoryPage from "./pages/HistoryPage";

// 全ページ共通のレイアウト（ヘッダーとメイン領域）
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">麻雀ツールズ</h1>
        </div>
        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "text-gray-500 hover:bg-gray-100"
              }`
            }
          >
            <Sparkles size={16} />
            テンパイ判定
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "text-gray-500 hover:bg-gray-100"
              }`
            }
          >
            <List size={16} />
            入力履歴
          </NavLink>
        </div>
      </nav>
    </header>
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<TenpaiCheckerPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
