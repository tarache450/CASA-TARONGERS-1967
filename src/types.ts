export type BookingStatus = 'Pending' | 'Confirmed' | 'Family Use' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';
export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'Bizum' | 'Card' | 'Apple Pay' | 'Google Pay' | 'None';

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestsCount: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export interface PropertySettings {
  basePrice: number;
  cleaningFee: number;
  highSeasonPrice: number;
  minDays: number;
  capacity: number;
  contactEmail: string;
  contactPhone: string;
}

export interface Amenity {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export interface GalleryImage {
  src: string;
  category: 'panoramic' | 'interiors' | 'exteriors';
  alt: {
    ca: string;
    es: string;
    en: string;
  };
  desc?: {
    ca: string;
    es: string;
    en: string;
  };
}
