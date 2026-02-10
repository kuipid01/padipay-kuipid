ALTER TYPE "public"."user_role" ADD VALUE 'BORROWER';--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"borrower_id" uuid NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_number_masked" varchar(50) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"account_token" text NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "debit_mandates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"borrower_id" uuid NOT NULL,
	"bank_account_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"mandate_reference" varchar(255) NOT NULL,
	"max_amount" numeric(12, 2),
	"status" varchar(20) DEFAULT 'PENDING',
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "debit_mandates_mandate_reference_unique" UNIQUE("mandate_reference")
);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debit_mandates" ADD CONSTRAINT "debit_mandates_borrower_id_borrowers_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrowers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debit_mandates" ADD CONSTRAINT "debit_mandates_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;