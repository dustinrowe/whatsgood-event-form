"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchConfig } from "@/lib/api";
import { PublicConfig } from "@/lib/types";
import EventForm from "@/components/EventForm";
import FormSkeleton from "@/components/FormSkeleton";

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

function EmbedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerUuid = searchParams.get("customer");

  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedAt = useRef<number>(0);

  function loadConfig(uuid: string) {
    return fetchConfig(uuid)
      .then((cfg) => {
        setConfig(cfg);
        lastFetchedAt.current = Date.now();
      });
  }

  useEffect(() => {
    if (!customerUuid) {
      setError("Unable to load form. Please try refreshing your page.");
      return;
    }

    loadConfig(customerUuid).catch(() => {
      setError("Something went wrong. Please try refreshing your page.");
    });
  }, [customerUuid]);

  // Silently re-fetch config when the tab becomes visible again after >30 min idle
  useEffect(() => {
    if (!customerUuid) return;

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      const elapsed = Date.now() - lastFetchedAt.current;
      if (elapsed >= REFRESH_INTERVAL_MS) {
        loadConfig(customerUuid!).catch(() => {
          // Background refresh failed — keep showing existing config silently
        });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [customerUuid]);

  // Periodic background refresh while the tab stays open
  useEffect(() => {
    if (!customerUuid) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadConfig(customerUuid).catch(() => {
          // Background refresh failed — silently keep existing config
        });
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [customerUuid]);

  function handleSuccess() {
    router.push(`/success?customer=${customerUuid}`);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <p className="text-base font-semibold text-gray-700 mb-1">Something went wrong</p>
          <p className="text-sm text-gray-500">Please try refreshing your page.</p>
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
