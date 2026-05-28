-- VISIONS 16.5 — Fix: 42501 permission denied for table profiles
--
-- The profiles table had RLS policies but the `authenticated` role was
-- never granted base-level CRUD privileges, so every SELECT from a logged-in
-- user failed with PostgreSQL error 42501 (insufficient privilege).
-- RLS filters rows but cannot grant the base privilege — that needs GRANT.
--
-- This caused the blank dashboard + empty Profile form after onboarding:
-- onboarding's upsert silently failed on the SELECT portion (.select().single())
-- and useProfile's later fetch hit the same wall.
--
-- Defensive: grants are applied only to tables that actually exist, so the
-- migration never fails if some table hasn't been created yet (e.g. a later
-- sprint migration wasn't run). Re-runnable / idempotent.

DO $$
DECLARE
  t text;
  crud_tables text[] := ARRAY[
    'profiles',
    'cycle_logs',
    'workouts',
    'workout_sets',
    'workout_templates',
    'template_exercises',
    'meals',
    'meal_items',
    'food_items',
    'weight_logs',
    'body_measurements'
  ];
BEGIN
  FOREACH t IN ARRAY crud_tables LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t
      );
    END IF;
  END LOOP;

  -- Read-only public reference data
  IF to_regclass('public.exercises') IS NOT NULL THEN
    EXECUTE 'GRANT SELECT ON public.exercises TO authenticated';
  END IF;
END $$;
