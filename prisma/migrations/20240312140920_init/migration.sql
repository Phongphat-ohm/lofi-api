-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'credential',
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile_url" TEXT,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongHistories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "song_name" TEXT,
    "time" DOUBLE PRECISION,

    CONSTRAINT "SongHistories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_key" ON "Users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SongHistories_id_key" ON "SongHistories"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SongHistories_user_id_key" ON "SongHistories"("user_id");

-- AddForeignKey
ALTER TABLE "SongHistories" ADD CONSTRAINT "SongHistories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
