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

export interface PublicConfig {
  branding: TenantBranding;
  tags: TagOption[];
  categories: CategoryOption[];
  venues: VenueOption[];
  locations: LocationOption[];
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
  image_urls: string[];
}

export type PromotionTier = "basic" | "featured";
