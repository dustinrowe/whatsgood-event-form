"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchConfig, getCachedBranding } from "@/lib/api";
import { TenantBranding } from "@/lib/types";

function CancelContent() {
  const searchParams = useSearchParams();
  const customerUuid = searchParams.get("customer");
  const [branding, setBranding] = useState<TenantBranding | null>(
    () => (customerUuid ? getCachedBranding(customerUuid) : null)
  );

  useEffect(() => {
    if (customerUuid) {
      // Notify the form tab (window.opener) that payment was cancelled.
      window.opener?.postMessage({ type: "payment_cancelled" }, window.location.origin);

      fetchConfig(customerUuid)
        .then((cfg) => setBranding(cfg.branding))
        .catch(() => null);
    }
  }, [customerUuid]);

  const primary = branding?.primary_color || "#3B82F6";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="text-center max-w-md space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {branding?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.logo_url} alt={branding.brand_name} className="h-10 object-contain mx-auto" />
        )}

        <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="text-gray-500">
          No worries — your event was saved. You can go back and choose a different option.
        </p>

        <a
          href={`/embed?customer=${customerUuid}`}
          className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: primary }}
        >
          Go back to form
        </a>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CancelContent />
    </Suspense>
  );
}
