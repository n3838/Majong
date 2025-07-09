import express from "express";
import cors from "cors"; // corsをインポート
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001; // Renderが指定するポートで起動

app.use(cors()); // すべてのドメインからの通信を許可
app.use(express.json());

// 手牌を記録するAPI
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
  console.log(`✅ APIサーバーがポート ${port} で起動しました`);
});
