CREATE TYPE "public"."loan_app_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('ACTIVE', 'COMPLETED', 'DEFAULTED');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('EMAIL', 'SMS');--> statement-breakpoint
CREATE TYPE "public"."repayment_status" AS ENUM('PENDING', 'PAID', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('LENDER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "borrowers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"bvn" varchar(20),
	"nin" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loan_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_app_id" uuid NOT NULL,
	"borrower_id" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"duration_months" integer NOT NULL,
	"interest_rate" numeric NOT NULL,
	"status" "loan_app_status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loan_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"default_interest_rate" numeric NOT NULL,
	"default_duration_months" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "loan_apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"lender_id" uuid NOT NULL,
	"borrower_id" uuid NOT NULL,
	"principal" numeric NOT NULL,
	"interest" numeric NOT NULL,
	"total_payable" numeric NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"status" "loan_status" DEFAULT 'ACTIVE'
);
--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "newsletters_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"borrower_id" uuid,
	"type" "notification_type" NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"borrower_id" uuid NOT NULL,
	"provider" varchar(50) DEFAULT 'PAYSTACK',
	"authorization_code" text NOT NULL,
	"last4" varchar(4),
	"expiry" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "repayments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_at" timestamp,
	"status" "repayment_status" DEFAULT 'PENDING'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(255),
	"phone" varchar(20),
	"role" "user_role" DEFAULT 'LENDER',
	"paystack_public_key" text,
	"paystack_secret_key" text,
	"reset_password_token" varchar(255),
	"reset_password_expires" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_loan_app_id_loan_apps_id_fk" FOREIGN KEY ("loan_app_id") REFERENCES "public"."loan_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_apps" ADD CONSTRAINT "loan_apps_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_application_id_loan_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repayments" ADD CONSTRAINT "repayments_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE no action ON UPDATE no action;