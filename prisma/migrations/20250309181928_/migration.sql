/*
  Warnings:

  - You are about to alter the column `backspaceReturn` on the `Team` table. The data in that column could be lost. The data in that column will be cast from `Boolean` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "scanIncrement" INTEGER NOT NULL DEFAULT 1,
    "scanDecrement" INTEGER NOT NULL DEFAULT 1,
    "backspaceReturn" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Team" ("backspaceReturn", "id", "name", "password", "scanDecrement", "scanIncrement") SELECT "backspaceReturn", "id", "name", "password", "scanDecrement", "scanIncrement" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_id_key" ON "Team"("id");
CREATE UNIQUE INDEX "Team_password_key" ON "Team"("password");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
