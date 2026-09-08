export type BookingStatus = 
  | 'new_request'       // Nueva solicitud
  | 'pending_review'    // Pendiente de revisión
  | 'contacted'         // Contactada
  | 'confirmed'         // Confirmada
  | 'rejected'          // Rechazada
  | 'cancelled'         // Cancelada
  | 'completed'         // Finalizada
  | 'archived'          // Archivada
  | 'blocked';          // Bloqueo manual de fechas por la familia

export interface BookingActivity {
  id: string;
  timestamp: string;
  action: string;
  actor?: string;
  author?: string;
  description?: string;
  details?: string;
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
  history: BookingActivity[];
  createdAt: string;
  updatedAt?: string;
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
