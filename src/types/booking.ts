export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  image_url?: string;
  position: number;
  service_count: number;
  average_price: number;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number; // in seconds
  category_id: number;
  color: string;
  requires_confirmation?: boolean;
}

export interface Provider {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  description?: string;
  image_url?: string;
  service_count: number;
  specializations?: string[];
}

export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface TimeSlot {
  start_datetime: string;
  end_datetime: string;
  formatted_time: string;
  available: boolean;
}

export interface Customer {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  country_code: string;
  timezone: string;
  privacy_consent: boolean;
  marketing_consent: boolean;
}

export interface Booking {
  id?: number;
  booking_token?: string;
  service_id: number;
  provider_id: number;
  location_id: number;
  start_datetime: string;
  end_datetime?: string;
  customer_data: Customer;
  persons: number;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  custom_fields?: Record<string, any>;
}

export interface BookingConfirmation {
  id: number;
  booking_token: string;
  status: string;
  service_name: string;
  service_duration: number;
  price: number;
  provider_first_name: string;
  provider_last_name: string;
  location_name: string;
  location_address: string;
  start_datetime: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  payment_url: string;
}

export interface BookingState {
  service: Service | null;
  provider: Provider | null;
  location: Location | null;
  date: string | null;
  time: string | null;
  startDatetime: string | null;
  customer: Partial<Customer>;
  currentStep: number;
  isLoading: boolean;
  errors: Record<string, string>;
}

export type BookingStep = 
  | 'categories' 
  | 'services' 
  | 'providers' 
  | 'datetime' 
  | 'customer' 
  | 'confirmation' 
  | 'success';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  errors?: Record<string, string[]>;
}