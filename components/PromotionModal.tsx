"use client";

import { useRef } from "react";
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
  const scrollable = tiers.length >= 3;

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, scrollLeft: 0, moved: false });

  function onMouseDown(e: React.MouseEvent) {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = { dragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
    el.style.cursor = "grabbing";
  }

  function onMouseMove(e: React.MouseEvent) {
    const el = scrollRef.current;
    if (!dragState.current.dragging || !el) return;
    e.preventDefault();
    const dx = e.pageX - el.offsetLeft - dragState.current.startX;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.scrollLeft - dx;
  }

  function onMouseUp() {
    dragState.current.dragging = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 pr-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Promotion Options</h2>
          <p className="text-gray-500 text-sm mt-1">Choose how you'd like to list your event</p>
        </div>

        {/* Cards */}
        {scrollable ? (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 pb-6 select-none"
            style={{ cursor: "grab", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {tiers.map(tier => (
              <TierCard
                key={tier.id}
                tier={tier}
                primary={primary}
                loading={loading}
                onSelect={onSelect}
                scrollable
                getDragged={() => dragState.current.moved}
              />
            ))}
            {/* Right padding sentinel */}
            <div className="min-w-[1px]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 px-5 pb-6">
            {tiers.map(tier => (
              <TierCard
                key={tier.id}
                tier={tier}
                primary={primary}
                loading={loading}
                onSelect={onSelect}
                scrollable={false}
                getDragged={() => false}
              />
            ))}
          </div>
        )}

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
  scrollable,
  getDragged,
}: {
  tier: PromotionTierConfig;
  primary: string;
  loading: boolean;
  onSelect: (tier: PromotionTierConfig) => void;
  scrollable: boolean;
  getDragged: () => boolean;
}) {
  const isPaid = !!tier.stripe_price_id;
  const sizeClass = scrollable ? "min-w-[240px] max-w-[240px] snap-start" : "";

  function handleSelect() {
    if (getDragged()) return;
    onSelect(tier);
  }

  if (tier.highlight) {
    return (
      <div className={`rounded-xl border-2 overflow-hidden flex-shrink-0 ${sizeClass}`} style={{ borderColor: primary }}>
        <div
          className="text-white text-center py-2 font-semibold text-sm tracking-wide"
          style={{ backgroundColor: primary }}
        >
          {tier.label}
        </div>
        <div className="p-4 flex flex-col gap-3 bg-blue-50/40">
          <div className="text-center">
            <span className="text-4xl font-bold text-gray-900">
              {isPaid ? tier.price_display : "FREE"}
            </span>
          </div>
          <ul className="space-y-2.5 text-sm text-gray-700">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 text-base leading-5">{f.emoji}</span>
                <div>
                  <p className="font-semibold leading-tight">{f.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{f.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={handleSelect}
            disabled={loading}
            className="mt-1 w-full py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60 text-sm"
            style={{ backgroundColor: primary }}
          >
            {loading ? (isPaid ? "Redirecting..." : "Submitting...") : tier.cta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-gray-200 overflow-hidden flex-shrink-0 ${sizeClass}`}>
      <div className="bg-gray-100 text-gray-700 text-center py-2 font-semibold text-sm tracking-wide">
        {tier.label}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="text-center">
          <span className="text-4xl font-bold text-gray-400">
            {isPaid ? tier.price_display : "FREE"}
          </span>
        </div>
        <ul className="space-y-2.5 text-sm text-gray-700">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 text-base leading-5">{f.emoji}</span>
              <div>
                <p className="font-semibold leading-tight">{f.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={handleSelect}
          disabled={loading}
          className="mt-1 w-full py-3 rounded-lg font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? (isPaid ? "Redirecting..." : "Submitting...") : tier.cta}
        </button>
      </div>
    </div>
  );
}
