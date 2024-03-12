-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SongHistories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "song_name" TEXT,
    "time" REAL,
    CONSTRAINT "SongHistories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SongHistories" ("id", "song_name", "time", "user_id") SELECT "id", "song_name", "time", "user_id" FROM "SongHistories";
DROP TABLE "SongHistories";
ALTER TABLE "new_SongHistories" RENAME TO "SongHistories";
CREATE UNIQUE INDEX "SongHistories_id_key" ON "SongHistories"("id");
CREATE UNIQUE INDEX "SongHistories_user_id_key" ON "SongHistories"("user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
