-- VISIONS 16.12 — Custom exercises
--
-- Until now `exercises` was read-only for users (GRANT SELECT only). To let
-- users create their own exercises we enable RLS with policies that:
--   - keep all global exercises (is_custom = false) readable by everyone,
--   - let a user read/insert/update/delete only their OWN custom exercises.
--
-- Safe for existing data: all 873 seeded exercises have is_custom = false,
-- so the SELECT policy keeps them visible. The service-role seed bypasses RLS.
-- Idempotent / re-runnable.

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Read: global exercises + your own custom ones
DROP POLICY IF EXISTS "exercises_select" ON public.exercises;
CREATE POLICY "exercises_select" ON public.exercises
  FOR SELECT USING (is_custom = false OR created_by = auth.uid());

-- Insert: only your own custom exercises
DROP POLICY IF EXISTS "exercises_insert_own" ON public.exercises;
CREATE POLICY "exercises_insert_own" ON public.exercises
  FOR INSERT WITH CHECK (created_by = auth.uid() AND is_custom = true);

-- Update: only your own custom exercises
DROP POLICY IF EXISTS "exercises_update_own" ON public.exercises;
CREATE POLICY "exercises_update_own" ON public.exercises
  FOR UPDATE USING (created_by = auth.uid() AND is_custom = true);

-- Delete: only your own custom exercises
DROP POLICY IF EXISTS "exercises_delete_own" ON public.exercises;
CREATE POLICY "exercises_delete_own" ON public.exercises
  FOR DELETE USING (created_by = auth.uid() AND is_custom = true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
