CREATE TABLE "payout_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_number" varchar(20) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"currency" varchar(10) DEFAULT 'NGN',
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" varchar(50) DEFAULT 'Africa/Lagos';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "language" varchar(20) DEFAULT 'English';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_two_factor_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "brand_logo_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "brand_color" varchar(10) DEFAULT '#0D4715';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_notify_new_application" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_notify_payment_received" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_notify_payment_failed" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_notify_loan_overdue" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sms_notify_critical_only" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "payout_accounts" ADD CONSTRAINT "payout_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;