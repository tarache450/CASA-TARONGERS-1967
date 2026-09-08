import express from 'express';
import path from 'path';
import { createServer } from 'http';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Body Parser & CORS -----
app.use(express.json());

// ----- Security Headers -----
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// =============================================================
// DATABASE ADAPTER: Supabase 4 Tables + Local Disk Fallback
// Tables: reservations, availability_blocks, reservation_activity, admin_users
// =============================================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cinuivjqxnsmcdqdrasy.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_pmlqfv43-CD33ot2pXFtmA_apcdGV9p';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'reservations.json');
const BLOCKS_FILE = path.join(DATA_DIR, 'blocks.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create data dir:', e);
  }
}

// Ensure local files exist
[DB_FILE, BLOCKS_FILE, ACTIVITY_FILE].forEach(file => {
  if (!fs.existsSync(file)) {
    try {
      fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not initialize file:', file, e);
    }
  }
});

// --- HELPER: Supabase Request ---
async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
}

// --- 1. ACTIVITY LOGGER ---
async function logActivity(reservationId, action, actor, details = {}) {
  const nowIso = new Date().toISOString();
  const entry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    reservation_id: reservationId || null,
    action,
    actor: actor || 'Sistema',
    details,
    created_at: nowIso
  };

  // Try Supabase table: reservation_activity
  try {
    await supabaseFetch('reservation_activity', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  } catch (err) {
    // Silently continue to local fallback
  }

  // Fallback / local mirror
  try {
    let list = [];
    if (fs.existsSync(ACTIVITY_FILE)) {
      list = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf-8'));
    }
    list.unshift(entry);
    if (list.length > 500) list = list.slice(0, 500);
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write activity locally:', err);
  }
}

// --- 2. ADMIN USERS CHECK ---
async function verifyAdminUser(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return false;

  // 1. Check Supabase table: admin_users
  try {
    const res = await supabaseFetch(`admin_users?email=eq.${encodeURIComponent(cleanEmail)}&select=email,role`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return true;
    }
  } catch (err) {
    console.warn('Error checking admin_users in Supabase:', err);
  }

  // 2. Default fallback family whitelist
  const allowed = ['acivit@coac.net', 'familia@casatarongers1967.com'];
  return allowed.includes(cleanEmail);
}

// --- 3. RESERVATIONS CRUD ---
async function readAllBookings() {
  // Try Supabase table: reservations
  try {
    const res = await supabaseFetch('reservations?select=*&order=created_at.desc');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
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
          status: r.status,
          internalNotes: r.internal_notes || [],
          privacyAccepted: r.privacy_accepted,
          termsAccepted: r.terms_accepted,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      }
    }
  } catch (err) {
    console.warn('[Database] Querying Supabase reservations failed, reading local disk:', err.message);
  }

  // Local disk fallback
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading local reservations:', e);
  }
  return [];
}

async function saveAllBookingsLocally(bookings) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local reservations:', e);
  }
}

async function insertReservationDb(booking) {
  // Supabase
  try {
    await supabaseFetch('reservations', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        id: booking.id,
        guest_name: booking.guestName,
        guest_email: booking.guestEmail,
        guest_phone: booking.guestPhone,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests_count: booking.guestsCount,
        message: booking.notes || booking.message || '',
        status: booking.status,
        internal_notes: booking.internalNotes || [],
        privacy_accepted: booking.privacyAccepted ?? true,
        terms_accepted: booking.termsAccepted ?? true,
        created_at: booking.createdAt,
        updated_at: booking.updatedAt || booking.createdAt
      })
    });
  } catch (e) {
    console.warn('[Supabase] Insert failed:', e);
  }
}

async function updateReservationDb(booking) {
  // Supabase
  try {
    await supabaseFetch(`reservations?id=eq.${encodeURIComponent(booking.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        guest_name: booking.guestName,
        guest_email: booking.guestEmail,
        guest_phone: booking.guestPhone,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests_count: booking.guestsCount,
        message: booking.notes || booking.message || '',
        status: booking.status,
        internal_notes: booking.internalNotes || [],
        updated_at: new Date().toISOString()
      })
    });
  } catch (e) {
    console.warn('[Supabase] Update failed:', e);
  }
}

async function deleteReservationDb(id) {
  try {
    await supabaseFetch(`reservations?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('[Supabase] Delete failed:', e);
  }
}

// --- 4. AVAILABILITY BLOCKS CRUD ---
async function readAllBlocks() {
  try {
    const res = await supabaseFetch('availability_blocks?select=*&order=check_in.asc');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(b => ({
          id: b.id,
          checkIn: b.check_in,
          checkOut: b.check_out,
          reason: b.reason,
          createdBy: b.created_by,
          createdAt: b.created_at
        }));
      }
    }
  } catch (err) {
    console.warn('[Database] Querying Supabase availability_blocks failed, using local disk:', err.message);
  }

  try {
    if (fs.existsSync(BLOCKS_FILE)) {
      return JSON.parse(fs.readFileSync(BLOCKS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading local blocks:', e);
  }
  return [];
}

async function saveAllBlocksLocally(blocks) {
  try {
    fs.writeFileSync(BLOCKS_FILE, JSON.stringify(blocks, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving local blocks:', e);
  }
}

async function insertBlockDb(block) {
  try {
    await supabaseFetch('availability_blocks', {
      method: 'POST',
      body: JSON.stringify({
        id: block.id,
        check_in: block.checkIn,
        check_out: block.checkOut,
        reason: block.reason,
        created_by: block.createdBy || 'Familia Tarongers',
        created_at: block.createdAt
      })
    });
  } catch (e) {
    console.warn('[Supabase] Block insert failed:', e);
  }
}

async function deleteBlockDb(id) {
  try {
    await supabaseFetch(`availability_blocks?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('[Supabase] Block delete failed:', e);
  }
}

// --- 5. READ ACTIVITY LOG ---
async function readAllActivity() {
  try {
    const res = await supabaseFetch('reservation_activity?select=*&order=created_at.desc&limit=100');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(a => ({
          id: a.id,
          reservationId: a.reservation_id,
          action: a.action,
          actor: a.actor,
          details: a.details,
          createdAt: a.created_at
        }));
      }
    }
  } catch (err) {
    console.warn('[Database] Querying Supabase activity failed, reading local disk:', err.message);
  }

  try {
    if (fs.existsSync(ACTIVITY_FILE)) {
      return JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading local activity:', e);
  }
  return [];
}

// =============================================================
// AUTHENTICATION & SECURITY
// =============================================================
const FAMILY_PIN = process.env.FAMILY_PIN || '1967';
const JWT_SECRET = process.env.JWT_SECRET || 'casa_tarongers_secret_family_key_1967';

function createFamilyToken(userIdentifier = 'familia') {
  const payload = `family_${encodeURIComponent(userIdentifier)}_${Date.now()}`;
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

function verifyFamilyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, hmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  if (hmac !== expectedHmac) return false;

  const match = payload.match(/^family_(.+)_\d+$/);
  return !!match;
}

function requireFamilyAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-family-token'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (typeof authHeader === 'string') {
    token = authHeader;
  }

  if (!token || !verifyFamilyToken(token)) {
    return res.status(401).json({ error: 'Acceso no autorizado al panel familiar.' });
  }

  next();
}

// =============================================================
// API ROUTES
// =============================================================

// 1. Health check
app.get('/api/health', async (req, res) => {
  const bookings = await readAllBookings();
  const blocks = await readAllBlocks();
  res.json({
    status: 'ok',
    storage: 'supabase',
    totalBookings: bookings.length,
    totalBlocks: blocks.length,
    timestamp: new Date().toISOString()
  });
});

// 2. Public Availability (Combined reservations + availability_blocks)
app.get('/api/bookings/availability', async (req, res) => {
  try {
    const bookings = await readAllBookings();
    const blocks = await readAllBlocks();

    // Only expose non-sensitive dates and active status (no names, phones, emails or notes)
    const activeReservations = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'pending' || b.status === 'contacted' || b.status === 'new_request' || b.status === 'pending_review')
      .map(b => ({
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status
      }));

    const blockItems = blocks.map(b => ({
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: 'blocked'
    }));

    res.json([...activeReservations, ...blockItems]);
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: 'Error al consultar disponibilidad.' });
  }
});

// 3. Public Booking Request Submission (State is strictly 'pending')
app.post('/api/bookings', async (req, res) => {
  try {
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
    } = req.body;

    // Strict Server-side Validations
    if (!guestName || typeof guestName !== 'string' || !guestName.trim()) {
      return res.status(400).json({ error: 'El nombre completo es obligatorio.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!guestEmail || !emailRegex.test(guestEmail)) {
      return res.status(400).json({ error: 'El correo electrónico no es válido.' });
    }

    if (!guestPhone || typeof guestPhone !== 'string' || guestPhone.trim().length < 7) {
      return res.status(400).json({ error: 'El teléfono no es válido.' });
    }

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'Las fechas de entrada y salida son obligatorias.' });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (checkIn < todayStr) {
      return res.status(400).json({ error: 'No es posible reservar fechas pasadas.' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la fecha de entrada.' });
    }

    const count = Number(guestsCount);
    if (isNaN(count) || count < 1 || count > 10) {
      return res.status(400).json({ error: 'El número de huéspedes debe ser entre 1 y 10.' });
    }

    if (!privacyAccepted || !termsAccepted) {
      return res.status(400).json({ error: 'Debes aceptar las condiciones de reserva y política de privacidad.' });
    }

    // Minimum stay check (2 nights)
    const [sY, sM, sD] = checkIn.split('-').map(Number);
    const [eY, eM, eD] = checkOut.split('-').map(Number);
    const nights = Math.ceil((new Date(eY, eM - 1, eD) - new Date(sY, sM - 1, sD)) / (1000 * 60 * 60 * 24));
    if (nights < 2) {
      return res.status(400).json({ error: 'La estancia mínima en Casa Tarongers es de 2 noches.' });
    }

    const bookings = await readAllBookings();
    const blocks = await readAllBlocks();

    // Overlap collision with confirmed reservations or manual blocks
    const hasReservationCollision = bookings.some(b => {
      if (b.status === 'confirmed') {
        return checkIn < b.checkOut && checkOut > b.checkIn;
      }
      return false;
    });

    const hasBlockCollision = blocks.some(b => {
      return checkIn < b.checkOut && checkOut > b.checkIn;
    });

    if (hasReservationCollision || hasBlockCollision) {
      return res.status(409).json({ error: 'Las fechas seleccionadas no están disponibles (ya reservadas o bloqueadas para uso de la finca).' });
    }

    // Anti-duplicate protection (same email + same check-in within 30s)
    const isRecentDuplicate = bookings.some(b => {
      if (b.guestEmail === guestEmail.trim().toLowerCase() && b.checkIn === checkIn && b.checkOut === checkOut) {
        const diffMs = Date.now() - new Date(b.createdAt).getTime();
        return diffMs < 30000;
      }
      return false;
    });

    if (isRecentDuplicate) {
      return res.status(429).json({ error: 'Ya hemos recibido esta misma solicitud hace unos momentos. Por favor revisa tu correo.' });
    }

    // Unique ID generation
    const year = new Date().getFullYear();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const id = `REQ-${year}-${randomCode}`;
    const nowIso = new Date().toISOString();

    const newBooking = {
      id,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      checkIn,
      checkOut,
      guestsCount: count,
      notes: message ? message.trim() : '',
      message: message ? message.trim() : '',
      status: 'pending', // Strictly pending as requested
      privacyAccepted: true,
      termsAccepted: true,
      internalNotes: [],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Save to reservations
    bookings.unshift(newBooking);
    await saveAllBookingsLocally(bookings);
    await insertReservationDb(newBooking);

    // Record in reservation_activity
    await logActivity(id, 'created', newBooking.guestName, {
      checkIn,
      checkOut,
      guestsCount: count,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      bookingId: id,
      message: 'Solicitud de reserva recibida y registrada correctamente.',
      booking: {
        id: newBooking.id,
        guestName: newBooking.guestName,
        checkIn: newBooking.checkIn,
        checkOut: newBooking.checkOut,
        guestsCount: newBooking.guestsCount
      }
    });
  } catch (err) {
    console.error('Error creating booking request:', err);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de reserva.' });
  }
});

// 4. Admin Auth: Verify PIN or Supabase admin email
app.post('/api/auth/verify-pin', async (req, res) => {
  const { pin, email } = req.body;

  // Option A: PIN verification
  if (pin && pin.trim() === FAMILY_PIN) {
    const token = createFamilyToken(email || 'familia');
    return res.json({ success: true, token, role: 'admin' });
  }

  // Option B: Email verification in admin_users table
  if (email) {
    const isAdmin = await verifyAdminUser(email);
    if (isAdmin) {
      const token = createFamilyToken(email);
      return res.json({ success: true, token, role: 'admin' });
    }
    return res.status(403).json({ error: 'El correo electrónico no está autorizado en admin_users.' });
  }

  return res.status(401).json({ error: 'Credenciales familiares incorrectas.' });
});

// 5. Admin: Get all real reservations
app.get('/api/admin/bookings', requireFamilyAuth, async (req, res) => {
  try {
    const bookings = await readAllBookings();
    res.json(bookings);
  } catch (err) {
    console.error('Error in admin bookings:', err);
    res.status(500).json({ error: 'Error al consultar reservas.' });
  }
});

// 6. Admin: Update booking status ('pending', 'contacted', 'confirmed', 'rejected', 'cancelled')
app.patch('/api/admin/bookings/:id/status', requireFamilyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, actor } = req.body;

    const validStatuses = ['pending', 'new_request', 'pending_review', 'contacted', 'confirmed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado de reserva no válido.' });
    }

    const bookings = await readAllBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    const nowIso = new Date().toISOString();
    const target = bookings[index];
    const prevStatus = target.status;

    // Check collision if confirming
    if (status === 'confirmed') {
      const collision = bookings.some(b => {
        if (b.id !== id && b.status === 'confirmed') {
          return target.checkIn < b.checkOut && target.checkOut > b.checkIn;
        }
        return false;
      });

      const blocks = await readAllBlocks();
      const blockCollision = blocks.some(b => target.checkIn < b.checkOut && target.checkOut > b.checkIn);

      if (collision || blockCollision) {
        return res.status(409).json({ error: 'No se puede confirmar: coincide con otra reserva o bloqueo en esas fechas.' });
      }
    }

    target.status = status;
    target.updatedAt = nowIso;

    bookings[index] = target;
    await saveAllBookingsLocally(bookings);
    await updateReservationDb(target);

    // Record in reservation_activity
    await logActivity(id, 'status_changed', actor || 'Familia', {
      previousStatus: prevStatus,
      newStatus: status,
      note: note || null
    });

    res.json({ success: true, booking: target });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Error al actualizar el estado.' });
  }
});

// 7. Admin: Update booking details
app.patch('/api/admin/bookings/:id', requireFamilyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, guestsCount, guestName, guestEmail, guestPhone, notes, actor } = req.body;

    const bookings = await readAllBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    const nowIso = new Date().toISOString();
    const target = bookings[index];

    if (checkIn && checkOut && checkOut <= checkIn) {
      return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la de entrada.' });
    }

    const updates = {};
    if (checkIn) { target.checkIn = checkIn; updates.checkIn = checkIn; }
    if (checkOut) { target.checkOut = checkOut; updates.checkOut = checkOut; }
    if (guestsCount) { target.guestsCount = Number(guestsCount); updates.guestsCount = Number(guestsCount); }
    if (guestName) { target.guestName = guestName.trim(); updates.guestName = guestName.trim(); }
    if (guestEmail) { target.guestEmail = guestEmail.trim().toLowerCase(); updates.guestEmail = guestEmail.trim().toLowerCase(); }
    if (guestPhone) { target.guestPhone = guestPhone.trim(); updates.guestPhone = guestPhone.trim(); }
    if (notes !== undefined) {
      target.notes = notes;
      target.message = notes;
      updates.notes = notes;
    }

    target.updatedAt = nowIso;
    bookings[index] = target;

    await saveAllBookingsLocally(bookings);
    await updateReservationDb(target);

    // Record in reservation_activity
    await logActivity(id, 'edited', actor || 'Familia', { updates });

    res.json({ success: true, booking: target });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Error al editar la reserva.' });
  }
});

// 8. Admin: Add internal note
app.post('/api/admin/bookings/:id/notes', requireFamilyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'El texto de la nota no puede estar vacío.' });
    }

    const bookings = await readAllBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    const nowIso = new Date().toISOString();
    const target = bookings[index];

    const newNote = {
      id: `note-${Date.now()}`,
      createdAt: nowIso,
      timestamp: nowIso,
      author: author || 'Familia',
      text: text.trim(),
      content: text.trim()
    };

    target.internalNotes = [newNote, ...(target.internalNotes || [])];
    target.updatedAt = nowIso;

    bookings[index] = target;
    await saveAllBookingsLocally(bookings);
    await updateReservationDb(target);

    // Record in reservation_activity
    await logActivity(id, 'note_added', author || 'Familia', {
      noteId: newNote.id,
      preview: text.slice(0, 50)
    });

    res.json({ success: true, note: newNote, booking: target });
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).json({ error: 'Error al añadir nota.' });
  }
});

// 9. Admin: Availability Blocks
app.get('/api/admin/blocks', requireFamilyAuth, async (req, res) => {
  try {
    const blocks = await readAllBlocks();
    res.json(blocks);
  } catch (err) {
    console.error('Error fetching blocks:', err);
    res.status(500).json({ error: 'Error al consultar bloqueos.' });
  }
});

app.post('/api/admin/blocks', requireFamilyAuth, async (req, res) => {
  try {
    const { checkIn, checkOut, reason, createdBy } = req.body;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'Las fechas de inicio y fin son obligatorias.' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la de inicio.' });
    }

    const bookings = await readAllBookings();
    const collision = bookings.some(b => b.status === 'confirmed' && checkIn < b.checkOut && checkOut > b.checkIn);
    if (collision) {
      return res.status(409).json({ error: 'Hay reservas confirmadas en las fechas que deseas bloquear.' });
    }

    const nowIso = new Date().toISOString();
    const id = `BLK-${Date.now().toString().slice(-6)}`;

    const newBlock = {
      id,
      checkIn,
      checkOut,
      reason: reason ? reason.trim() : 'Uso de la familia',
      createdBy: createdBy || 'Familia Tarongers',
      createdAt: nowIso
    };

    const blocks = await readAllBlocks();
    blocks.unshift(newBlock);
    await saveAllBlocksLocally(blocks);
    await insertBlockDb(newBlock);

    // Record in reservation_activity
    await logActivity(null, 'block_created', createdBy || 'Familia Tarongers', {
      blockId: id,
      checkIn,
      checkOut,
      reason: newBlock.reason
    });

    res.status(201).json({ success: true, block: newBlock });
  } catch (err) {
    console.error('Error creating block:', err);
    res.status(500).json({ error: 'Error al crear bloqueo de fechas.' });
  }
});

app.delete('/api/admin/blocks/:id', requireFamilyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let blocks = await readAllBlocks();
    const found = blocks.find(b => b.id === id);

    if (!found) {
      return res.status(404).json({ error: 'Bloqueo no encontrado.' });
    }

    blocks = blocks.filter(b => b.id !== id);
    await saveAllBlocksLocally(blocks);
    await deleteBlockDb(id);

    // Record in reservation_activity
    await logActivity(null, 'block_deleted', 'Familia Tarongers', {
      blockId: id,
      checkIn: found.checkIn,
      checkOut: found.checkOut
    });

    res.json({ success: true, message: 'Bloqueo eliminado y fechas liberadas.' });
  } catch (err) {
    console.error('Error deleting block:', err);
    res.status(500).json({ error: 'Error al eliminar bloqueo.' });
  }
});

// 10. Admin: Activity Log (Audit Trail)
app.get('/api/admin/activity', requireFamilyAuth, async (req, res) => {
  try {
    const activity = await readAllActivity();
    res.json(activity);
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ error: 'Error al consultar historial de actividad.' });
  }
});

// 11. Admin: Delete booking
app.delete('/api/admin/bookings/:id', requireFamilyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let bookings = await readAllBookings();
    const target = bookings.find(b => b.id === id);

    if (!target) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    const filtered = bookings.filter(b => b.id !== id);
    await saveAllBookingsLocally(filtered);
    await deleteReservationDb(id);

    // Record in reservation_activity
    await logActivity(id, 'booking_deleted', 'Familia Tarongers', {
      guestName: target.guestName,
      dates: `${target.checkIn} - ${target.checkOut}`
    });

    res.json({ success: true, message: 'Reserva eliminada definitivamente.' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Error al eliminar reserva.' });
  }
});

// =============================================================
// STATIC ASSET SERVING & SPA FALLBACK
// =============================================================
const staticDir = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : __dirname;

app.use(express.static(staticDir, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// =============================================================
// START SERVER
// =============================================================
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🏡 Casa Tarongers 1967 running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`   Database: Supabase (${SUPABASE_URL}) + Local Mirror (${DATA_DIR})`);
  console.log(`   Started at: ${new Date().toISOString()}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
