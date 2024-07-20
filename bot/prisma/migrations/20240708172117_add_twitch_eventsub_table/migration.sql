-- CreateTable
CREATE TABLE "TwitchEventSub" (
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "broadcasterUserId" TEXT NOT NULL,

    CONSTRAINT "TwitchEventSub_pkey" PRIMARY KEY ("guildId","channelId","broadcasterUserId")
);
