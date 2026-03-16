"use client";

import { TenantBranding, PromotionTier } from "@/lib/types";

interface Props {
  branding: TenantBranding;
  onSelect: (tier: PromotionTier) => void;
  onClose: () => void;
  loading: boolean;
}

const CheckIcon = () => (
  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-5 h-5 mr-2 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function PromotionModal({ branding, onSelect, onClose, loading }: Props) {
  const primary = branding.primary_color || "#3B82F6";
  const featuredPrice = branding.featured_price_display || "$100.00";
  const hasFeatured = !!branding.stripe_account_id && !!branding.stripe_featured_price_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Promotion Options</h2>
          <p className="text-gray-500 text-sm mt-1">Choose how you'd like to list your event</p>
        </div>

        {/* Cards */}
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Featured */}
          {hasFeatured && (
            <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: primary }}>
              <div
                className="text-white text-center py-2 font-semibold text-sm tracking-wide"
                style={{ backgroundColor: primary }}
              >
                Featured
              </div>
              <div className="p-5 flex flex-col gap-3 bg-blue-50/40">
                <div className="text-center">
                  <span className="text-5xl font-bold text-gray-900">{featuredPrice}</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckIcon />
                    <div>
                      <p className="font-semibold">Email Newsletter</p>
                      <p className="text-gray-500">Included in the events section of our email newsletter</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon />
                    <div>
                      <p className="font-semibold">Friday Rundown on Instagram</p>
                      <p className="text-gray-500">Included in our Friday Instagram Stories</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">★</span>
                    <div>
                      <p className="font-semibold">Featured on Events page</p>
                      <p className="text-gray-500">Featured at the top for up to 1 week. Est. 5,000 views</p>
                    </div>
                  </li>
                </ul>
                <button
                  onClick={() => onSelect("featured")}
                  disabled={loading}
                  className="mt-2 w-full py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: primary }}
                >
                  {loading ? "Redirecting..." : "Checkout"}
                </button>
              </div>
            </div>
          )}

          {/* Basic */}
          <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gray-100 text-gray-700 text-center py-2 font-semibold text-sm tracking-wide">
              Basic
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="text-center">
                <span className="text-5xl font-bold text-gray-400">FREE</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start line-through">
                  <CrossIcon />
                  <div>
                    <p className="font-semibold">Email Newsletter</p>
                    <p>Included in the events section of our email newsletter</p>
                  </div>
                </li>
                <li className="flex items-start line-through">
                  <CrossIcon />
                  <div>
                    <p className="font-semibold">Friday Rundown on Instagram</p>
                    <p>Included in our Friday Instagram Stories</p>
                  </div>
                </li>
                <li className="flex items-start text-gray-700 no-underline" style={{ textDecoration: "none" }}>
                  <span className="text-yellow-500 mr-2">★</span>
                  <div>
                    <p className="font-semibold">Listed on Events page</p>
                    <p className="text-gray-500">Listed on the events section. Est. 1,500 views</p>
                  </div>
                </li>
              </ul>
              <button
                onClick={() => onSelect("basic")}
                disabled={loading}
                className="mt-2 w-full py-3 rounded-lg font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
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
