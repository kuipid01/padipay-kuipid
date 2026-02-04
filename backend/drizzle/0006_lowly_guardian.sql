CREATE TABLE "loan_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"min_loan_amount" integer DEFAULT 10000 NOT NULL,
	"max_loan_amount" integer DEFAULT 5000000 NOT NULL,
	"default_interest_rate" numeric(5, 2) DEFAULT '5.00' NOT NULL,
	"grace_period_days" integer DEFAULT 3 NOT NULL,
	"require_government_id" boolean DEFAULT true NOT NULL,
	"require_proof_of_address" boolean DEFAULT true NOT NULL,
	"require_bank_statement" boolean DEFAULT false NOT NULL,
	"require_utility_bill" boolean DEFAULT false NOT NULL,
	"require_employment_letter" boolean DEFAULT false NOT NULL,
	"require_bvn_verification" boolean DEFAULT true NOT NULL,
	"require_phone_verification" boolean DEFAULT true NOT NULL,
	"require_bank_account_validation" boolean DEFAULT true NOT NULL,
	"require_credit_bureau_check" boolean DEFAULT false NOT NULL,
	"auto_approve_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "loan_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "loan_preferences" ADD CONSTRAINT "loan_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;