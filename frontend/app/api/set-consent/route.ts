import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await  cookies();
  const body = await req.json();
  cookieStore.set("loan_consent", body.consent, {
    path: "/",
  });

  return Response.json({ ok: true });
}