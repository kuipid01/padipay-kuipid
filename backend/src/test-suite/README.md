# SUITE=test mock layer

Set `SUITE=test` to prevent paid providers from being called while still exercising the app flows.

```bash
SUITE=test bun run dev
```

Available backend routes:

- `GET /api/test/status`
- `POST /api/test/seed/demo`
- `POST /api/test/dojah/bvn`
- `POST /api/test/dojah/nin`
- `POST /api/test/paystack/initialize`
- `GET /api/test/paystack/verify/:reference`
- `POST /api/test/paystack/charge`
- `POST /api/test/otp/send`
- `POST /api/test/otp/verify`
- `POST /api/test/brevo/email`
- `POST /api/test/cloudinary/upload`
- `GET /api/test/banks`
- `GET /api/test/banks/resolve?account_number=0123456789&bank_code=058`

The frontend proxies also check `process.env.SUITE === "test"` for BVN, NIN, OTP, Paystack initialization, public banks, and account resolution.

Run the mock tests:

```bash
bun run test:suite
```

Use OTP `123456` for all test-suite OTP verification.
