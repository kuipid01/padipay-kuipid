import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function getServerAuth() {
  const cookieStore = await cookies();

  const token =      cookieStore.get('token')?.value;
  const borrowerToken =  cookieStore.get('borrower_token')?.value;

  if (token) {
  const payload = await verifyToken(token);
    if (payload) {
      return { role: 'admin', user: payload };
    }
  }

  if (borrowerToken) {
    const payload = await verifyToken(borrowerToken);
    if (payload) {
      return { role: 'borrower', user: payload };
    }
  }

  return null;
}