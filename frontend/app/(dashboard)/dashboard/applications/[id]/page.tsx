"use client";

import { ApplicationDetails } from "@/components/dashboard/application-details";
import { useFetch } from "@/hooks/general";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();

  const { data: application, isLoading } = useFetch<any>(
    `/api/applications/${params.id}`,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 rounded-full bg-lemon-primary/10">
          <Loader2 className="w-10 h-10 text-main-green animate-spin" />
        </div>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading application details...
        </p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="p-6 rounded-full bg-red-50 border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900">
            Application Not Found
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">
            The application you are looking for does not exist or has been
            removed.
          </p>
        </div>
        <Button
          className="bg-main-green hover:bg-main-green/90 text-white font-bold"
          asChild
        >
          <Link href="/dashboard/applications">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Link>
        </Button>
      </div>
    );
  }

  return <ApplicationDetails application={application.application} />;
}
