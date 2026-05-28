-- Fix: exercise body_part filter returned 0 for most muscle groups (e.g. chest)
--
-- The seed script mapped body_part from free-exercise-db's `category` field,
-- but `category` is the training TYPE (strength/cardio/stretching/powerlifting/
-- strongman/plyometrics/olympic weightlifting), NOT a muscle group. So nearly
-- every exercise ended up with body_part='strength' and a few with 'back',
-- while filters like 'chest' matched nothing.
--
-- The real muscle is in `muscle_group` (= primaryMuscles[0]). Recompute
-- body_part from it, using the same coarse grouping as src/lib/bodyParts.ts.

UPDATE public.exercises SET body_part = CASE
  WHEN muscle_group = 'chest'                                                   THEN 'chest'
  WHEN muscle_group IN ('lats', 'middle back', 'lower back', 'traps')           THEN 'back'
  WHEN muscle_group = 'shoulders'                                               THEN 'shoulders'
  WHEN muscle_group IN ('biceps', 'triceps', 'forearms')                        THEN 'arms'
  WHEN muscle_group IN ('quadriceps', 'hamstrings', 'glutes', 'abductors', 'adductors') THEN 'legs'
  WHEN muscle_group = 'calves'                                                  THEN 'calves'
  WHEN muscle_group = 'abdominals'                                              THEN 'abs'
  WHEN muscle_group = 'neck'                                                    THEN 'neck'
  ELSE 'other'
END;

-- Verify distribution after running:
--   SELECT body_part, COUNT(*) FROM public.exercises GROUP BY body_part ORDER BY 2 DESC;
