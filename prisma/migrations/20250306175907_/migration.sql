-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Submit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "protocolKey" TEXT NOT NULL,
    "status" TEXT,
    "testingStatus" TEXT,
    "protocol" TEXT NOT NULL,
    CONSTRAINT "Submit_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submit_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Submit" ("id", "problemId", "protocol", "protocolKey", "publicId", "status", "teamId", "testingStatus") SELECT "id", "problemId", "protocol", "protocolKey", "publicId", "status", "teamId", "testingStatus" FROM "Submit";
DROP TABLE "Submit";
ALTER TABLE "new_Submit" RENAME TO "Submit";
CREATE UNIQUE INDEX "Submit_id_key" ON "Submit"("id");
CREATE UNIQUE INDEX "Submit_publicId_key" ON "Submit"("publicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
