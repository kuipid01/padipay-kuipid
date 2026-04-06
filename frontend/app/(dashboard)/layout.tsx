import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/server-auth';
import DashboardClientLayout from './dashboard-layout-wrapper';
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerAuth();

  if (!auth || auth.role !== 'admin') {
    redirect('/login');
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;

}