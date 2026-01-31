const FALLBACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function initializeTransaction(email: string, amount: number, metadata: any, customSecretKey?: string) {
  const secretKey = customSecretKey || FALLBACK_SECRET_KEY;
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
    }),
  });

  return await res.json();
}

export async function verifyTransaction(reference: string, customSecretKey?: string) {
  const secretKey = customSecretKey || FALLBACK_SECRET_KEY;
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  return await res.json();
}

export async function chargeRecurring(email: string, amount: number, authorizationCode: string, customSecretKey?: string) {
  const secretKey = customSecretKey || FALLBACK_SECRET_KEY;
  const res = await fetch("https://api.paystack.co/transaction/charge_authorization", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      authorization_code: authorizationCode,
    }),
  });

  return await res.json();
}
