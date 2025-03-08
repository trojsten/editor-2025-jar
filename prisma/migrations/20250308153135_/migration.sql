-- CreateTable
CREATE TABLE "_ProblemToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProblemToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProblemToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProblemToTeam_AB_unique" ON "_ProblemToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_ProblemToTeam_B_index" ON "_ProblemToTeam"("B");
