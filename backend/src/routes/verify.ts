import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import {
  verifyBVN,
  verifyNIN,
  resolveAccount,
  getCreditReport,
  getCreditScore,
} from "../utils/dojah";
import { NewApplicationSchema } from "../zod-schemas/applications";
import { zValidator } from "@hono/zod-validator";

const router = new Hono();

// Auth helper for borrowers
const signBorrowerToken = async (borrower: any) => {
  const { signToken } = await import("../lib/auth");
  return signToken({
    id: borrower.id,
    email: borrower.email,
    role: "BORROWER",
  });
};

// POST /api/verify/passcode
// Set passcode for a borrower (usually after OTP/BVN)
router.post("/passcode", async (c) => {
  try {
    const { email, phone, passcode } = await c.req.json();
    console.log("[PASSCODE] Request received", { email, phone });

    // -----------------------------
    // 1. Validate input
    // -----------------------------
    if (!passcode) {
      console.warn("[BLOCK] Passcode missing");
      return c.json({ status: "error", message: "Passcode is required" }, 400);
    }
    if (!email && !phone) {
      console.warn("[BLOCK] Email or phone missing");
      return c.json(
        { status: "error", message: "Email or phone is required" },
        400,
      );
    }

    // -----------------------------
    // 2. Import DB & utilities
    // -----------------------------
    const { db, tempBorrowers } = await import("../db");
    const { hashPassword } = await import("../lib/auth");

    if (!db || !tempBorrowers) {
      console.error("[BLOCK] Database or tempBorrowers table not available");
      return c.json(
        { status: "error", message: "Server not ready. Try again later." },
        500,
      );
    }

    // -----------------------------
    // 3. Hash passcode
    // -----------------------------
    const hashedPasscode = await hashPassword(passcode);
    console.log("[INFO] Passcode hashed");

    // -----------------------------
    // 4. Create temp borrower
    // -----------------------------
    const newTempBorrower = await db
      .insert(tempBorrowers)
      .values({
        phoneNumber: phone || null,
        email: email || null,
        passcodeHash: hashedPasscode,
        phoneNumberVerified: !!phone,
        emailVerified: !!email,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("[SUCCESS] Temp borrower created", {
      tempBorrowerId: newTempBorrower[0].id,
    });

    return c.json({
      status: "success",
      message: "Passcode set successfully",
      tempBorrowerId: newTempBorrower[0].id,
    });
  } catch (error: any) {
    console.error("[ERROR] /passcode", error);
    return c.json({ status: "error", message: error.message || "Something went wrong" }, 400);
  }
});


// POST /api/verify/login
// Borrower login using email/phone and passcode
router.post("/login", async (c) => {
  try {
    const { identifier, passcode } = await c.req.json();

    if (!identifier || !passcode) {
      return c.json(
        { status: "error", message: "Identifier and passcode are required" },
        400,
      );
    }

    const { eq, or } = await import("drizzle-orm");
    const { db, borrowers } = await import("../db");
    const { comparePassword } = await import("../lib/auth");

    const borrower = await db.query.borrowers.findFirst({
      where: or(
        eq(borrowers.email, identifier),
        eq(borrowers.phone, identifier),
      ),
    });

    if (!borrower || !borrower.passcodeHash) {
      return c.json({ status: "error", message: "Invalid credentials" }, 401);
    }

    const isValid = await comparePassword(passcode, borrower.passcodeHash);
    if (!isValid) {
      return c.json({ status: "error", message: "Invalid credentials" }, 401);
    }

    const token = await signBorrowerToken(borrower);

    return c.json({
      status: "success",
      message: "Login successful",
      token,
      borrower: {
        id: borrower.id,
        firstName: borrower.firstName,
        lastName: borrower.lastName,
        email: borrower.email,
        phone: borrower.phone,
      },
    });
  } catch (error: any) {
    return c.json({ status: "error", message: error.message }, 400);
  }
});

// Verify BVN + Fetch Credit Data
router.post("/bvn", async (c) => {
  try {
    const { bvn, phone, email } = await c.req.json();

    if (!bvn) {
      return c.json({ status: "error", message: "BVN is required" }, 400);
    }

    // 1. Verify BVN
    const result = await verifyBVN(bvn);
    const kycData = result.entity;

    // 2. Fetch Credit Report & Score (Underneath BVN check)
    let creditReport = null;
    let creditScore = null;

    try {
      [creditReport, creditScore] = await Promise.all([
        getCreditReport(bvn),
        getCreditScore(bvn),
      ]);
    } catch (creditError: any) {
      console.warn("[CREDIT CHECK FAILED]", creditError.message);
    }
    if(!creditScore){
       return c.json(
      {
        status: "error",
        message: "Couldnt Verify Credit Score please retry , or try again later",
      },
      400,
    );  
    }

    console.log("CREDIT SCORE,", creditReport);
    console.log("CREDIT creditReport,", creditReport);
    const { eq, or } = await import("drizzle-orm");
    const { db, tempBorrowers, borrowers } = await import("../db");

    // 3. Prepare Update Data
    const updateData = {
      bvn: bvn,
      email: email,
      firstName: kycData.first_name,
      lastName: kycData.last_name,
      middleName: kycData.middle_name,
      gender: kycData.gender,
      dob: kycData.date_of_birth || kycData.dob,
      image: kycData.image,
      kycVerified: true,
      state: kycData.state_of_origin || undefined,
      creditReport: creditReport,
      creditScore: creditScore,
      updatedAt: new Date(),
    };

    // 4. Update or Insert Temp Borrower
    let existingTemp = await db.query.tempBorrowers.findFirst({
      where: or(
        phone ? eq(tempBorrowers.phoneNumber, phone) : undefined,
        eq(tempBorrowers.bvn, bvn),
        email ? eq(tempBorrowers.email, email) : undefined,
      ),
    });

    if (existingTemp) {
      await db
        .update(tempBorrowers)
        .set(updateData)
        .where(eq(tempBorrowers.id, existingTemp.id));
    } else {
      const inserted = await db
        .insert(tempBorrowers)
        .values({
          ...updateData,
          phoneNumber: phone,
          phoneNumberVerified: !!phone,
        })
        .returning();
      existingTemp = inserted[0];
    }

    // 5. Finalize: Create/Update actual borrower record
    if (phone) {
      const existingBorrower = await db.query.borrowers.findFirst({
        where: eq(borrowers.phone, phone),
      });

      const borrowerData = {
        firstName: kycData.first_name,
        lastName: kycData.last_name,
        middleName: kycData.middle_name,
        gender: kycData.gender,
        dob: kycData.date_of_birth || kycData.dob,
        phone,
        email: existingTemp?.email || "",
        bvn: bvn,
        passcodeHash: existingTemp?.passcodeHash || null,
        creditReport: creditReport,
        creditScore: creditScore,
        kycVerified: true,
        updatedAt: new Date(),
      };

      if (existingBorrower) {
        await db
          .update(borrowers)
          .set(borrowerData)
          .where(eq(borrowers.id, existingBorrower.id));
      } else {
        await db.insert(borrowers).values(borrowerData);
      }
    }

    return c.json({
      status: "success",
      message: "BVN verified and credit profile updated",
      data: {
        firstName: kycData.first_name,
        lastName: kycData.last_name,
        phone: phone,
        creditScore: creditScore,
      },
    });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return c.json(
      {
        status: "error",
        message: error.message || "Verification failed",
      },
      400,
    );
  }
});

// POST /api/verify/profile-details
// Save extra fields like state, city, country, employment type, monthly income
router.post(
  "/profile-details",
  zValidator("json", NewApplicationSchema),
  async (c) => {
    console.log("[POST /profile-details] Incoming request");

    try {
      const body = c.req.valid("json");
      const {
        phone: phoneNumber,
        address,
        city,
        state,
        employmentType,
        wagesRange,
      } = body;

      console.log("[INPUT]", body);

      // -----------------------------
      // 1. Guard: phone number
      // -----------------------------
      if (!phoneNumber || phoneNumber.trim() === "") {
        console.error("[BLOCK] Missing phone number");
        return c.json(
          { status: "error", message: "Phone number is required" },
          400,
        );
      }

      const { eq } = await import("drizzle-orm");
      const { db, borrowers } = await import("../db");

      // -----------------------------
      // 2. Check existing temp borrower
      // -----------------------------
      console.log("[STEP 1] Checking temp borrower", phoneNumber);

      const existing = await db.query.borrowers.findFirst({
        where: eq(borrowers.phone, phoneNumber),
      });

      // -----------------------------
      // 3. Insert or update
      // -----------------------------
      if (!existing) {
        console.error("[BLOCK] Missing borrower");
        return c.json(
          { status: "error", message: "Borrower record not found" },
          400,
        );
      } else {
        console.log("[STEP 2] Updating borrower", {
          borrowerId: existing.id,
        });

        await db
          .update(borrowers)
          .set({
            address,
            city,
            state,
            country: "Nigeria",
            employmentType,
            monthlyIncome: wagesRange,
            employerName: null,
            updatedAt: new Date(),
          })
          .where(eq(borrowers.id, existing.id));
      }

      console.log("[SUCCESS] Profile details saved", phoneNumber);

      return c.json({
        status: "success",
        message: "Profile details updated",
      });
    } catch (error: any) {
      console.error("[ERROR] /profile-details", error);

      return c.json(
        {
          status: "error",
          message: error?.message ?? "Something went wrong",
        },
        400,
      );
    }
  },
);

// Protected routes below
router.use("*", authMiddleware);

// Verify NIN
router.post("/nin", async (c) => {
  try {
    const { nin, phoneNumber } = await c.req.json();
    const result = await verifyNIN(nin);

    // Save to temp_borrowers
    const { eq, or } = await import("drizzle-orm");
    const { db, tempBorrowers } = await import("../db");

    const kycData = result.entity;

    const existing = await db.query.tempBorrowers.findFirst({
      where: or(
        phoneNumber ? eq(tempBorrowers.phoneNumber, phoneNumber) : undefined,
        eq(tempBorrowers.bvn, kycData.bvn || ""), // Some NIN lookups return BVN
      ),
    });

    const updateData = {
      firstName: kycData.first_name,
      lastName: kycData.last_name,
      middleName: kycData.middle_name,
      gender: kycData.gender,
      dob: kycData.date_of_birth || kycData.dob,
      image: kycData.image || kycData.photo,
      kycVerified: true,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(tempBorrowers)
        .set(updateData)
        .where(eq(tempBorrowers.id, existing.id));
    }

    return c.json({
      status: "success",
      data: {
        firstName: kycData.first_name,
        lastName: kycData.last_name,
        ninString: nin,
        dob: kycData.date_of_birth || kycData.dob,
      },
    });
  } catch (error: any) {
    return c.json(
      {
        status: "error",
        message: error.message || "NIN verification failed",
      },
      400,
    );
  }
});

// Verify Bank Account
router.post("/account", async (c) => {
  try {
    const { accountNumber, bankCode, phoneNumber } = await c.req.json();
    const result = await resolveAccount(accountNumber, bankCode);

    // Save to temp_borrowers if phoneNumber provided
    if (phoneNumber) {
      const { eq } = await import("drizzle-orm");
      const { db, tempBorrowers } = await import("../db");

      const existing = await db.query.tempBorrowers.findFirst({
        where: eq(tempBorrowers.phoneNumber, phoneNumber),
      });

      if (existing) {
        const newAccount = {
          accountNumber,
          bankCode,
          accountName: result.entity.account_name,
          verifiedAt: new Date().toISOString(),
        };

        const currentAccounts = Array.isArray(existing.bankAccounts)
          ? existing.bankAccounts
          : [];
        const alreadyExists = currentAccounts.some(
          (acc: any) =>
            acc.accountNumber === accountNumber && acc.bankCode === bankCode,
        );

        if (!alreadyExists) {
          await db
            .update(tempBorrowers)
            .set({
              bankAccounts: [...currentAccounts, newAccount],
              updatedAt: new Date(),
            })
            .where(eq(tempBorrowers.id, existing.id));
        }
      }
    }

    return c.json({
      status: "success",
      data: {
        accountName: result.entity.account_name,
        accountNumber,
      },
    });
  } catch (error: any) {
    return c.json(
      {
        status: "error",
        message: error.message || "Account verification failed",
      },
      400,
    );
  }
});

// Refresh Credit Data
router.post("/refresh-credit", async (c) => {
  try {
    const { bvn, phoneNumber } = await c.req.json();

    if (!bvn) {
      return c.json({ status: "error", message: "BVN is required" }, 400);
    }

    // Fetch new credit data
    let creditReport = null;
    let creditScore = null;

    try {
      creditReport = await getCreditReport(bvn);
      creditScore = await getCreditScore(bvn);
    } catch (creditError: any) {
      console.warn("Credit refresh failed:", creditError.message);
      return c.json(
        { status: "error", message: "Failed to fetch credit data" },
        500,
      );
    }

    const { eq, or } = await import("drizzle-orm");
    const { db, tempBorrowers, borrowers } = await import("../db");

    // Update tempBorrowers
    const existingTemp = await db.query.tempBorrowers.findFirst({
      where: or(
        phoneNumber ? eq(tempBorrowers.phoneNumber, phoneNumber) : undefined,
        eq(tempBorrowers.bvn, bvn),
      ),
    });

    if (existingTemp) {
      await db
        .update(tempBorrowers)
        .set({
          creditReport,
          creditScore,
          updatedAt: new Date(),
        })
        .where(eq(tempBorrowers.id, existingTemp.id));
    }

    // Update borrowers if exists
    const existingBorrower = await db.query.borrowers.findFirst({
      where: or(
        phoneNumber ? eq(borrowers.phone, phoneNumber) : undefined,
        eq(borrowers.bvn, bvn),
      ),
    });

    if (existingBorrower) {
      await db
        .update(borrowers)
        .set({
          creditReport,
          creditScore,
          updatedAt: new Date(),
        })
        .where(eq(borrowers.id, existingBorrower.id));
    }

    return c.json({
      status: "success",
      message: "Credit data refreshed successfully",
      data: {
        creditReport,
        creditScore,
      },
    });
  } catch (error: any) {
    return c.json(
      {
        status: "error",
        message: error.message || "Failed to refresh credit data",
      },
      400,
    );
  }
});

export default router;
