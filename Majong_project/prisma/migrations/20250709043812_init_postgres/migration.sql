-- CreateTable
CREATE TABLE "HandHistory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tile" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "handHistoryId" INTEGER NOT NULL,

    CONSTRAINT "Tile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tile" ADD CONSTRAINT "Tile_handHistoryId_fkey" FOREIGN KEY ("handHistoryId") REFERENCES "HandHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
