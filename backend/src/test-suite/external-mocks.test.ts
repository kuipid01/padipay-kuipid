import { describe, expect, test } from "bun:test";
import {
  TEST_OTP,
  mockBvnEntity,
  mockCloudinaryUpload,
  mockCreditReport,
  mockCreditScore,
  mockNinEntity,
  mockNuban,
  mockPaystackCharge,
  mockPaystackInitialize,
  mockPaystackVerify,
} from "./external-mocks";

describe("SUITE=test external mocks", () => {
  test("generates deterministic BVN and credit payloads", () => {
    const bvn = "22222222222";
    const entity = mockBvnEntity(bvn);
    const score = mockCreditScore(bvn);
    const report = mockCreditReport(bvn);

    expect(entity.bvn).toBe(bvn);
    expect(entity.first_name).toBeTruthy();
    expect(score.provider).toBe("mock:dojah");
    expect(score.score).toBeGreaterThanOrEqual(520);
    expect(report.provider).toBe("mock:dojah");
  });

  test("generates deterministic NIN and NUBAN payloads", () => {
    const nin = mockNinEntity("11111111111");
    const nuban = mockNuban("0123456789", "058");

    expect(nin.nin).toBe("11111111111");
    expect(nuban.account_number).toBe("0123456789");
    expect(nuban.account_name).toBe("SUITE TEST USER");
  });

  test("generates Paystack-style initialize, verify, and charge responses", () => {
    const init = mockPaystackInitialize({
      email: "suite@example.com",
      amount: 100000,
      reference: "mock_ref_fixed",
    });
    const verify = mockPaystackVerify(init.data.reference);
    const charge = mockPaystackCharge({
      email: "suite@example.com",
      amount: 100000,
      reference: "mock_charge_fixed",
    });

    expect(init.status).toBe(true);
    expect(init.data.authorization_url).toContain("mock_ref_fixed");
    expect(verify.data.status).toBe("success");
    expect(charge.data.authorization?.authorization_code).toBe("AUTH_mock_suite");
  });

  test("keeps OTP and upload mocks predictable", () => {
    const upload = mockCloudinaryUpload("suite-docs");

    expect(TEST_OTP).toBe("123456");
    expect(upload.secureUrl).toContain("https://res.cloudinary.com/mock-suite/suite-docs/");
  });
});
