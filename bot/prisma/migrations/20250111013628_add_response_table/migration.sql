-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "response" TEXT NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Response_guildId_keyword_key" ON "Response"("guildId", "keyword");
