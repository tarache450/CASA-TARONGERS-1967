import { Resend } from 'resend';

// Environment configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Casa Tarongers 1967 <onboarding@resend.dev>';
const FAMILY_RESERVATION_EMAIL = process.env.FAMILY_RESERVATION_EMAIL || 'acivit@coac.net';
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'https://casatarongers1967.com';

// Initialize Resend client only if API key is present
let resendClient = null;
if (RESEND_API_KEY) {
  try {
    resendClient = new Resend(RESEND_API_KEY);
  } catch (err) {
    console.warn('[EmailService] Could not initialize Resend client:', err.message);
  }
}

/**
 * HTML Sanitization to prevent injection
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format date for display in emails (DD/MM/YYYY)
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * 1. GUEST RECEIPT EMAIL TEMPLATE
 * Sent to guest confirming receipt of request (NOT a final confirmation)
 */
export function buildGuestReceiptHtml(booking) {
  const safeName = escapeHtml(booking.guestName);
  const safeId = escapeHtml(booking.id);
  const safeCheckIn = formatDate(booking.checkIn);
  const safeCheckOut = formatDate(booking.checkOut);
  const safeGuests = escapeHtml(String(booking.guestsCount));
  const safeMessage = booking.message ? escapeHtml(booking.message) : null;
  const siteUrl = escapeHtml(PUBLIC_SITE_URL);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud de Reserva — Casa Tarongers 1967</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAFAF5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292524; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 16px; overflow: hidden; margin-top: 30px; margin-bottom: 30px; }
    .header { background-color: #1C2E15; padding: 36px 30px; text-align: center; color: #FFFFFF; }
    .brand-sub { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #E5E1D8; margin-bottom: 8px; font-weight: 600; }
    .title { font-family: Georgia, serif; font-size: 26px; font-weight: normal; margin: 0; color: #FFFFFF; }
    .content { padding: 32px 30px; }
    .greeting { font-size: 17px; font-weight: 600; color: #1C2E15; margin-bottom: 16px; }
    .lead-text { font-size: 14px; line-height: 1.6; color: #44403C; margin-bottom: 24px; }
    .card { background-color: #FAFAF5; border: 1px solid #E7E5E4; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #C05A3E; margin-bottom: 14px; }
    .detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #F5F5F0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #78716C; }
    .detail-value { font-weight: 600; color: #1C2E15; font-family: 'SFMono-Regular', Consolas, monospace; }
    .notice-box { background-color: #FFF7ED; border-left: 4px solid #C05A3E; padding: 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 24px; font-size: 13px; line-height: 1.5; color: #9A3412; }
    .message-quote { background-color: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 8px; padding: 12px 16px; font-style: italic; font-size: 13px; color: #57534E; margin-top: 10px; }
    .cta-btn { display: inline-block; background-color: #1C2E15; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 13px; margin: 10px 0; }
    .contact-info { font-size: 13px; color: #57534E; line-height: 1.6; padding-top: 16px; border-top: 1px solid #E7E5E4; }
    .footer { background-color: #FAFAF5; padding: 24px 30px; text-align: center; font-size: 11px; color: #A8A29E; border-top: 1px solid #E7E5E4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-sub">Masia Tradicional · 1967</div>
      <h1 class="title">Casa Tarongers 1967</h1>
    </div>

    <div class="content">
      <div class="greeting">Hola, ${safeName}:</div>
      
      <p class="lead-text">
        Hemos recibido correctamente tu solicitud de estancia en <strong>Casa Tarongers 1967</strong>. A continuación tienes los detalles de tu solicitud:
      </p>

      <div class="card">
        <div class="card-title">Detalles de la Solicitud</div>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #EAE8E3;">
            <td style="padding: 7px 0; color: #78716C;">Identificador:</td>
            <td style="padding: 7px 0; text-align: right; font-weight: bold; font-family: monospace; color: #1C2E15;">${safeId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #EAE8E3;">
            <td style="padding: 7px 0; color: #78716C;">Fecha de entrada:</td>
            <td style="padding: 7px 0; text-align: right; font-weight: bold; color: #1C2E15;">${safeCheckIn}</td>
          </tr>
          <tr style="border-bottom: 1px solid #EAE8E3;">
            <td style="padding: 7px 0; color: #78716C;">Fecha de salida:</td>
            <td style="padding: 7px 0; text-align: right; font-weight: bold; color: #1C2E15;">${safeCheckOut}</td>
          </tr>
          <tr>
            <td style="padding: 7px 0; color: #78716C;">Número de huéspedes:</td>
            <td style="padding: 7px 0; text-align: right; font-weight: bold; color: #1C2E15;">${safeGuests} personas</td>
          </tr>
        </table>

        ${safeMessage ? `
          <div style="margin-top: 14px; pt-2; border-top: 1px dashed #E5E1D8;">
            <span style="font-size: 11px; font-weight: 600; color: #78716C; text-transform: uppercase;">Tu mensaje:</span>
            <div class="message-quote">"${safeMessage}"</div>
          </div>
        ` : ''}
      </div>

      <div class="notice-box">
        <strong>Aviso importante:</strong> Este correo electrónico confirma exclusivamente la <strong>recepción de tu solicitud</strong>, no constituye la confirmación definitiva de la reserva. La familia Civit revisará las fechas y nos pondremos en contacto contigo en un plazo inferior a 24 horas.
      </div>

      <div class="contact-info">
        <strong>¿Tienes alguna duda o petición especial?</strong><br>
        Teléfono / WhatsApp: <a href="tel:+34629308570" style="color: #1C2E15; font-weight: bold;">+34 629 30 85 70</a><br>
        Email: <a href="mailto:acivit@coac.net" style="color: #1C2E15; font-weight: bold;">acivit@coac.net</a><br>
        Web oficial: <a href="${siteUrl}" style="color: #C05A3E; text-decoration: underline;">casatarongers1967.com</a>
      </div>
    </div>

    <div class="footer">
      Casa Tarongers 1967 · Finca i Masia Familiar · Gestió Directa sense intermediaris<br>
      Aquest és un correu automàtic informatiu de recepció.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 2. FAMILY INTERNAL ALERT EMAIL TEMPLATE
 * Sent to FAMILY_RESERVATION_EMAIL on every new booking
 */
export function buildFamilyAlertHtml(booking) {
  const safeName = escapeHtml(booking.guestName);
  const safeEmail = escapeHtml(booking.guestEmail);
  const safePhone = escapeHtml(booking.guestPhone);
  const safeId = escapeHtml(booking.id);
  const safeCheckIn = formatDate(booking.checkIn);
  const safeCheckOut = formatDate(booking.checkOut);
  const safeGuests = escapeHtml(String(booking.guestsCount));
  const safeMessage = booking.message ? escapeHtml(booking.message) : 'Sin mensaje';
  const safeCreatedAt = new Date(booking.createdAt || Date.now()).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
  const siteUrl = escapeHtml(PUBLIC_SITE_URL);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Nueva Solicitud de Reserva — Casa Tarongers</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAF5; color: #292524; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E7E5E4; padding: 28px; }
    .badge { display: inline-block; background-color: #C05A3E; color: #FFFFFF; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.08em; }
    h2 { font-family: Georgia, serif; color: #1C2E15; margin: 12px 0 20px 0; font-size: 22px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
    td { padding: 8px 10px; border-bottom: 1px solid #F5F5F0; }
    td.label { color: #78716C; width: 38%; font-weight: 500; }
    td.val { color: #1C2E15; font-weight: 600; }
    .msg-box { background: #FAFAF5; border-left: 3px solid #1C2E15; padding: 12px 14px; font-size: 13px; color: #44403C; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
    .btn { display: inline-block; background: #1C2E15; color: #FFFFFF !important; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Nueva Solicitud Web</span>
    <h2>Solicitud ${safeId} recibida</h2>

    <table>
      <tr>
        <td class="label">Huésped:</td>
        <td class="val">${safeName}</td>
      </tr>
      <tr>
        <td class="label">Email:</td>
        <td class="val"><a href="mailto:${safeEmail}" style="color: #1C2E15;">${safeEmail}</a></td>
      </tr>
      <tr>
        <td class="label">Teléfono:</td>
        <td class="val"><a href="tel:${safePhone}" style="color: #1C2E15;">${safePhone}</a></td>
      </tr>
      <tr>
        <td class="label">Fechas:</td>
        <td class="val"><strong>${safeCheckIn}</strong> &rarr; <strong>${safeCheckOut}</strong></td>
      </tr>
      <tr>
        <td class="label">Huéspedes:</td>
        <td class="val">${safeGuests} personas</td>
      </tr>
      <tr>
        <td class="label">Fecha y hora:</td>
        <td class="val" style="font-family: monospace;">${safeCreatedAt}</td>
      </tr>
    </table>

    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78716C; margin-bottom: 6px;">Mensaje del huésped:</div>
    <div class="msg-box">
      ${safeMessage}
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${siteUrl}#reservas" class="btn">Abrir Panel Familiar</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send booking notification emails via Resend
 * 
 * Guarantees:
 * 1. Never runs before the booking is saved in the database.
 * 2. Does NOT throw errors or cancel the booking if Resend fails.
 * 3. Records logs and errors into notification_logs.
 */
export async function sendNewReservationEmails(booking, logFn = null) {
  const results = {
    guestEmailSent: false,
    adminEmailSent: false,
    error: null
  };

  // If no Resend API key is configured, record that notifications are disabled
  if (!RESEND_API_KEY || !resendClient) {
    console.warn('[EmailService] RESEND_API_KEY is not configured. Email notifications skipped.');
    if (logFn) {
      await logFn(booking.id, 'guest_receipt', booking.guestEmail, 'failed', 'RESEND_API_KEY not configured');
      await logFn(booking.id, 'family_alert', FAMILY_RESERVATION_EMAIL, 'failed', 'RESEND_API_KEY not configured');
    }
    results.error = 'RESEND_API_KEY not configured';
    return results;
  }

  // 1. Send Guest Receipt Email
  try {
    const guestHtml = buildGuestReceiptHtml(booking);
    const guestRes = await resendClient.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [booking.guestEmail],
      subject: 'Hemos recibido tu solicitud de reserva en Casa Tarongers 1967',
      html: guestHtml
    });

    if (guestRes && (guestRes.data || guestRes.id)) {
      results.guestEmailSent = true;
      console.log(`[EmailService] Receipt sent to guest ${booking.guestEmail} (Resend ID: ${guestRes.data?.id || guestRes.id})`);
      if (logFn) {
        await logFn(booking.id, 'guest_receipt', booking.guestEmail, 'sent', null);
      }
    } else if (guestRes.error) {
      console.warn(`[EmailService] Resend error for guest email:`, guestRes.error);
      results.error = guestRes.error.message || 'Resend error';
      if (logFn) {
        await logFn(booking.id, 'guest_receipt', booking.guestEmail, 'failed', guestRes.error.message);
      }
    }
  } catch (err) {
    console.error(`[EmailService] Exception sending guest email:`, err.message);
    results.error = err.message;
    if (logFn) {
      await logFn(booking.id, 'guest_receipt', booking.guestEmail, 'failed', err.message);
    }
  }

  // 2. Send Family Internal Alert Email
  try {
    const familyHtml = buildFamilyAlertHtml(booking);
    const familyRes = await resendClient.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [FAMILY_RESERVATION_EMAIL],
      subject: 'Nueva solicitud de reserva en Casa Tarongers 1967',
      html: familyHtml
    });

    if (familyRes && (familyRes.data || familyRes.id)) {
      results.adminEmailSent = true;
      console.log(`[EmailService] Alert sent to family ${FAMILY_RESERVATION_EMAIL} (Resend ID: ${familyRes.data?.id || familyRes.id})`);
      if (logFn) {
        await logFn(booking.id, 'family_alert', FAMILY_RESERVATION_EMAIL, 'sent', null);
      }
    } else if (familyRes.error) {
      console.warn(`[EmailService] Resend error for family email:`, familyRes.error);
      if (logFn) {
        await logFn(booking.id, 'family_alert', FAMILY_RESERVATION_EMAIL, 'failed', familyRes.error.message);
      }
    }
  } catch (err) {
    console.error(`[EmailService] Exception sending family alert email:`, err.message);
    if (logFn) {
      await logFn(booking.id, 'family_alert', FAMILY_RESERVATION_EMAIL, 'failed', err.message);
    }
  }

  return results;
}

/**
 * Future State: Send Confirmation Email
 */
export async function sendBookingConfirmedEmail(booking, logFn = null) {
  if (!resendClient || !RESEND_API_KEY) return { sent: false, error: 'Resend not configured' };
  try {
    const safeName = escapeHtml(booking.guestName);
    const safeId = escapeHtml(booking.id);
    const safeCheckIn = formatDate(booking.checkIn);
    const safeCheckOut = formatDate(booking.checkOut);

    const html = `
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; padding: 20px; border: 1px solid #e5e1d8; border-radius: 12px;">
        <h2 style="color: #1C2E15; font-family: Georgia, serif;">¡Reserva confirmada en Casa Tarongers 1967!</h2>
        <p>Hola, ${safeName}:</p>
        <p>Nos complace comunicarte que tu solicitud de reserva <strong>${safeId}</strong> para las fechas del <strong>${safeCheckIn} al ${safeCheckOut}</strong> ha sido <strong>confirmada formalmente</strong> por la familia.</p>
        <p>Nos pondremos en contacto contigo en los días previos a tu llegada para coordinar la entrega de llaves y los detalles de bienvenida.</p>
        <p>¡Esperamos que disfrutes de una estancia inolvidable!</p>
        <p style="color: #78716c; font-size: 12px; margin-top: 24px;">Casa Tarongers 1967 · Tel. +34 629 30 85 70</p>
      </div>
    `;

    const res = await resendClient.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [booking.guestEmail],
      subject: '¡Tu reserva en Casa Tarongers 1967 está confirmada!',
      html
    });

    if (logFn) {
      await logFn(booking.id, 'booking_confirmed', booking.guestEmail, res.error ? 'failed' : 'sent', res.error?.message || null);
    }
    return { sent: !res.error, id: res.data?.id };
  } catch (err) {
    if (logFn) await logFn(booking.id, 'booking_confirmed', booking.guestEmail, 'failed', err.message);
    return { sent: false, error: err.message };
  }
}

/**
 * Future State: Send Rejection Email (prepared for future automatic dispatch)
 */
export async function sendBookingRejectedEmail(booking, reason = '', logFn = null) {
  if (!resendClient || !RESEND_API_KEY) return { sent: false, error: 'Resend not configured' };
  try {
    const safeName = escapeHtml(booking.guestName);
    const safeId = escapeHtml(booking.id);
    const safeCheckIn = formatDate(booking.checkIn);
    const safeCheckOut = formatDate(booking.checkOut);
    const safeReason = reason ? escapeHtml(reason) : null;
    const siteUrl = escapeHtml(PUBLIC_SITE_URL);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E7E5E4; border-radius: 14px; background-color: #FFFFFF; color: #292524;">
        <h2 style="color: #1C2E15; font-family: Georgia, serif; margin-top: 0;">Actualización sobre tu solicitud en Casa Tarongers 1967</h2>
        <p>Hola, ${safeName}:</p>
        <p>Te agradecemos sinceramente tu interés en alojarte en <strong>Casa Tarongers 1967</strong>.</p>
        <p>Lamentamos comunicarte que para las fechas solicitadas (<strong>${safeCheckIn} al ${safeCheckOut}</strong>, solicitud <code>${safeId}</code>), no nos es posible acoger tu estancia ${safeReason ? `debido a: <em>${safeReason}</em>` : 'debido a compromisos previos y uso de la finca familiar'}.</p>
        <p>Te invitamos a consultar nuestro calendario en futuras ocasiones si tus fechas son flexibles.</p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E7E5E4; font-size: 12px; color: #78716C;">
          Casa Tarongers 1967 · Tel. +34 629 30 85 70 · <a href="${siteUrl}" style="color: #1C2E15;">casatarongers1967.com</a>
        </div>
      </div>
    `.trim();

    const res = await resendClient.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [booking.guestEmail],
      subject: 'Información sobre tu solicitud de reserva en Casa Tarongers 1967',
      html
    });

    if (logFn) {
      await logFn(booking.id, 'booking_rejected', booking.guestEmail, res.error ? 'failed' : 'sent', res.error?.message || null);
    }
    return { sent: !res.error, id: res.data?.id };
  } catch (err) {
    if (logFn) await logFn(booking.id, 'booking_rejected', booking.guestEmail, 'failed', err.message);
    return { sent: false, error: err.message };
  }
}

/**
 * Future State: Send Cancellation Email (prepared for future automatic dispatch)
 */
export async function sendBookingCancelledEmail(booking, reason = '', logFn = null) {
  if (!resendClient || !RESEND_API_KEY) return { sent: false, error: 'Resend not configured' };
  try {
    const safeName = escapeHtml(booking.guestName);
    const safeId = escapeHtml(booking.id);
    const safeCheckIn = formatDate(booking.checkIn);
    const safeCheckOut = formatDate(booking.checkOut);
    const safeReason = reason ? escapeHtml(reason) : null;
    const siteUrl = escapeHtml(PUBLIC_SITE_URL);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E7E5E4; border-radius: 14px; background-color: #FFFFFF; color: #292524;">
        <h2 style="color: #991B1B; font-family: Georgia, serif; margin-top: 0;">Cancelación de reserva — Casa Tarongers 1967</h2>
        <p>Hola, ${safeName}:</p>
        <p>Te confirmamos que la reserva con identificador <strong>${safeId}</strong> prevista del <strong>${safeCheckIn} al ${safeCheckOut}</strong> ha sido <strong>cancelada</strong>.</p>
        ${safeReason ? `<p>Motivo: <em>${safeReason}</em></p>` : ''}
        <p>Si consideras que se trata de un error o deseas reprogramar tu estancia, por favor ponte en contacto con nosotros directamente.</p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E7E5E4; font-size: 12px; color: #78716C;">
          Casa Tarongers 1967 · Tel. +34 629 30 85 70 · <a href="${siteUrl}" style="color: #1C2E15;">casatarongers1967.com</a>
        </div>
      </div>
    `.trim();

    const res = await resendClient.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [booking.guestEmail],
      subject: 'Cancelación de reserva en Casa Tarongers 1967',
      html
    });

    if (logFn) {
      await logFn(booking.id, 'booking_cancelled', booking.guestEmail, res.error ? 'failed' : 'sent', res.error?.message || null);
    }
    return { sent: !res.error, id: res.data?.id };
  } catch (err) {
    if (logFn) await logFn(booking.id, 'booking_cancelled', booking.guestEmail, 'failed', err.message);
    return { sent: false, error: err.message };
  }
}
