import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/server-auth';
import BorrowerClientLayout from './borrowe-layou-wrapper';

export default async function Layout({ children }: any) {
    const auth = await getServerAuth();

    if (!auth || auth.role !== 'borrower') {
        redirect('/borrower/login');
    }

    return <BorrowerClientLayout>{children}</BorrowerClientLayout>;
}