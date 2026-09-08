import { Booking } from '../types';

export interface NotificationPayload {
  type: 
    | 'new_request_family'
    | 'new_request_guest_confirmation'
    | 'status_changed_family'
    | 'booking_confirmed_guest'
    | 'booking_rejected_guest'
    | 'booking_cancelled_guest';
  recipient: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  bookingId: string;
  createdAt: string;
}

/**
 * Servicio de Notificaciones para Casa Tarongers 1967
 *
 * Para activar el envío real de correos electrónicos vía SMTP/API:
 * 1. Configurar un proveedor como Resend, SendGrid o Nodemailer con SMTP de Hostinger.
 * 2. Agregar las credenciales en variables de entorno (ej: RESEND_API_KEY o SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 * 3. Conectar el método sendNotification real a un endpoint en el backend Express (/api/notify).
 */
class NotificationService {
  private log: NotificationPayload[] = [];

  constructor() {
    try {
      const stored = localStorage.getItem('tarongers_notifications_log_v1');
      if (stored) {
        this.log = JSON.parse(stored);
      }
    } catch {
      this.log = [];
    }
  }

  private persistLog() {
    try {
      localStorage.setItem('tarongers_notifications_log_v1', JSON.stringify(this.log.slice(-100)));
    } catch (e) {
      console.warn('Error saving notifications log', e);
    }
  }

  /**
   * Notifica a la familia de una nueva solicitud de reserva entrante
   */
  async notifyFamilyNewRequest(booking: Booking, familyEmail = 'acivit@coac.net'): Promise<NotificationPayload> {
    const payload: NotificationPayload = {
      type: 'new_request_family',
      recipient: familyEmail,
      subject: `[Nueva Solicitud] ${booking.id} - ${booking.guestName} (${booking.checkIn} al ${booking.checkOut})`,
      bodyText: `Hola Familia,\n\nSe ha recibido una nueva solicitud de reserva para Casa Tarongers:\n\n` +
        `• Solicitud ID: ${booking.id}\n` +
        `• Huésped: ${booking.guestName}\n` +
        `• Email: ${booking.guestEmail}\n` +
        `• Teléfono: ${booking.guestPhone}\n` +
        `• Fechas: ${booking.checkIn} al ${booking.checkOut}\n` +
        `• Huéspedes: ${booking.guestsCount}\n` +
        `• Mensaje: ${booking.notes || booking.message || 'Sin mensaje adicional'}\n\n` +
        `Accede al panel familiar para revisar y gestionar esta solicitud.`,
      bookingId: booking.id,
      createdAt: new Date().toISOString()
    };

    return this.dispatch(payload);
  }

  async sendFamilyNewRequestAlert(booking: Booking, familyEmail?: string): Promise<NotificationPayload> {
    return this.notifyFamilyNewRequest(booking, familyEmail);
  }

  /**
   * Envía confirmación de recepción al huésped
   */
  async notifyGuestRequestReceived(booking: Booking): Promise<NotificationPayload> {
    const payload: NotificationPayload = {
      type: 'new_request_guest_confirmation',
      recipient: booking.guestEmail,
      subject: `Solicitud de Reserva Recibida - Casa Tarongers 1967 (${booking.id})`,
      bodyText: `Estimado/a ${booking.guestName},\n\n` +
        `Hemos recibido tu solicitud de reserva para alojarte en Casa Tarongers 1967 del ${booking.checkIn} al ${booking.checkOut} (${booking.guestsCount} personas).\n\n` +
        `Identificador de solicitud: ${booking.id}\n\n` +
        `La familia revisará la disponibilidad y te responderemos a la mayor brevedad posible por email o WhatsApp.\n\n` +
        `Atentamente,\nFamilia Casa Tarongers 1967\nGelida, Alt Penedès`,
      bookingId: booking.id,
      createdAt: new Date().toISOString()
    };

    return this.dispatch(payload);
  }

  async sendGuestRequestReceived(booking: Booking): Promise<NotificationPayload> {
    return this.notifyGuestRequestReceived(booking);
  }

  /**
   * Envía confirmación definitiva de la reserva al huésped
   */
  async notifyGuestBookingConfirmed(booking: Booking): Promise<NotificationPayload> {
    const payload: NotificationPayload = {
      type: 'booking_confirmed_guest',
      recipient: booking.guestEmail,
      subject: `¡Reserva Confirmada! - Casa Tarongers 1967 (${booking.id})`,
      bodyText: `Estimado/a ${booking.guestName},\n\n` +
        `¡Nos alegra confirmarte que tu estancia en Casa Tarongers 1967 está CONFIRMADA!\n\n` +
        `• Entrada: ${booking.checkIn} (a partir de las 16:00)\n` +
        `• Salida: ${booking.checkOut} (hasta las 11:00)\n` +
        `• Personas: ${booking.guestsCount}\n\n` +
        `Nos pondremos en contacto contigo antes de tu llegada para coordinar la entrega de llaves e indicaciones de acceso a la finca.\n\n` +
        `Atentamente,\nFamilia Casa Tarongers 1967`,
      bookingId: booking.id,
      createdAt: new Date().toISOString()
    };

    return this.dispatch(payload);
  }

  async sendGuestBookingConfirmed(booking: Booking): Promise<NotificationPayload> {
    return this.notifyGuestBookingConfirmed(booking);
  }

  /**
   * Notifica al huésped cuando una solicitud es rechazada
   */
  async notifyGuestBookingRejected(booking: Booking, reason?: string): Promise<NotificationPayload> {
    const payload: NotificationPayload = {
      type: 'booking_rejected_guest',
      recipient: booking.guestEmail,
      subject: `Actualización sobre tu solicitud - Casa Tarongers 1967 (${booking.id})`,
      bodyText: `Estimado/a ${booking.guestName},\n\n` +
        `Lamentamos comunicarte que no podemos aceptar tu solicitud de reserva para las fechas del ${booking.checkIn} al ${booking.checkOut}` +
        (reason ? ` debido a: ${reason}.` : ` por motivos de disponibilidad en la finca.`) +
        `\n\nEsperamos poder recibirte en otra ocasión.\n\nAtentamente,\nFamilia Casa Tarongers 1967`,
      bookingId: booking.id,
      createdAt: new Date().toISOString()
    };

    return this.dispatch(payload);
  }

  async sendGuestBookingRejected(booking: Booking, reason?: string): Promise<NotificationPayload> {
    return this.notifyGuestBookingRejected(booking, reason);
  }

  /**
   * Notifica al huésped cuando una reserva es cancelada
   */
  async notifyGuestBookingCancelled(booking: Booking, reason?: string): Promise<NotificationPayload> {
    const payload: NotificationPayload = {
      type: 'booking_cancelled_guest',
      recipient: booking.guestEmail,
      subject: `Cancelación de Reserva - Casa Tarongers 1967 (${booking.id})`,
      bodyText: `Estimado/a ${booking.guestName},\n\n` +
        `Te confirmamos que la reserva ${booking.id} (${booking.checkIn} al ${booking.checkOut}) ha sido cancelada.` +
        (reason ? `\nMotivo: ${reason}` : '') +
        `\n\nSi ha sido un error o deseas consultar otras fechas, estamos a tu disposición.\n\nAtentamente,\nFamilia Casa Tarongers 1967`,
      bookingId: booking.id,
      createdAt: new Date().toISOString()
    };

    return this.dispatch(payload);
  }

  async sendGuestBookingCancelled(booking: Booking, reason?: string): Promise<NotificationPayload> {
    return this.notifyGuestBookingCancelled(booking, reason);
  }

  /**
   * Despacha la notificación: guarda en historial y log local, y prepara envío HTTP si existe backend configurado
   */
  private async dispatch(payload: NotificationPayload): Promise<NotificationPayload> {
    this.log.unshift(payload);
    this.persistLog();

    console.info(`[NotificationService] Dispatched: ${payload.type} to ${payload.recipient} - Subject: ${payload.subject}`);
    return payload;
  }

  getLogs(): NotificationPayload[] {
    return [...this.log];
  }
}

export const notificationService = new NotificationService();
