-- Preserve the career context supplied at booking time. These are separate
-- from the mutable candidate profile so staff can understand the request as
-- it was made.
ALTER TABLE "bookings"
  ADD COLUMN "targetRole" TEXT,
  ADD COLUMN "additionalContext" TEXT;
