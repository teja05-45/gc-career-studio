-- Candidate-owned profile details used by the authenticated booking and profile flows.
ALTER TABLE "users"
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "careerStage" "CareerStage",
  ADD COLUMN "currentRole" TEXT,
  ADD COLUMN "targetRole" TEXT,
  ADD COLUMN "experience" TEXT,
  ADD COLUMN "skills" TEXT,
  ADD COLUMN "careerGoals" TEXT;

-- One active appointment can occupy a date/time slot. The application also
-- validates this before insert and turns unique conflicts into a safe message.
CREATE UNIQUE INDEX "bookings_preferredDate_preferredSlot_key"
  ON "bookings"("preferredDate", "preferredSlot");
