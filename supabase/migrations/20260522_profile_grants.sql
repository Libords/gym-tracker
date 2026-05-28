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

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Defensive: same fix for other user-owned tables that might share the
-- problem. If grants are already in place, GRANT is idempotent (no-op).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cycle_logs        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workouts          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sets      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.template_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meals             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_items        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_items        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weight_logs       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_measurements TO authenticated;

-- Read-only public data
GRANT SELECT ON public.exercises TO authenticated;
