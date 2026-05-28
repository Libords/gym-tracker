-- VISIONS 16.10 — Exercise images
--
-- free-exercise-db ships an images[] array per exercise (relative paths).
-- We dropped them at import time. Add a column to hold the first image's
-- full raw GitHub URL, then re-run scripts/seed-exercises.ts (upsert by name)
-- to backfill all existing exercises.

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS image_url text;
