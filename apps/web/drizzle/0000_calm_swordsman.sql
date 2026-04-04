CREATE TYPE "public"."category" AS ENUM('gaming', 'app_stores', 'streaming', 'retail', 'food_dining', 'travel', 'telecom', 'other');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('active', 'stale', 'suppressed', 'expired', 'pending_review');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('official_api', 'affiliate_feed', 'authorized_reseller', 'marketplace_resale', 'crypto_store', 'deal_community', 'public_page');--> statement-breakpoint
CREATE TYPE "public"."trust_zone" AS ENUM('green', 'yellow', 'red');--> statement-breakpoint
CREATE TABLE "affiliate_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"offer_id" integer,
	"source_id" integer,
	"brand_id" integer,
	"referrer_page" text,
	"user_agent_hash" text,
	"ip_hash" text,
	"destination_url" text,
	"affiliate_network" text,
	"affiliate_program_id" text,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" "category" DEFAULT 'other' NOT NULL,
	"description" text,
	"aliases" jsonb DEFAULT '[]'::jsonb,
	"regions_supported" jsonb DEFAULT '[]'::jsonb,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "moderation_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"offer_id" integer,
	"source_id" integer,
	"case_type" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"resolution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"brand_id" integer NOT NULL,
	"original_title" text NOT NULL,
	"normalized_title" text,
	"external_url" text NOT NULL,
	"external_id" text,
	"face_value_cents" integer NOT NULL,
	"asking_price_cents" integer NOT NULL,
	"fee_total_cents" integer DEFAULT 0 NOT NULL,
	"effective_price_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"denomination" text,
	"effective_discount_pct" real NOT NULL,
	"country_redeemable" jsonb DEFAULT '[]'::jsonb,
	"account_region_required" text,
	"resale_restriction_flag" boolean DEFAULT false NOT NULL,
	"trust_zone" "trust_zone" NOT NULL,
	"buyer_protection_level" text,
	"seller_rating" real,
	"seller_name" text,
	"deal_quality_score" integer,
	"confidence_score" integer,
	"final_score" real,
	"status" "offer_status" DEFAULT 'active' NOT NULL,
	"suppression_reason" text,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_verified_at" timestamp with time zone,
	"is_historical_low" boolean DEFAULT false NOT NULL,
	"payment_methods" jsonb,
	"provenance" text DEFAULT 'manual' NOT NULL,
	"raw_snapshot" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"denomination" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"country" text,
	"effective_price_cents" integer NOT NULL,
	"face_value_cents" integer NOT NULL,
	"effective_discount_pct" real NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"requested_url" text,
	"requested_brand" text,
	"requested_region" text,
	"requester_email" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"url" text NOT NULL,
	"source_type" "source_type" NOT NULL,
	"trust_zone" "trust_zone" DEFAULT 'yellow' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"refresh_interval_minutes" integer DEFAULT 60 NOT NULL,
	"last_fetched_at" timestamp with time zone,
	"last_success_at" timestamp with time zone,
	"fetch_success_rate" real DEFAULT 1,
	"has_buyer_protection" boolean DEFAULT false NOT NULL,
	"has_refund_policy" boolean DEFAULT false NOT NULL,
	"contract_notes" text,
	"allowed_fields" jsonb,
	"affiliate_network" text,
	"affiliate_program_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"brand_id" integer,
	"category" "category",
	"target_discount_pct" real,
	"region" text,
	"delivery_channel" text DEFAULT 'email' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_alerts" ADD CONSTRAINT "user_alerts_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_clicks_offer" ON "affiliate_clicks" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "idx_clicks_source" ON "affiliate_clicks" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_clicks_clicked_at" ON "affiliate_clicks" USING btree ("clicked_at");--> statement-breakpoint
CREATE INDEX "idx_offers_brand" ON "offers" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_offers_source" ON "offers" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_offers_status" ON "offers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_offers_score" ON "offers" USING btree ("final_score");--> statement-breakpoint
CREATE INDEX "idx_offers_trust_zone" ON "offers" USING btree ("trust_zone");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_offers_external" ON "offers" USING btree ("source_id","external_id");--> statement-breakpoint
CREATE INDEX "idx_ph_brand_denom" ON "price_history" USING btree ("brand_id","denomination","currency");--> statement-breakpoint
CREATE INDEX "idx_ph_recorded" ON "price_history" USING btree ("recorded_at");