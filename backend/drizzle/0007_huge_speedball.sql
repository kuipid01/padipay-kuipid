CREATE TYPE "public"."collection_strategy" AS ENUM('standard', 'aggressive', 'lenient');--> statement-breakpoint
CREATE TYPE "public"."credit_tier" AS ENUM('excellent', 'good', 'fair', 'poor', 'all');--> statement-breakpoint
CREATE TABLE "repayment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_app_id" uuid NOT NULL,
	"name" text NOT NULL,
	"duration_days" integer NOT NULL,
	"interest_rate" double precision NOT NULL,
	"credit_tier" "credit_tier" DEFAULT 'all' NOT NULL,
	"early_repayment_allowed" boolean DEFAULT true,
	"early_repayment_discount" double precision DEFAULT 0,
	"late_fees_percentage" double precision DEFAULT 5 NOT NULL,
	"grace_period_days" integer DEFAULT 3 NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "loan_apps" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "loan_apps" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "loan_apps" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "loan_apps" ADD COLUMN "min_loan_amount" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "loan_apps" ADD COLUMN "max_loan_amount" integer DEFAULT 10000 NOT NULL;--> statement-breakpoint
ALTER TABLE "loan_apps" ADD COLUMN "auto_approval_limit" integer;--> statement-breakpoint
ALTER TABLE "loan_apps" ADD COLUMN "allow_custom_amounts" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "loan_apps" ADD COLUMN "require_credit_check" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "loan_apps" ADD COLUMN "collection_strategy" "collection_strategy" DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "loan_apps" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "repayment_plans" ADD CONSTRAINT "repayment_plans_loan_app_id_loan_apps_id_fk" FOREIGN KEY ("loan_app_id") REFERENCES "public"."loan_apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_apps" DROP COLUMN "default_interest_rate";--> statement-breakpoint
ALTER TABLE "loan_apps" DROP COLUMN "default_duration_months";--> statement-breakpoint
ALTER TABLE "loan_apps" DROP COLUMN "is_active";