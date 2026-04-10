-- Add management token to user_alerts for ownership-based GET/DELETE auth.
-- Each alert gets a unique token returned at creation time; callers must
-- present it to read or deactivate the alert.
ALTER TABLE user_alerts
  ADD COLUMN management_token text NOT NULL DEFAULT gen_random_uuid()::text;

-- Index for token lookups (GET and DELETE by token)
CREATE INDEX idx_user_alerts_management_token ON user_alerts (management_token);

-- Add indexes for email and active-status query patterns (high-traffic paths)
CREATE INDEX idx_user_alerts_email ON user_alerts (email);
CREATE INDEX idx_user_alerts_email_active ON user_alerts (email, is_active, created_at DESC);
