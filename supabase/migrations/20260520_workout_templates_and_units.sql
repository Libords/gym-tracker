-- Migration: workout templates, target values, rest preferences, preferred unit
-- Feature: 001-workout-ux-polish (Sprint I)
-- Date: 2026-05-19
-- Idempotent: lze spustit opakovaně bez chyby.

BEGIN;

-- =========================================================
-- 1. workout_templates
-- =========================================================
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workout_templates_user_updated_idx
  ON public.workout_templates (user_id, updated_at DESC);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wt_select_own" ON public.workout_templates;
CREATE POLICY "wt_select_own" ON public.workout_templates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wt_insert_own" ON public.workout_templates;
CREATE POLICY "wt_insert_own" ON public.workout_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wt_update_own" ON public.workout_templates;
CREATE POLICY "wt_update_own" ON public.workout_templates
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wt_delete_own" ON public.workout_templates;
CREATE POLICY "wt_delete_own" ON public.workout_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger pro updated_at
CREATE OR REPLACE FUNCTION public.tg_workout_templates_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS workout_templates_touch ON public.workout_templates;
CREATE TRIGGER workout_templates_touch
  BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW EXECUTE FUNCTION public.tg_workout_templates_touch();

-- =========================================================
-- 2. template_exercises
-- =========================================================
CREATE TABLE IF NOT EXISTS public.template_exercises (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id       uuid NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id       uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index       int  NOT NULL CHECK (order_index >= 0),
  target_sets       int  NOT NULL DEFAULT 3  CHECK (target_sets >= 1),
  target_reps       int  NOT NULL DEFAULT 10 CHECK (target_reps >= 1),
  target_weight_kg  numeric(6,2) NULL CHECK (target_weight_kg IS NULL OR target_weight_kg >= 0),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, order_index)
);

CREATE INDEX IF NOT EXISTS template_exercises_template_order_idx
  ON public.template_exercises (template_id, order_index);

ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "te_select_own" ON public.template_exercises;
CREATE POLICY "te_select_own" ON public.template_exercises
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workout_templates wt
            WHERE wt.id = template_exercises.template_id AND wt.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "te_insert_own" ON public.template_exercises;
CREATE POLICY "te_insert_own" ON public.template_exercises
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.workout_templates wt
            WHERE wt.id = template_exercises.template_id AND wt.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "te_update_own" ON public.template_exercises;
CREATE POLICY "te_update_own" ON public.template_exercises
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.workout_templates wt
            WHERE wt.id = template_exercises.template_id AND wt.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "te_delete_own" ON public.template_exercises;
CREATE POLICY "te_delete_own" ON public.template_exercises
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.workout_templates wt
            WHERE wt.id = template_exercises.template_id AND wt.user_id = auth.uid())
  );

-- =========================================================
-- 3. profiles — rozšíření o rest default + preferred unit
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_rest_seconds int NOT NULL DEFAULT 90
    CHECK (default_rest_seconds BETWEEN 5 AND 600);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_unit text NOT NULL DEFAULT 'kg'
    CHECK (preferred_unit IN ('kg','lb'));

-- =========================================================
-- 4. workouts — volitelný link na šablonu (analytics)
-- =========================================================
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS template_id uuid NULL
    REFERENCES public.workout_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS workouts_template_idx
  ON public.workouts (template_id) WHERE template_id IS NOT NULL;

COMMIT;
