"use client";

import { useState, useEffect, useRef } from "react";
import { PublicConfig, EventFormData, PromotionTier } from "@/lib/types";
import { submitBasicEvent, createFeaturedCheckout } from "@/lib/api";
import PromotionModal from "./PromotionModal";
import ImageUploader from "./ImageUploader";
import SearchableSelect from "./SearchableSelect";
import DateTimePicker from "./DateTimePicker";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://whatsgoodapi.up.railway.app";

interface Props {
  customerUuid: string;
  config: PublicConfig;
  onSuccess: () => void;
}

const initialForm: EventFormData = {
  title: "",
  description: "",
  submitter_email: "",
  website_url: "",
  address: "",
  venue_id: null,
  venue_name: "",
  location_id: null,
  price: "",
  is_free: false,
  all_day: false,
  start_date: "",
  end_date: "",
  recurrence: "",
  tags: [],
  categories: [],
  image_urls: [],
};

// Shared input styles — Typeform-inspired: clean border, smooth focus ring
function inputCls(hasError?: boolean) {
  return `w-full bg-white border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 ${
    hasError ? "border-red-400" : "border-gray-200 focus:border-transparent"
  }`;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      {children}
    </div>
  );
}

export default function EventForm({ customerUuid, config, onSuccess }: Props) {
  const { branding, venues, tags, locations, promotion_tiers } = config;
  const primary = branding.primary_color || "#3B82F6";

  const [form, setForm] = useState<EventFormData>(initialForm);
  const [showPromo, setShowPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagSuggestState, setTagSuggestState] = useState<"idle" | "loading" | "error">("idle");
  const [tagSuggestError, setTagSuggestError] = useState<string | null>(null);
  const waitingRef = useRef(false);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (!waitingRef.current) return;
      if (e.data?.type === "payment_success") {
        waitingRef.current = false;
        onSuccess();
      } else if (e.data?.type === "payment_cancelled") {
        waitingRef.current = false;
        setWaitingForPayment(false);
        setShowPromo(true);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess]);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand-primary", primary);
  }, [primary]);

  function set(field: keyof EventFormData, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.submitter_email.trim()) e.submitter_email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitter_email)) e.submitter_email = "Invalid email";
    if (!form.website_url.trim()) e.website_url = "Required";
    if (!form.venue_id) {
      if (!form.address.trim()) e.address = "Required";
      if (!form.location_id) e.location_id = "Required";
    }
    if (!form.start_date) e.start_date = "Required";
    if (form.recurrence && !form.end_date) e.end_date = "Required when recurring";
    if (form.tags.length === 0) e.tags = "Select at least one tag";
    if (form.image_urls.length === 0) e.image_urls = "At least one image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmitClick() {
    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector("[data-error='true']");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setShowPromo(true);
  }

  async function handlePromoSelect(tier: PromotionTier) {
    setLoading(true);
    setError(null);
    try {
      if (!tier.stripe_price_id) {
        await submitBasicEvent(customerUuid, form);
        setShowPromo(false);
        onSuccess();
      } else {
        // Open blank window synchronously (inside user gesture) to avoid popup blockers,
        // then navigate it to the Stripe URL once we have it.
        const stripeWindow = window.open("", "_blank");
        const { checkout_url } = await createFeaturedCheckout(customerUuid, tier.id, form);

        if (stripeWindow) {
          stripeWindow.location.href = checkout_url;
        } else {
          // Fallback if popup was blocked
          (window.top ?? window).location.href = checkout_url;
        }

        waitingRef.current = true;
        setLoading(false);
        setShowPromo(false);
        setWaitingForPayment(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function suggestTags() {
    if (!form.title.trim() && !form.description.trim()) {
      setTagSuggestError("Add a title or description first.");
      return;
    }
    setTagSuggestState("loading");
    setTagSuggestError(null);
    try {
      const res = await fetch("/api/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, tags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suggestion failed");
      // Map returned IDs → names (SearchableSelect multi-mode tracks by name)
      const suggestedNames = (data.tag_ids as number[])
        .map(id => tags.find(t => t.id === id)?.name)
        .filter((n): n is string => !!n);
      set("tags", suggestedNames);
      setTagSuggestState("idle");
    } catch (err) {
      setTagSuggestError(err instanceof Error ? err.message : "Something went wrong");
      setTagSuggestState("error");
    }
  }

  const focusRingStyle = { "--tw-ring-color": `${primary}40` } as React.CSSProperties;

  // Light tint of the brand color for the page background
  const pageBg = `color-mix(in srgb, ${primary} 8%, white)`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Logo / brand — sits above the white form area, no separate header bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-8 flex flex-col items-center gap-3">
          {branding.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logo_url} alt={branding.brand_name} className="h-16 object-contain" />
          ) : (
            <span className="text-2xl font-bold" style={{ color: primary }}>{branding.brand_name}</span>
          )}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Submit Your Event</h1>
            <p className="text-gray-500 text-sm mt-1">Fill out the form below to get your event listed{branding.city ? ` in ${branding.city}` : ""}.</p>
          </div>
        </div>

        {/* Section 1: Event Details */}
        <Section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Details</h2>

          <div data-error={!!errors.title}>
            <Label required>Event Title</Label>
            <input
              type="text"
              className={inputCls(!!errors.title)}
              style={focusRingStyle}
              placeholder="e.g. Summer Jazz Night"
              value={form.title}
              onChange={e => set("title", e.target.value)}
            />
            <FieldError msg={errors.title} />
          </div>

          <div data-error={!!errors.description}>
            <Label required>Description</Label>
            <textarea
              className={`${inputCls(!!errors.description)} min-h-[120px] resize-y`}
              style={focusRingStyle}
              placeholder="Tell people what to expect at your event..."
              value={form.description}
              onChange={e => set("description", e.target.value)}
            />
            <FieldError msg={errors.description} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Ticket Price</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${inputCls()} pl-8`}
                  style={focusRingStyle}
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => set("price", e.target.value)}
                  disabled={form.is_free}
                />
              </div>
            </div>
            <div className="pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => { set("is_free", !form.is_free); if (!form.is_free) set("price", ""); }}
                  className="w-10 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: form.is_free ? primary : "#d1d5db" }}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_free ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm text-gray-700 font-medium">Free event</span>
              </label>
            </div>
          </div>

          <div data-error={!!errors.tags}>
            <div className="flex items-center justify-between mb-1.5">
              <Label required>Tags</Label>
              <button
                type="button"
                onClick={suggestTags}
                disabled={tagSuggestState === "loading"}
                title="Suggest tags with AI"
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                style={{ color: primary, backgroundColor: `${primary}12` }}
                onMouseEnter={e => { if (tagSuggestState !== "loading") (e.currentTarget as HTMLElement).style.backgroundColor = `${primary}22`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${primary}12`; }}
              >
                {tagSuggestState === "loading" ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 4V2m0 14v-2M8 9H6m12 0h-2M13.6 6.4l1.4-1.4M8.4 17.6l1.4-1.4M13.6 13.6l1.4 1.4M8.4 6.4 7 5M3 3l18 18" />
                    <path d="m3 9 2.5 2.5L9 8" />
                  </svg>
                )}
                {tagSuggestState === "loading" ? "Suggesting…" : "Suggest with AI"}
              </button>
            </div>
            <SearchableSelect
              mode="multi"
              options={tags}
              selected={form.tags}
              onChange={v => set("tags", v)}
              placeholder="Search tags..."
              primaryColor={primary}
              hasError={!!errors.tags}
            />
            {tagSuggestError && <p className="mt-1 text-xs text-amber-600">{tagSuggestError}</p>}
            <FieldError msg={errors.tags} />
          </div>
        </Section>

        {/* Section 2: Date & Time */}
        <Section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date &amp; Time</h2>

          {/* All day toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => {
                  const next = !form.all_day;
                  set("all_day", next);
                  if (next) {
                    if (form.start_date) set("start_date", form.start_date.slice(0, 10) + "T00:00");
                    if (form.end_date) set("end_date", form.end_date.slice(0, 10) + "T00:00");
                  }
                }}
                className="w-10 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
                style={{ backgroundColor: form.all_day ? primary : "#d1d5db" }}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.all_day ? "translate-x-5" : "translate-x-1"}`} />
              </div>
              <span className="text-sm text-gray-700 font-medium">All day</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div data-error={!!errors.start_date}>
              <Label required>Start</Label>
              <DateTimePicker
                value={form.start_date}
                onChange={v => set("start_date", v)}
                placeholder="Select start"
                hasError={!!errors.start_date}
                primaryColor={primary}
                minDate={new Date().toISOString().slice(0, 10)}
                dateOnly={form.all_day}
              />
              <FieldError msg={errors.start_date} />
            </div>
            <div data-error={!!errors.end_date}>
              <Label required={!!form.recurrence}>End</Label>
              <DateTimePicker
                value={form.end_date}
                onChange={v => set("end_date", v)}
                placeholder="Select end"
                hasError={!!errors.end_date}
                primaryColor={primary}
                minDate={form.start_date ? form.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10)}
                dateOnly={form.all_day}
              />
              <FieldError msg={errors.end_date} />
            </div>
          </div>

          {/* Recurring event */}
          <div>
            <Label>Recurring Event</Label>
            <div className="relative mt-1">
              <select
                className={`${inputCls()} appearance-none pr-10`}
                style={focusRingStyle}
                value={form.recurrence}
                onChange={e => set("recurrence", e.target.value)}
              >
                <option value="">Single Occurrence</option>
                <option value="daily">Daily — occurs multiple days in a row (e.g. Fri, Sat, Sun)</option>
                <option value="weekly">Weekly — happens at the same time every week</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </Section>

        {/* Section 3: Location */}
        <Section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</h2>

          <div>
            <Label>Venue</Label>
            <p className="text-xs text-gray-400 mb-1.5">Can't find yours? Leave blank and fill in the address below.</p>
            <SearchableSelect
              mode="single"
              options={venues}
              value={form.venue_id}
              onSelect={(id, name) => { set("venue_id", id); set("venue_name", name); }}
              placeholder="Search venues..."
              primaryColor={primary}
            />
          </div>

          {!form.venue_id && (
            <>
              <div data-error={!!errors.location_id}>
                <Label required>Location / Area</Label>
                <SearchableSelect
                  mode="single"
                  options={locations}
                  value={form.location_id}
                  onSelect={(id) => set("location_id", id)}
                  placeholder="Search locations..."
                  primaryColor={primary}
                  hasError={!!errors.location_id}
                />
                <FieldError msg={errors.location_id} />
              </div>

              <div data-error={!!errors.address}>
                <Label required>Address</Label>
                <input
                  type="text"
                  className={inputCls(!!errors.address)}
                  style={focusRingStyle}
                  placeholder="123 Main St, City, State"
                  value={form.address}
                  onChange={e => set("address", e.target.value)}
                />
                <FieldError msg={errors.address} />
              </div>
            </>
          )}
        </Section>

        {/* Section 4: Contact & Links */}
        <Section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Info</h2>

          <div data-error={!!errors.submitter_email}>
            <Label required>Your Email</Label>
            <input
              type="email"
              className={inputCls(!!errors.submitter_email)}
              style={focusRingStyle}
              placeholder="you@example.com"
              value={form.submitter_email}
              onChange={e => set("submitter_email", e.target.value)}
            />
            <FieldError msg={errors.submitter_email} />
          </div>

          <div data-error={!!errors.website_url}>
            <Label required>Website / Tickets Link</Label>
            <input
              type="url"
              className={inputCls(!!errors.website_url)}
              style={focusRingStyle}
              placeholder="https://..."
              value={form.website_url}
              onChange={e => set("website_url", e.target.value)}
            />
            <FieldError msg={errors.website_url} />
          </div>
        </Section>

        {/* Section 6: Images */}
        <Section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Images</h2>
          <div data-error={!!errors.image_urls}>
            <Label required>Event Photo</Label>
            <p className="text-xs text-gray-400 mb-2">High quality image recommended. Preferred: 3×4 vertical.</p>
            <ImageUploader
              images={form.image_urls}
              onChange={urls => set("image_urls", urls)}
              apiBase={API_BASE}
            />
            <FieldError msg={errors.image_urls} />
          </div>
        </Section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmitClick}
          className="w-full py-4 rounded-xl text-white font-semibold text-base shadow-sm transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ backgroundColor: primary }}
        >
          Continue
        </button>

        <p className="text-center text-xs text-gray-400 pb-6">
          You'll choose a listing option on the next step.
        </p>
      </div>

      {waitingForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: pageBg }}>
          <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center gap-5 max-w-sm w-full text-center">
            <div className="w-10 h-10 border-2 border-gray-200 rounded-full" style={{ borderTopColor: primary, animation: "spin 0.9s linear infinite" }} />
            <div>
              <p className="text-lg font-semibold text-gray-900">Complete your payment</p>
              <p className="text-sm text-gray-500 mt-1">Finish checkout in the other tab — this screen will update automatically.</p>
            </div>
            <button
              type="button"
              onClick={() => { waitingRef.current = false; setWaitingForPayment(false); setShowPromo(true); }}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Back to options
            </button>
          </div>
        </div>
      )}

      {showPromo && (
        <PromotionModal
          branding={branding}
          tiers={promotion_tiers}
          onSelect={handlePromoSelect}
          onClose={() => { if (!loading) setShowPromo(false); }}
          loading={loading}
        />
      )}
    </div>
  );
}
