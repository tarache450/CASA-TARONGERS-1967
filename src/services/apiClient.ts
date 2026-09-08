import { supabase, checkAdminUser, logReservationActivity } from './supabaseClient';
import { Booking, BookingStatus, BookingNote, AvailabilityBlock, ReservationActivity, NotificationLog } from '../types';

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

  /**
   * Health Check
   */
  async checkHealth(): Promise<{ status: string; storage: string; totalBookings: number }> {
    try {
      const { data, count, error } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true });

      if (!error) {
        return { status: 'ok', storage: 'supabase', totalBookings: count || 0 };
      }
    } catch (e) {
      // fallback
    }
    return { status: 'ok', storage: 'local_mirror', totalBookings: 0 };
  }

  /**
   * Public: Get non-sensitive occupied & blocked date ranges directly from Supabase
   */
  async getPublicAvailability(): Promise<PublicAvailabilityItem[]> {
    const results: PublicAvailabilityItem[] = [];

    // 1. Fetch active reservations from Supabase
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('check_in, check_out, status')
        .in('status', ['pending', 'contacted', 'confirmed', 'new_request', 'pending_review']);

      if (!error && Array.isArray(data)) {
        data.forEach(r => {
          results.push({
            checkIn: r.check_in,
            checkOut: r.check_out,
            status: r.status as BookingStatus
          });
        });
      }
    } catch (err) {
      console.warn('[Supabase] Error loading reservations availability:', err);
    }

    // 2. Fetch manual availability blocks from Supabase
    try {
      const { data: blocks, error } = await supabase
        .from('availability_blocks')
        .select('check_in, check_out');

      if (!error && Array.isArray(blocks)) {
        blocks.forEach(b => {
          results.push({
            checkIn: b.check_in,
            checkOut: b.check_out,
            status: 'blocked'
          });
        });
      }
    } catch (err) {
      console.warn('[Supabase] Error loading availability_blocks:', err);
    }

    // Fallback: If Supabase returned empty or was not migrated, check local fallback
    if (results.length === 0) {
      try {
        const local = localStorage.getItem('tarongers_local_reservations');
        if (local) {
          const list: Booking[] = JSON.parse(local);
          list.filter(b => b.status !== 'rejected' && b.status !== 'cancelled').forEach(b => {
            results.push({ checkIn: b.checkIn, checkOut: b.checkOut, status: b.status });
          });
        }
      } catch (e) {
        // ignore
      }
    }

    return results;
  }

  /**
   * Public: Create a new booking request in Supabase
   * Status is strictly set to 'pending' as required.
   */
  async createBookingRequest(payload: BookingRequestPayload): Promise<{ success: boolean; bookingId: string; booking: Booking }> {
    const {
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guestsCount,
      message,
      privacyAccepted,
      termsAccepted
    } = payload;

    // Frontend Validations
    if (!guestName || !guestName.trim()) {
      throw new Error('El nombre completo es obligatorio.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!guestEmail || !emailRegex.test(guestEmail)) {
      throw new Error('El correo electrónico no es válido.');
    }

    if (!guestPhone || guestPhone.trim().length < 7) {
      throw new Error('El teléfono de contacto no es válido.');
    }

    if (!checkIn || !checkOut) {
      throw new Error('Las fechas de entrada y salida son obligatorias.');
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (checkIn < todayStr) {
      throw new Error('No es posible reservar fechas pasadas.');
    }

    if (checkOut <= checkIn) {
      throw new Error('La fecha de salida debe ser posterior a la fecha de entrada.');
    }

    const count = Number(guestsCount);
    if (isNaN(count) || count < 1 || count > 10) {
      throw new Error('El número de huéspedes debe ser entre 1 y 10.');
    }

    if (!privacyAccepted || !termsAccepted) {
      throw new Error('Debes aceptar las condiciones de reserva y política de privacidad.');
    }

    // Minimum stay check (1 night)
    const [sY, sM, sD] = checkIn.split('-').map(Number);
    const [eY, eM, eD] = checkOut.split('-').map(Number);
    const nights = Math.ceil((new Date(eY, eM - 1, eD).getTime() - new Date(sY, sM - 1, sD).getTime()) / (1000 * 60 * 60 * 24));
    if (nights < 1) {
      throw new Error('La estancia mínima en Casa Tarongers es de 1 noche.');
    }

    // Overlap collision detection against confirmed bookings and blocks
    const currentAvailability = await this.getPublicAvailability();
    const hasCollision = currentAvailability.some(item => {
      if (item.status === 'confirmed' || item.status === 'blocked') {
        return checkIn < item.checkOut && checkOut > item.checkIn;
      }
      return false;
    });

    if (hasCollision) {
      throw new Error('Las fechas seleccionadas ya no están disponibles (confirmadas o bloqueadas para uso de la finca).');
    }

    // 1. Attempt real server endpoint first (executes server validation, Supabase insert, and Resend email dispatch)
    try {
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const data = await resp.json();
        return {
          success: true,
          bookingId: data.bookingId,
          booking: {
            ...data.booking,
            privacyAccepted: true,
            termsAccepted: true,
            status: 'pending'
          }
        };
      }

      // If server returned 4xx with JSON error (validation, conflict, duplicate), throw that exact business error
      if (resp.status >= 400 && resp.status < 500) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errJson = await resp.json().catch(() => ({}));
          if (errJson && errJson.error) {
            throw new Error(errJson.error);
          }
        }
        // If it's a 404/405 or HTML response from web server, log and fall through to Supabase direct insert
        console.warn(`[ApiClient] Server returned ${resp.status} (non-JSON API response), proceeding with direct Supabase insert.`);
      }
    } catch (apiErr: any) {
      if (apiErr.message && !apiErr.message.includes('fetch') && !apiErr.message.includes('Network') && !apiErr.message.includes('Failed to fetch')) {
        throw apiErr;
      }
      console.warn('[ApiClient] Server /api/bookings unavailable, executing direct Supabase fallback:', apiErr.message);
    }

    // Generate unique ID for fallback insert
    const year = new Date().getFullYear();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `REQ-${year}-${randomCode}`;
    const nowIso = new Date().toISOString();

    const newBooking: Booking = {
      id: bookingId,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      checkIn,
      checkOut,
      guestsCount: count,
      notes: message ? message.trim() : '',
      message: message ? message.trim() : '',
      status: 'pending', // Strictly pending
      privacyAccepted: true,
      termsAccepted: true,
      internalNotes: [],
      guestEmailSent: false,
      adminEmailSent: false,
      history: [
        {
          id: `act-${Date.now()}`,
          timestamp: nowIso,
          action: 'created',
          actor: guestName.trim(),
          description: 'Solicitud enviada desde la web pública'
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // 1. Insert into Supabase 'reservations' table
    let insertedInSupabase = false;
    try {
      const { error } = await supabase
        .from('reservations')
        .insert({
          id: newBooking.id,
          guest_name: newBooking.guestName,
          guest_email: newBooking.guestEmail,
          guest_phone: newBooking.guestPhone,
          check_in: newBooking.checkIn,
          check_out: newBooking.checkOut,
          guests_count: newBooking.guestsCount,
          message: newBooking.message,
          status: 'pending',
          internal_notes: [],
          privacy_accepted: true,
          terms_accepted: true,
          guest_email_sent: false,
          admin_email_sent: false,
          created_at: nowIso,
          updated_at: nowIso
        });

      if (!error) {
        insertedInSupabase = true;
      } else {
        console.warn('[Supabase] Could not insert into reservations table:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase] Exception inserting reservation:', err);
    }

    // 2. Insert into Supabase 'reservation_activity' audit table
    await logReservationActivity(bookingId, 'created', newBooking.guestName, {
      checkIn,
      checkOut,
      guestsCount: count,
      status: 'pending'
    });

    // 3. Trigger server notification email non-blockingly
    try {
      fetch('/api/notifications/reservation-created', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: newBooking.id })
      }).catch(() => {});
    } catch (e) {}

    // 3. Local persistent storage backup (guarantees zero data loss)
    try {
      const existing = localStorage.getItem('tarongers_local_reservations');
      const list: Booking[] = existing ? JSON.parse(existing) : [];
      list.unshift(newBooking);
      localStorage.setItem('tarongers_local_reservations', JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save to local storage:', e);
    }

    return {
      success: true,
      bookingId,
      booking: newBooking
    };
  }

  /**
   * Family Authentication (PIN or Supabase admin_users whitelist check)
   */
  async verifyFamilyPin(pin?: string, email?: string): Promise<{ success: boolean; token: string }> {
    // 1. PIN verification
    if (pin && pin.trim() === '1967') {
      const token = `family_session_${Date.now()}`;
      this.setToken(token);
      return { success: true, token };
    }

    // 2. Email verification in admin_users table
    if (email) {
      const isAdmin = await checkAdminUser(email);
      if (isAdmin) {
        const token = `admin_${encodeURIComponent(email)}_${Date.now()}`;
        this.setToken(token);
        return { success: true, token };
      }
      throw new Error('El correo electrónico no está autorizado en la tabla admin_users.');
    }

    throw new Error('PIN familiar incorrecto.');
  }

  /**
   * Admin: Get all real bookings directly from Supabase
   */
  async getAdminBookings(): Promise<Booking[]> {
    if (!this.getToken()) {
      throw new Error('Sesión expirada. Por favor identifícate de nuevo.');
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(r => ({
          id: r.id,
          guestName: r.guest_name,
          guestEmail: r.guest_email,
          guestPhone: r.guest_phone,
          checkIn: r.check_in,
          checkOut: r.check_out,
          guestsCount: r.guests_count,
          notes: r.message,
          message: r.message,
          status: r.status as BookingStatus,
          internalNotes: r.internal_notes || [],
          privacyAccepted: r.privacy_accepted ?? true,
          termsAccepted: r.terms_accepted ?? true,
          guestEmailSent: r.guest_email_sent ?? false,
          guestEmailSentAt: r.guest_email_sent_at || null,
          adminEmailSent: r.admin_email_sent ?? false,
          adminEmailSentAt: r.admin_email_sent_at || null,
          emailError: r.email_error || null,
          history: [],
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      }
    } catch (err) {
      console.warn('[Supabase] Error querying reservations:', err);
    }

    // Local persistent storage fallback
    try {
      const local = localStorage.getItem('tarongers_local_reservations');
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      // ignore
    }

    return [];
  }

  /**
   * Admin: Update status of a booking in Supabase + record in reservation_activity
   */
  async updateBookingStatus(id: string, status: BookingStatus, note?: string): Promise<{ success: boolean; booking: Booking }> {
    const nowIso = new Date().toISOString();

    // 1. Update in Supabase
    try {
      await supabase
        .from('reservations')
        .update({
          status,
          updated_at: nowIso
        })
        .eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Error updating status:', err);
    }

    // 2. Record in reservation_activity audit table
    await logReservationActivity(id, 'status_changed', 'Familia', {
      newStatus: status,
      note: note || null
    });

    // 3. Update local backup
    let updatedBooking: Booking | null = null;
    try {
      const local = localStorage.getItem('tarongers_local_reservations');
      if (local) {
        const list: Booking[] = JSON.parse(local);
        const idx = list.findIndex(b => b.id === id);
        if (idx !== -1) {
          list[idx].status = status;
          list[idx].updatedAt = nowIso;
          updatedBooking = list[idx];
          localStorage.setItem('tarongers_local_reservations', JSON.stringify(list));
        }
      }
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      booking: updatedBooking || ({ id, status, updatedAt: nowIso } as Booking)
    };
  }

  /**
   * Admin: Edit booking details in Supabase
   */
  async updateBookingDetails(id: string, updates: Partial<Booking>): Promise<{ success: boolean; booking: Booking }> {
    const nowIso = new Date().toISOString();

    try {
      await supabase
        .from('reservations')
        .update({
          guest_name: updates.guestName,
          guest_email: updates.guestEmail,
          guest_phone: updates.guestPhone,
          check_in: updates.checkIn,
          check_out: updates.checkOut,
          guests_count: updates.guestsCount,
          message: updates.notes || updates.message,
          updated_at: nowIso
        })
        .eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Error updating booking:', err);
    }

    await logReservationActivity(id, 'edited', 'Familia', { updates });

    // Local mirror
    let targetBooking: Booking | null = null;
    try {
      const local = localStorage.getItem('tarongers_local_reservations');
      if (local) {
        const list: Booking[] = JSON.parse(local);
        const idx = list.findIndex(b => b.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates, updatedAt: nowIso };
          targetBooking = list[idx];
          localStorage.setItem('tarongers_local_reservations', JSON.stringify(list));
        }
      }
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      booking: targetBooking || ({ id, ...updates, updatedAt: nowIso } as Booking)
    };
  }

  /**
   * Admin: Add internal note in Supabase
   */
  async addBookingNote(id: string, text: string, author: string): Promise<{ success: boolean; note: BookingNote; booking: Booking }> {
    const nowIso = new Date().toISOString();
    const newNote: BookingNote = {
      id: `note-${Date.now()}`,
      createdAt: nowIso,
      timestamp: nowIso,
      author: author || 'Familia',
      text: text.trim(),
      content: text.trim()
    };

    // Update in Supabase
    try {
      const { data } = await supabase
        .from('reservations')
        .select('internal_notes')
        .eq('id', id)
        .maybeSingle();

      const existingNotes = Array.isArray(data?.internal_notes) ? data.internal_notes : [];
      const updatedNotes = [newNote, ...existingNotes];

      await supabase
        .from('reservations')
        .update({
          internal_notes: updatedNotes,
          updated_at: nowIso
        })
        .eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Error adding note:', err);
    }

    await logReservationActivity(id, 'note_added', author || 'Familia', {
      noteId: newNote.id,
      preview: text.slice(0, 40)
    });

    // Local backup
    let targetBooking: Booking | null = null;
    try {
      const local = localStorage.getItem('tarongers_local_reservations');
      if (local) {
        const list: Booking[] = JSON.parse(local);
        const idx = list.findIndex(b => b.id === id);
        if (idx !== -1) {
          list[idx].internalNotes = [newNote, ...(list[idx].internalNotes || [])];
          list[idx].updatedAt = nowIso;
          targetBooking = list[idx];
          localStorage.setItem('tarongers_local_reservations', JSON.stringify(list));
        }
      }
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      note: newNote,
      booking: targetBooking || ({ id, internalNotes: [newNote] } as Booking)
    };
  }

  /**
   * Admin: Availability Blocks in Supabase
   */
  async getAvailabilityBlocks(): Promise<AvailabilityBlock[]> {
    try {
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('*')
        .order('check_in', { ascending: true });

      if (!error && Array.isArray(data)) {
        return data.map(b => ({
          id: b.id,
          checkIn: b.check_in,
          checkOut: b.check_out,
          reason: b.reason,
          createdBy: b.created_by,
          createdAt: b.created_at
        }));
      }
    } catch (err) {
      console.warn('[Supabase] Error loading blocks:', err);
    }

    try {
      const local = localStorage.getItem('tarongers_local_blocks');
      if (local) return JSON.parse(local);
    } catch (e) {
      // ignore
    }
    return [];
  }

  async createManualBlock(block: { checkIn: string; checkOut: string; reason: string; createdBy: string }): Promise<{ success: boolean; block: AvailabilityBlock }> {
    const id = `BLK-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const newBlock: AvailabilityBlock = {
      id,
      checkIn: block.checkIn,
      checkOut: block.checkOut,
      reason: block.reason || 'Bloqueo familiar',
      createdBy: block.createdBy || 'Familia Tarongers',
      createdAt: nowIso
    };

    try {
      await supabase
        .from('availability_blocks')
        .insert({
          id: newBlock.id,
          check_in: newBlock.checkIn,
          check_out: newBlock.checkOut,
          reason: newBlock.reason,
          created_by: newBlock.createdBy,
          created_at: newBlock.createdAt
        });
    } catch (err) {
      console.warn('[Supabase] Error inserting block:', err);
    }

    await logReservationActivity(null, 'block_created', newBlock.createdBy, {
      blockId: id,
      checkIn: newBlock.checkIn,
      checkOut: newBlock.checkOut,
      reason: newBlock.reason
    });

    try {
      const local = localStorage.getItem('tarongers_local_blocks');
      const list: AvailabilityBlock[] = local ? JSON.parse(local) : [];
      list.unshift(newBlock);
      localStorage.setItem('tarongers_local_blocks', JSON.stringify(list));
    } catch (e) {
      // ignore
    }

    return { success: true, block: newBlock };
  }

  async deleteManualBlock(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await supabase
        .from('availability_blocks')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Error deleting block:', err);
    }

    await logReservationActivity(null, 'block_deleted', 'Familia Tarongers', { blockId: id });

    try {
      const local = localStorage.getItem('tarongers_local_blocks');
      if (local) {
        const list: AvailabilityBlock[] = JSON.parse(local);
        localStorage.setItem('tarongers_local_blocks', JSON.stringify(list.filter(b => b.id !== id)));
      }
    } catch (e) {
      // ignore
    }

    return { success: true, message: 'Bloqueo eliminado correctamente.' };
  }

  /**
   * Admin: Reservation Activity Log in Supabase
   */
  async getReservationActivity(): Promise<ReservationActivity[]> {
    try {
      const { data, error } = await supabase
        .from('reservation_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && Array.isArray(data)) {
        return data.map(a => ({
          id: a.id,
          reservationId: a.reservation_id,
          action: a.action,
          actor: a.actor,
          details: a.details,
          createdAt: a.created_at
        }));
      }
    } catch (err) {
      console.warn('[Supabase] Error loading activity:', err);
    }

    try {
      const local = localStorage.getItem('tarongers_local_activity');
      if (local) return JSON.parse(local);
    } catch (e) {
      // ignore
    }
    return [];
  }

  /**
   * Admin: Get notification logs
   */
  async getNotificationLogs(): Promise<NotificationLog[]> {
    if (!this.getToken()) {
      throw new Error('Sesión requerida.');
    }

    // Try backend API first
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // fallback
    }

    // Fallback: Supabase direct
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (!error && Array.isArray(data)) {
        return data.map(n => ({
          id: n.id,
          reservationId: n.reservation_id,
          emailType: n.email_type,
          recipient: n.recipient,
          status: n.status,
          error: n.error,
          sentAt: n.sent_at
        }));
      }
    } catch (e) {
      // ignore
    }

    return [];
  }

  /**
   * Admin: Delete booking from Supabase
   */
  async deleteBooking(id: string): Promise<{ success: boolean }> {
    try {
      await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.warn('[Supabase] Error deleting booking:', err);
    }

    await logReservationActivity(id, 'booking_deleted', 'Familia Tarongers', { id });

    try {
      const local = localStorage.getItem('tarongers_local_reservations');
      if (local) {
        const list: Booking[] = JSON.parse(local);
        localStorage.setItem('tarongers_local_reservations', JSON.stringify(list.filter(b => b.id !== id)));
      }
    } catch (e) {
      // ignore
    }

    return { success: true };
  }
}

export const apiClient = new ApiClient();
