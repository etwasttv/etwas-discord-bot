-- CreateTable
CREATE TABLE "Timer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mention" TEXT,
    "guildId" TEXT,
    "channelId" TEXT,
    "timerSeconds" INTEGER NOT NULL,
    "message" TEXT,
    "ephemeral" BOOLEAN NOT NULL DEFAULT false,
    "isTriggered" BOOLEAN NOT NULL DEFAULT false,
    "isCanceled" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);
