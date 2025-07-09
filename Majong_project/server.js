import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/hands', async (req, res) => {
  try {
    const { tiles } = req.body;

    if (!tiles || !Array.isArray(tiles) || tiles.length !== 13) {
      return res.status(400).json({ error: '13枚の手牌が必要です。' });
    }

    const newHand = await prisma.handHistory.create({
      data: {
        tiles: {
          create: tiles,
        },
      },
    });

    res.status(201).json(newHand);
  } catch (error) {
    console.error('手牌の記録に失敗しました:', error);
    res.status(500).json({ error: 'サーバーでエラーが発生しました。' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で起動しました`);
});
