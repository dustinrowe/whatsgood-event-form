"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchConfig, getCachedBranding } from "@/lib/api";
import { TenantBranding } from "@/lib/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const customerUuid = searchParams.get("customer");
  const [branding, setBranding] = useState<TenantBranding | null>(
    () => (customerUuid ? getCachedBranding(customerUuid) : null)
  );

  useEffect(() => {
    if (customerUuid) {
      fetchConfig(customerUuid)
        .then((cfg) => setBranding(cfg.branding))
        .catch(() => null);
    }
  }, [customerUuid]);

  const primary = branding?.primary_color || "#3B82F6";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="text-center max-w-md space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: `${primary}20` }}
        >
          <svg className="w-8 h-8" fill="none" stroke={primary} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {branding?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.logo_url} alt={branding.brand_name} className="h-10 object-contain mx-auto" />
        )}

        <h1 className="text-2xl font-bold text-gray-900">Event Submitted!</h1>
        <p className="text-gray-500">
          Thanks for submitting your event
          {branding?.brand_name ? ` to ${branding.brand_name}` : ""}. We'll review it and get it listed soon.
        </p>

        <a
          href={`/embed?customer=${customerUuid}`}
          className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: primary }}
        >
          Submit another event
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SuccessContent />
    </Suspense>
  );
}
