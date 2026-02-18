CREATE TYPE "public"."funding_channel" AS ENUM('paystack');--> statement-breakpoint
CREATE TYPE "public"."funding_status" AS ENUM('initiated', 'pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_type" AS ENUM('funding_credit', 'loan_debit', 'repayment_credit', 'fee_debit');--> statement-breakpoint
CREATE TABLE "lender_fundings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lender_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"gross_amount" integer NOT NULL,
	"paystack_fee" integer,
	"platform_fee" integer DEFAULT 20000,
	"net_amount" integer,
	"status" "funding_status" DEFAULT 'initiated' NOT NULL,
	"channel" "funding_channel" DEFAULT 'paystack' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	CONSTRAINT "lender_fundings_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "lender_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lender_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"locked_balance" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" "wallet_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"reference" text,
	"balance_after" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "lender_fundings" ADD CONSTRAINT "lender_fundings_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_wallets" ADD CONSTRAINT "lender_wallets_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_lender_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."lender_wallets"("id") ON DELETE no action ON UPDATE no action;