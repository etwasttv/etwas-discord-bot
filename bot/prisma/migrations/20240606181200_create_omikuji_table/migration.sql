-- CreateTable
CREATE TABLE "Omikuji" (
    "userId" TEXT NOT NULL,
    "omikuji" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Omikuji_pkey" PRIMARY KEY ("userId")
);
