"use client";

import { TenantBranding, PromotionTierConfig } from "@/lib/types";

interface Props {
  branding: TenantBranding;
  tiers: PromotionTierConfig[];
  onSelect: (tier: PromotionTierConfig) => void;
  onClose: () => void;
  loading: boolean;
}

export default function PromotionModal({ branding, tiers, onSelect, onClose, loading }: Props) {
  const primary = branding.primary_color || "#3B82F6";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Promotion Options</h2>
          <p className="text-gray-500 text-sm mt-1">Choose how you'd like to list your event</p>
        </div>

        {/* Cards */}
        <div
          className="px-6 pb-6 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}
        >
          {tiers.map(tier => (
            <TierCard
              key={tier.id}
              tier={tier}
              primary={primary}
              loading={loading}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function TierCard({
  tier,
  primary,
  loading,
  onSelect,
}: {
  tier: PromotionTierConfig;
  primary: string;
  loading: boolean;
  onSelect: (tier: PromotionTierConfig) => void;
}) {
  const isPaid = !!tier.stripe_price_id;

  if (tier.highlight) {
    return (
      <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: primary }}>
        <div
          className="text-white text-center py-2 font-semibold text-sm tracking-wide"
          style={{ backgroundColor: primary }}
        >
          {tier.label}
        </div>
        <div className="p-5 flex flex-col gap-3 bg-blue-50/40">
          <div className="text-center">
            <span className="text-5xl font-bold text-gray-900">
              {isPaid ? tier.price_display : "FREE"}
            </span>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0">{f.emoji}</span>
                <div>
                  <p className="font-semibold">{f.label}</p>
                  <p className="text-gray-500">{f.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onSelect(tier)}
            disabled={loading}
            className="mt-2 w-full py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: primary }}
          >
            {loading ? (isPaid ? "Redirecting..." : "Submitting...") : tier.cta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="bg-gray-100 text-gray-700 text-center py-2 font-semibold text-sm tracking-wide">
        {tier.label}
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="text-center">
          <span className="text-5xl font-bold text-gray-400">
            {isPaid ? tier.price_display : "FREE"}
          </span>
        </div>
        <ul className="space-y-3 text-sm text-gray-700">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0">{f.emoji}</span>
              <div>
                <p className="font-semibold">{f.label}</p>
                <p className="text-gray-500">{f.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => onSelect(tier)}
          disabled={loading}
          className="mt-2 w-full py-3 rounded-lg font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60"
        >
          {loading ? (isPaid ? "Redirecting..." : "Submitting...") : tier.cta}
        </button>
      </div>
    </div>
  );
}
