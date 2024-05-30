-- CreateTable
CREATE TABLE "Room" (
    "roomId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "voiceChannelId" TEXT NOT NULL,
    "textChannelId" TEXT,
    "voice" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("roomId")
);

-- CreateTable
CREATE TABLE "Voice" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "speakerId" INTEGER NOT NULL,

    CONSTRAINT "Voice_pkey" PRIMARY KEY ("guildId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_voiceChannelId_key" ON "Room"("voiceChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_textChannelId_key" ON "Room"("textChannelId");
