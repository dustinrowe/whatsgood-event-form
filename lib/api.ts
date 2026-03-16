import { EventFormData, PublicConfig } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://whatsgoodapi.up.railway.app";

const BRANDING_CACHE_KEY = (uuid: string) => `wg_branding_${uuid}`;

export function getCachedBranding(customerUuid: string) {
  try {
    const raw = sessionStorage.getItem(BRANDING_CACHE_KEY(customerUuid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchConfig(customerUuid: string): Promise<PublicConfig> {
  const res = await fetch(`${API_BASE}/public/config/${customerUuid}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load form configuration");
  }
  const config: PublicConfig = await res.json();
  try {
    sessionStorage.setItem(BRANDING_CACHE_KEY(customerUuid), JSON.stringify(config.branding));
  } catch {
    // sessionStorage unavailable (e.g. cross-origin iframe in strict mode) — ignore
  }
  return config;
}

export async function submitBasicEvent(
  customerUuid: string,
  form: EventFormData
): Promise<{ event_id: number }> {
  const res = await fetch(`${API_BASE}/public/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_uuid: customerUuid,
      title: form.title,
      description: form.description,
      submitter_email: form.submitter_email,
      website_url: form.website_url,
      address: form.address,
      venue_id: form.venue_id,
      venue_name: form.venue_name || null,
      location_id: form.location_id,
      price: form.price ? parseFloat(form.price) : null,
      is_free: form.is_free,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      tags: form.tags,
      categories: form.categories,
      image_urls: form.image_urls,
      recurrence: form.recurrence || null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit event");
  }
  return res.json();
}

export async function createFeaturedCheckout(
  customerUuid: string,
  tierId: string,
  form: EventFormData
): Promise<{ checkout_url: string; event_id: number }> {
  const res = await fetch(`${API_BASE}/public/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_uuid: customerUuid,
      tier_id: tierId,
      event: {
        customer_uuid: customerUuid,
        title: form.title,
        description: form.description,
        submitter_email: form.submitter_email,
        website_url: form.website_url,
        address: form.address,
        venue_id: form.venue_id,
        venue_name: form.venue_name || null,
        location_id: form.location_id,
        price: form.price ? parseFloat(form.price) : null,
        is_free: form.is_free,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        tags: form.tags,
        categories: form.categories,
        image_urls: form.image_urls,
        recurrence: form.recurrence || null,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create checkout session");
  }
  return res.json();
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/public/upload-image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Image upload failed");
  }
  const data = await res.json();
  return data.url;
}
