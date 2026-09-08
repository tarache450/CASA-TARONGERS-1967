import { Booking, BookingStatus, BookingNote, AvailabilityBlock, ReservationActivity } from '../types';

export interface BookingRequestPayload {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  message?: string;
  privacyAccepted: boolean;
  termsAccepted: boolean;
}

export interface PublicAvailabilityItem {
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    try {
      this.token = sessionStorage.getItem('tarongers_session_token');
    } catch {
      this.token = null;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    try {
      if (token) {
        sessionStorage.setItem('tarongers_session_token', token);
      } else {
        sessionStorage.removeItem('tarongers_session_token');
      }
    } catch {
      // ignore
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(isJson = true): Record<string, string> {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      headers['x-family-token'] = this.token;
    }
    return headers;
  }

  /**
   * Health check to check database and server status
   */
  async checkHealth(): Promise<{ status: string; storage: string; totalBookings: number; totalBlocks: number }> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Servidor no responde');
    return res.json();
  }

  /**
   * Public: Get non-sensitive occupied/blocked date ranges
   */
  async getPublicAvailability(): Promise<PublicAvailabilityItem[]> {
    const res = await fetch('/api/bookings/availability');
    if (!res.ok) {
      throw new Error('Error al obtener la disponibilidad.');
    }
    return res.json();
  }

  /**
   * Public: Create a new booking request in database
   */
  async createBookingRequest(payload: BookingRequestPayload): Promise<{ success: boolean; bookingId: string; booking: any }> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al enviar la solicitud de reserva.');
    }
    return data;
  }

  /**
   * Family Authentication (PIN or Admin Email)
   */
  async verifyFamilyPin(pin?: string, email?: string): Promise<{ success: boolean; token: string }> {
    const res = await fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ pin, email })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Credenciales incorrectas.');
    }

    this.setToken(data.token);
    return data;
  }

  /**
   * Admin: Get all real bookings from Supabase / database
   */
  async getAdminBookings(): Promise<Booking[]> {
    const res = await fetch('/api/admin/bookings', {
      headers: this.getHeaders(false)
    });

    if (res.status === 401) {
      this.setToken(null);
      throw new Error('Sesión expirada. Por favor identifícate de nuevo.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al cargar las reservas reales.');
    }

    return res.json();
  }

  /**
   * Admin: Update status of a booking
   */
  async updateBookingStatus(id: string, status: BookingStatus, note?: string): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, note, actor: 'Familia' })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al actualizar el estado de la reserva.');
    }
    return data;
  }

  /**
   * Admin: Edit booking details
   */
  async updateBookingDetails(id: string, updates: Partial<Booking>): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...updates, actor: 'Familia' })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al editar la reserva.');
    }
    return data;
  }

  /**
   * Admin: Add internal private note
   */
  async addBookingNote(id: string, text: string, author: string): Promise<{ success: boolean; note: BookingNote; booking: Booking }> {
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}/notes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text, author })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al añadir nota.');
    }
    return data;
  }

  /**
   * Admin: Availability Blocks (availability_blocks table)
   */
  async getAvailabilityBlocks(): Promise<AvailabilityBlock[]> {
    const res = await fetch('/api/admin/blocks', {
      headers: this.getHeaders(false)
    });
    if (!res.ok) {
      throw new Error('Error al cargar bloqueos.');
    }
    return res.json();
  }

  async createManualBlock(block: { checkIn: string; checkOut: string; reason: string; createdBy: string }): Promise<{ success: boolean; block: AvailabilityBlock }> {
    const res = await fetch('/api/admin/blocks', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(block)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al bloquear fechas.');
    }
    return data;
  }

  async deleteManualBlock(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/blocks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getHeaders(false)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al eliminar bloqueo.');
    }
    return data;
  }

  /**
   * Admin: Reservation Activity Audit Trail (reservation_activity table)
   */
  async getReservationActivity(): Promise<ReservationActivity[]> {
    const res = await fetch('/api/admin/activity', {
      headers: this.getHeaders(false)
    });
    if (!res.ok) {
      throw new Error('Error al cargar historial de actividad.');
    }
    return res.json();
  }

  /**
   * Admin: Delete booking
   */
  async deleteBooking(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getHeaders(false)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al eliminar la reserva.');
    }
    return data;
  }
}

export const apiClient = new ApiClient();
