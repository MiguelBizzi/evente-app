export type EventCategory =
  | 'music'
  | 'sports'
  | 'food'
  | 'art'
  | 'education'
  | 'technology'
  | 'health'
  | 'wellness'
  | 'business'
  | 'religion'
  | 'community'
  | 'entertainment'
  | 'culture'
  | 'workshop'
  | 'conference'
  | 'networking'
  | 'other';

export type UserType = 'organizer' | 'participant';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // ISO timestamp
  location: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  category: EventCategory;
  organizer_id: string;
  capacity: number | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  type: UserType;
  created_at: string;
  updated_at: string;
}

export interface CategoryLabel {
  category: EventCategory;
  label: string;
}

