-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "scanIncrement" INTEGER NOT NULL DEFAULT 1,
    "scanDecrement" INTEGER NOT NULL DEFAULT 1,
    "backspaceReturn" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Team" ("id", "name", "password", "scanDecrement", "scanIncrement") SELECT "id", "name", "password", "scanDecrement", "scanIncrement" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_id_key" ON "Team"("id");
CREATE UNIQUE INDEX "Team_password_key" ON "Team"("password");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
