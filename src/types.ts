export type BookingStatus = 
  | 'pending'           // Solicitud pendiente / nueva
  | 'new_request'       // Compatibilidad con solicitud inicial
  | 'pending_review'    // En revisión
  | 'contacted'         // Contactada con el huésped
  | 'confirmed'         // Confirmada oficialmente
  | 'rejected'          // Rechazada
  | 'cancelled'         // Cancelada
  | 'completed'         // Finalizada
  | 'archived'          // Archivada
  | 'blocked';          // Bloqueo manual de fechas por la familia

export interface BookingActivity {
  id: string;
  timestamp?: string;
  createdAt?: string;
  action: string;
  actor?: string;
  author?: string;
  description?: string;
  details?: any;
}

export interface BookingNote {
  id: string;
  createdAt?: string;
  timestamp?: string;
  author: string;
  text?: string;
  content?: string;
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestsCount: number;
  notes?: string;
  message?: string;
  privacyAccepted: boolean;
  termsAccepted: boolean;
  status: BookingStatus;
  isManualBlock?: boolean;
  blockReason?: string;
  internalNotes?: BookingNote[];
  history?: BookingActivity[];
  createdAt: string;
  updatedAt?: string;
}

export interface AvailabilityBlock {
  id: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface ReservationActivity {
  id: string;
  reservationId: string | null;
  action: string;
  actor: string;
  details?: Record<string, any> | string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface PropertySettings {
  capacity: number;
  minDays: number;
  minStayNights?: number;
  checkInTime?: string;
  checkOutTime?: string;
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
  category: 'exteriors' | 'interiors' | 'panoramic';
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
