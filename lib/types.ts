export interface TenantBranding {
  brand_name: string;
  primary_color: string;
  logo_url: string | null;
  city: string | null;
  stripe_featured_price_id: string | null;
  stripe_account_id: string | null;
  featured_price_display: string | null;
}

export interface TagOption {
  id: number;
  name: string;
}

export interface CategoryOption {
  id: number;
  name: string;
}

export interface VenueOption {
  id: number;
  name: string;
  address: string | null;
}

export interface LocationOption {
  id: number;
  name: string;
}

export interface FormFieldOption {
  id: number | string;
  name: string;
  description?: string | null;
  address?: string | null;
}

/** An enabled, admin-configured field for the form (ENG-314). */
export interface FormField {
  key: string;     // submit identity: standard key (tags/venues/locations/category) or custom_fields category
  label: string;
  type: string;    // multiSelect | select | boolean | …
  scope: "standard" | "custom";
  source: string;  // tags | venues | locations | categories | custom
  options: FormFieldOption[];
}

export interface PublicConfig {
  branding: TenantBranding;
  tags: TagOption[];
  categories: CategoryOption[];
  venues: VenueOption[];
  locations: LocationOption[];
  fields?: FormField[];   // ENG-314: enabled fields; when present, drives show/hide + custom fields
  promotion_tiers: PromotionTierConfig[];
}

export interface EventFormData {
  title: string;
  description: string;
  submitter_email: string;
  website_url: string;
  address: string;
  venue_id: number | null;
  venue_name: string;
  location_id: number | null;
  price: string;
  is_free: boolean;
  all_day: boolean;
  start_date: string;
  end_date: string;
  recurrence: string; // "" | "daily" | "weekly"
  tags: string[];
  categories: string[];
  custom_fields: Record<string, string[]>;  // ENG-314: {field key → selected option NAMES} (converted to ids on submit)
  image_urls: string[];
}

export interface PromotionTierFeature {
  emoji: string;
  label: string;
  description: string;
}

export interface PromotionTierConfig {
  id: string;
  label: string;
  highlight: boolean;
  stripe_price_id: string | null;
  price_display: string | null;
  cta: string;
  features: PromotionTierFeature[];
}

export type PromotionTier = PromotionTierConfig;
