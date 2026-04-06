import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/server-auth';

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const auth = await getServerAuth();
    console.log("AUTH RGHT NOW", auth)
    if (auth?.role === 'admin') {
        // console.log("we are here")
        redirect('/dashboard');
    }

    if (auth?.role === 'borrower') {
        redirect('/borrower/dashboard');
    }

    return <>{children}</>;
}