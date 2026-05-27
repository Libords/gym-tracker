-- VISIONS 16.6 — Cycle tracking visibility & remove local partner tracking
--
-- Female users now opt-in to cycle tracking via profile setting.
-- Male users no longer enter partner cycle data locally (UI removed).
-- Existing cycle_logs rows are preserved (no deletion); only UI access changes.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cycle_tracking_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN profiles.cycle_tracking_enabled IS
  'Opt-in flag for women — when FALSE, Cyklus tab is hidden from Progress. '
  'Default FALSE for new users; backfilled TRUE for existing women with cycle logs.';

-- Backfill: existing women who already log their own cycles keep tracking visible
UPDATE profiles p
SET cycle_tracking_enabled = TRUE
WHERE p.gender = 'female'
  AND EXISTS (
    SELECT 1 FROM cycle_logs c
    WHERE c.user_id = p.id AND c.is_partner = FALSE
  );

-- Note: `profiles.has_partner_cycle` column and `cycle_logs.is_partner` flag
-- are intentionally kept in the schema. Male partner-cycle UI is removed, but
-- existing rows are preserved in case future couple-linking (VISIONS 15.5)
-- reactivates the feature with proper account linking.
