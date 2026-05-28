-- VISIONS 16.11 — Warmup sets
--
-- Mark a set as a warmup (Strong's "W"). Warmup sets are shown but excluded
-- from working volume, max weight, 1RM and PR detection.

ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS is_warmup boolean NOT NULL DEFAULT false;
