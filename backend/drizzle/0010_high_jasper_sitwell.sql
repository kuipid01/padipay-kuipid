CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('Basic', 'Pro', 'Enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'inactive', 'past_due', 'canceled');--> statement-breakpoint
CREATE TABLE "subscription_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "plan" NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"amount" numeric NOT NULL,
	"reference" varchar(255) NOT NULL,
	"paystack_access_code" text,
	"paystack_authorization_url" text,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_payments_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "temp_borrowers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" varchar(20),
	"phone_number_verified" boolean DEFAULT false,
	"email" varchar(255),
	"email_verified" boolean DEFAULT false,
	"bvn" varchar(20),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"middle_name" varchar(255),
	"gender" varchar(20),
	"dob" varchar(50),
	"image" text,
	"kyc_verified" boolean DEFAULT false,
	"address" text,
	"city" varchar(255),
	"state" varchar(255),
	"country" varchar(255) DEFAULT 'Nigeria',
	"employment_type" varchar(50),
	"monthly_income" numeric(12, 2),
	"employer_name" varchar(255),
	"credit_report" jsonb,
	"credit_score" integer,
	"bank_accounts" jsonb DEFAULT '[]'::jsonb,
	"passcode_hash" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "passcode_hash" text;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "first_name" varchar(255);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "last_name" varchar(255);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "middle_name" varchar(255);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "gender" varchar(20);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "dob" varchar(50);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "kyc_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "city" varchar(255);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "state" varchar(255);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "country" varchar(255) DEFAULT 'Nigeria';--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "employment_type" varchar(50);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "monthly_income" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "employer_name" varchar(255);--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "credit_report" jsonb;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "credit_score" integer;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "bank_accounts" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "borrowers" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" "plan" DEFAULT 'Basic';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrowers" DROP COLUMN "full_name";