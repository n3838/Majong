/*
  Warnings:

  - You are about to drop the `Problem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `problemId` on the `Tile` table. All the data in the column will be lost.
  - Added the required column `handHistoryId` to the `Tile` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Problem";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "HandHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "handHistoryId" INTEGER NOT NULL,
    CONSTRAINT "Tile_handHistoryId_fkey" FOREIGN KEY ("handHistoryId") REFERENCES "HandHistory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tile" ("id", "type", "value") SELECT "id", "type", "value" FROM "Tile";
DROP TABLE "Tile";
ALTER TABLE "new_Tile" RENAME TO "Tile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
