-- Migration: Add api_keys table for B2B API access (task 4.1)

DO $$ BEGIN
  CREATE TYPE "api_tier" AS ENUM('free', 'pro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" serial PRIMARY KEY NOT NULL,
  "key_hash" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "owner_email" text NOT NULL,
  "tier" "api_tier" NOT NULL DEFAULT 'free',
  "rate_limit_per_hour" integer NOT NULL DEFAULT 100,
  "is_active" boolean NOT NULL DEFAULT true,
  "last_used_at" timestamp with time zone,
  "request_count_hour" integer NOT NULL DEFAULT 0,
  "window_start_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_api_keys_hash" ON "api_keys" ("key_hash");
CREATE INDEX IF NOT EXISTS "idx_api_keys_email" ON "api_keys" ("owner_email");
