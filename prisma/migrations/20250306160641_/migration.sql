-- CreateTable
CREATE TABLE "Submit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "protocolKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "testingStatus" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    CONSTRAINT "Submit_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submit_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Submit_id_key" ON "Submit"("id");
