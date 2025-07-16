import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ★ここからが新しいAPIです ---
// 記録されたすべての手牌履歴を取得する
app.get("/api/hands/history", async (req, res) => {
  try {
    const history = await prisma.handHistory.findMany({
      orderBy: {
        createdAt: "desc", // 新しいものが上にくるように降順でソート
      },
      include: {
        tiles: true, // 各履歴に関連する牌のデータも一緒に取得
      },
    });
    res.json(history);
  } catch (error) {
    console.error("履歴の取得に失敗しました:", error);
    res.status(500).json({ error: "サーバーでエラーが発生しました。" });
  }
});
// --- ★ここまでが新しいAPIです ---

// 手牌を記録するAPI（これは変更なし）
app.post("/api/hands", async (req, res) => {
  try {
    const { tiles } = req.body;
    if (!tiles || !Array.isArray(tiles) || tiles.length !== 13) {
      return res.status(400).json({ error: "13枚の手牌が必要です。" });
    }
    const newHand = await prisma.handHistory.create({
      data: {
        tiles: { create: tiles },
      },
    });
    res.status(201).json(newHand);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "サーバーでエラーが発生しました。" });
  }
});

app.listen(port, () => {
  console.log(`✅ APIサーバーが http://localhost:${port} で起動しました`);
});
