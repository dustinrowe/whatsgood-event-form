"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchConfig } from "@/lib/api";
import { PublicConfig } from "@/lib/types";
import EventForm from "@/components/EventForm";
import FormSkeleton from "@/components/FormSkeleton";

function EmbedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerUuid = searchParams.get("customer");

  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerUuid) {
      setError("Missing customer ID. Please check the embed code.");
      return;
    }
    fetchConfig(customerUuid)
      .then(setConfig)
      .catch((err) => setError(err.message || "Failed to load form"));
  }, [customerUuid]);

  function handleSuccess() {
    router.push(`/success?customer=${customerUuid}`);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center text-red-600 max-w-sm">
          <p className="text-lg font-semibold mb-2">Unable to load form</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return <FormSkeleton />;
  }

  return (
    <EventForm
      customerUuid={customerUuid!}
      config={config}
      onSuccess={handleSuccess}
    />
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EmbedContent />
    </Suspense>
  );
}
