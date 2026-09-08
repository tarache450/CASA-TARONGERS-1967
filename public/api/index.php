<?php
/**
 * Casa Tarongers 1967 — Serverless Production API Endpoint
 * Handles:
 * - POST /api/bookings (Validation, Supabase insertion, Resend email dispatch)
 * - GET /api/bookings/availability (Public occupied/blocked dates)
 * - GET /api/health
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Family-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load environment variables from .env if present
$envFile = __DIR__ . '/../.env';
if (!file_exists($envFile)) {
    $envFile = __DIR__ . '/../../.env';
}
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val, " \t\n\r\0\x0B\"'");
            if (!getenv($key)) {
                putenv("$key=$val");
                $_ENV[$key] = $val;
            }
        }
    }
}

$SUPABASE_URL = getenv('SUPABASE_URL') ?: 'https://cinuivjqxnsmcdqdrasy.supabase.co';
$SUPABASE_KEY = getenv('SUPABASE_ANON_KEY') ?: 'sb_publishable_pmlqfv43-CD33ot2pXFtmA_apcdGV9p';
$RESEND_API_KEY = getenv('RESEND_API_KEY');
$RESEND_FROM_EMAIL = getenv('RESEND_FROM_EMAIL') ?: 'Casa Tarongers 1967 <reservas@casatarongers1967.com>';
$FAMILY_EMAIL = getenv('FAMILY_RESERVATION_EMAIL') ?: 'acivit@coac.net';
$SITE_URL = getenv('PUBLIC_SITE_URL') ?: 'https://casatarongers1967.com';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

function escape_str($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function format_date($dateStr) {
    $parts = explode('-', $dateStr);
    if (count($parts) === 3) {
        return "{$parts[2]}/{$parts[1]}/{$parts[0]}";
    }
    return $dateStr;
}

function call_supabase($path, $method = 'GET', $body = null, $extraHeaders = []) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    $url = rtrim($SUPABASE_URL, '/') . '/rest/v1/' . ltrim($path, '/');
    $ch = curl_init($url);
    
    $headers = [
        'apikey: ' . $SUPABASE_KEY,
        'Authorization: Bearer ' . $SUPABASE_KEY,
        'Content-Type: application/json'
    ];
    foreach ($extraHeaders as $h) {
        $headers[] = $h;
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($body) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    } elseif ($method === 'PATCH') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        if ($body) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['status' => $status, 'data' => json_decode($response, true), 'raw' => $response];
}

function send_resend_email($to, $subject, $html) {
    global $RESEND_API_KEY, $RESEND_FROM_EMAIL;
    if (empty($RESEND_API_KEY)) {
        return ['success' => false, 'error' => 'RESEND_API_KEY not configured'];
    }

    $ch = curl_init('https://api.resend.com/emails');
    $payload = [
        'from' => $RESEND_FROM_EMAIL,
        'to' => is_array($to) ? $to : [$to],
        'subject' => $subject,
        'html' => $html
    ];

    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $RESEND_API_KEY,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $json = json_decode($resp, true);
    if ($httpCode >= 200 && $httpCode < 300) {
        return ['success' => true, 'id' => $json['id'] ?? null];
    }
    return ['success' => false, 'error' => $json['message'] ?? 'Resend error'];
}

// -------------------------------------------------------------
// ROUTE: Health
// -------------------------------------------------------------
if ($method === 'GET' && strpos($uri, 'health') !== false) {
    echo json_encode(['status' => 'ok', 'server' => 'php-hostinger', 'time' => gmdate('Y-m-d\TH:i:s\Z')]);
    exit;
}

// -------------------------------------------------------------
// ROUTE: POST /api/bookings
// -------------------------------------------------------------
if ($method === 'POST' && (strpos($uri, 'bookings') !== false || strpos($uri, 'index.php') !== false)) {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!$body || !is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos de solicitud inválidos.']);
        exit;
    }

    $guestName = trim($body['guestName'] ?? '');
    $guestEmail = trim(strtolower($body['guestEmail'] ?? ''));
    $guestPhone = trim($body['guestPhone'] ?? '');
    $checkIn = trim($body['checkIn'] ?? '');
    $checkOut = trim($body['checkOut'] ?? '');
    $guestsCount = intval($body['guestsCount'] ?? 2);
    $message = trim($body['message'] ?? ($body['notes'] ?? ''));

    // Validations
    if (empty($guestName)) {
        http_response_code(400);
        echo json_encode(['error' => 'El nombre completo es obligatorio.']);
        exit;
    }

    if (!filter_var($guestEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'El correo electrónico no es válido.']);
        exit;
    }

    if (strlen($guestPhone) < 7) {
        http_response_code(400);
        echo json_encode(['error' => 'El teléfono de contacto no es válido.']);
        exit;
    }

    if (empty($checkIn) || empty($checkOut)) {
        http_response_code(400);
        echo json_encode(['error' => 'Las fechas de entrada y salida son obligatorias.']);
        exit;
    }

    $today = gmdate('Y-m-d');
    if ($checkIn < $today) {
        http_response_code(400);
        echo json_encode(['error' => 'No es posible reservar fechas pasadas.']);
        exit;
    }

    if ($checkOut <= $checkIn) {
        http_response_code(400);
        echo json_encode(['error' => 'La fecha de salida debe ser posterior a la fecha de entrada.']);
        exit;
    }

    // Coherent Rule: Minimum Stay is 1 Night
    $d1 = strtotime($checkIn);
    $d2 = strtotime($checkOut);
    $nights = ceil(($d2 - $d1) / 86400);
    if ($nights < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'La estancia mínima en Casa Tarongers es de 1 noche.']);
        exit;
    }

    if ($guestsCount < 1 || $guestsCount > 10) {
        http_response_code(400);
        echo json_encode(['error' => 'El número de huéspedes debe ser entre 1 y 10.']);
        exit;
    }

    // Collision check against confirmed reservations & blocks in Supabase
    $resOverlap = call_supabase("reservations?select=check_in,check_out&status=eq.confirmed&check_in=lt.{$checkOut}&check_out=gt.{$checkIn}");
    if (!empty($resOverlap['data'])) {
        http_response_code(409);
        echo json_encode(['error' => 'Las fechas seleccionadas coinciden con una reserva confirmada.']);
        exit;
    }

    $blockOverlap = call_supabase("availability_blocks?select=check_in,check_out&check_in=lt.{$checkOut}&check_out=gt.{$checkIn}");
    if (!empty($blockOverlap['data'])) {
        http_response_code(409);
        echo json_encode(['error' => 'Las fechas seleccionadas están bloqueadas para uso de la finca.']);
        exit;
    }

    // Generate real Unique Booking ID
    $year = gmdate('Y');
    $randNum = mt_rand(1000, 9999);
    $id = "REQ-{$year}-{$randNum}";
    $nowIso = gmdate('Y-m-d\TH:i:s\Z');

    // 1. Save to Supabase 'reservations' table (STRICTLY FIRST)
    $insertData = [
        'id' => $id,
        'guest_name' => $guestName,
        'guest_email' => $guestEmail,
        'guest_phone' => $guestPhone,
        'check_in' => $checkIn,
        'check_out' => $checkOut,
        'guests_count' => $guestsCount,
        'message' => $message,
        'status' => 'pending',
        'internal_notes' => [],
        'privacy_accepted' => true,
        'terms_accepted' => true,
        'guest_email_sent' => false,
        'admin_email_sent' => false,
        'created_at' => $nowIso,
        'updated_at' => $nowIso
    ];

    $supaRes = call_supabase('reservations', 'POST', $insertData, ['Prefer: return=representation']);

    // 2. Audit Trail in reservation_activity
    call_supabase('reservation_activity', 'POST', [
        'reservation_id' => $id,
        'action' => 'created',
        'actor' => $guestName,
        'details' => ['checkIn' => $checkIn, 'checkOut' => $checkOut, 'status' => 'pending']
    ]);

    // 3. Dispatch Emails via Resend (strictly AFTER database insertion)
    $guestEmailSent = false;
    $adminEmailSent = false;
    $emailError = null;

    $safeName = escape_str($guestName);
    $safeCheckIn = format_date($checkIn);
    $safeCheckOut = format_date($checkOut);
    $safeGuests = $guestsCount;
    $safeMessage = !empty($message) ? escape_str($message) : null;
    $safeId = escape_str($id);
    $safeSiteUrl = escape_str($SITE_URL);

    // Guest Receipt Email
    $guestHtml = "
    <!DOCTYPE html>
    <html lang='es'>
    <body style='background-color:#FAFAF5; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#292524; margin:0; padding:20px;'>
      <div style='max-width:580px; margin:0 auto; background:#FFFFFF; border:1px solid #E7E5E4; border-radius:16px; padding:28px;'>
        <div style='text-align:center; padding-bottom:16px; border-bottom:1px solid #F5F5F0;'>
          <span style='font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#C05A3E; font-weight:bold;'>Masia Tradicional · 1967</span>
          <h1 style='font-family:Georgia,serif; color:#1C2E15; margin:6px 0 0 0; font-size:24px;'>Casa Tarongers 1967</h1>
        </div>
        <div style='padding-top:20px;'>
          <p style='font-size:16px; font-weight:bold; color:#1C2E15;'>Hola, {$safeName}:</p>
          <p style='font-size:14px; line-height:1.6; color:#44403C;'>Hemos recibido correctamente tu solicitud de estancia. A continuación tienes los detalles:</p>
          <table style='width:100%; font-size:13px; border-collapse:collapse; margin:16px 0; background:#FAFAF5; border-radius:8px; padding:12px;'>
            <tr><td style='padding:6px 12px; color:#78716C;'>Identificador:</td><td style='padding:6px 12px; text-align:right; font-weight:bold; font-family:monospace; color:#1C2E15;'>{$safeId}</td></tr>
            <tr><td style='padding:6px 12px; color:#78716C;'>Entrada:</td><td style='padding:6px 12px; text-align:right; font-weight:bold; color:#1C2E15;'>{$safeCheckIn}</td></tr>
            <tr><td style='padding:6px 12px; color:#78716C;'>Salida:</td><td style='padding:6px 12px; text-align:right; font-weight:bold; color:#1C2E15;'>{$safeCheckOut}</td></tr>
            <tr><td style='padding:6px 12px; color:#78716C;'>Huéspedes:</td><td style='padding:6px 12px; text-align:right; font-weight:bold; color:#1C2E15;'>{$safeGuests} personas</td></tr>
          </table>
          " . ($safeMessage ? "<p style='font-size:13px; color:#57534E;'><strong>Tu mensaje:</strong> <em>\"{$safeMessage}\"</em></p>" : "") . "
          <div style='background:#FFF7ED; border-left:4px solid #C05A3E; padding:14px; border-radius:4px; font-size:13px; color:#9A3412; margin:20px 0;'>
            <strong>Aviso importante:</strong> Este correo confirma la <strong>recepción de tu solicitud</strong>, no constituye la confirmación definitiva de la reserva. La familia Civit revisará las fechas y nos pondremos en contacto contigo.
          </div>
          <div style='font-size:13px; color:#57534E; line-height:1.6; padding-top:14px; border-top:1px solid #E7E5E4;'>
            Teléfono: <strong>+34 629 30 85 70</strong><br>
            Email: <a href='mailto:acivit@coac.net' style='color:#1C2E15;'>acivit@coac.net</a><br>
            Web: <a href='{$safeSiteUrl}' style='color:#C05A3E;'>casatarongers1967.com</a>
          </div>
        </div>
      </div>
    </body>
    </html>";

    $guestRes = send_resend_email($guestEmail, 'Hemos recibido tu solicitud de reserva en Casa Tarongers 1967', $guestHtml);
    if ($guestRes['success']) {
        $guestEmailSent = true;
        call_supabase('notification_logs', 'POST', [
            'id' => 'notif-' . uniqid(),
            'reservation_id' => $id,
            'email_type' => 'guest_receipt',
            'recipient' => $guestEmail,
            'status' => 'sent',
            'sent_at' => gmdate('Y-m-d\TH:i:s\Z')
        ]);
    } else {
        $emailError = $guestRes['error'] ?? 'Resend error';
        call_supabase('notification_logs', 'POST', [
            'id' => 'notif-' . uniqid(),
            'reservation_id' => $id,
            'email_type' => 'guest_receipt',
            'recipient' => $guestEmail,
            'status' => 'failed',
            'error' => $emailError,
            'sent_at' => gmdate('Y-m-d\TH:i:s\Z')
        ]);
    }

    // Family Internal Alert Email
    $familyHtml = "
    <!DOCTYPE html>
    <html lang='es'>
    <body style='background-color:#FAFAF5; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#292524; margin:0; padding:20px;'>
      <div style='max-width:580px; margin:0 auto; background:#FFFFFF; border:1px solid #E7E5E4; border-radius:16px; padding:28px;'>
        <h2 style='font-family:Georgia,serif; color:#1C2E15; margin-top:0;'>Nueva Solicitud de Reserva — {$safeId}</h2>
        <table style='width:100%; font-size:13px; border-collapse:collapse; margin-bottom:20px;'>
          <tr><td style='padding:8px 0; color:#78716C;'>Huésped:</td><td style='padding:8px 0; font-weight:bold;'>{$safeName}</td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Email:</td><td style='padding:8px 0; font-weight:bold;'><a href='mailto:{$guestEmail}'>{$guestEmail}</a></td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Teléfono:</td><td style='padding:8px 0; font-weight:bold;'><a href='tel:{$guestPhone}'>{$guestPhone}</a></td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Fechas:</td><td style='padding:8px 0; font-weight:bold;'>{$safeCheckIn} &rarr; {$safeCheckOut} ({$nights} noche/s)</td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Huéspedes:</td><td style='padding:8px 0; font-weight:bold;'>{$safeGuests} personas</td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Mensaje:</td><td style='padding:8px 0; font-style:italic;'>" . ($safeMessage ?: 'Sin mensaje') . "</td></tr>
        </table>
        <div style='text-align:center;'>
          <a href='{$safeSiteUrl}#reservas' style='display:inline-block; background:#1C2E15; color:#FFFFFF; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; font-size:13px;'>Abrir Panel Familiar</a>
        </div>
      </div>
    </body>
    </html>";

    $familyRes = send_resend_email($FAMILY_EMAIL, 'Nueva solicitud de reserva en Casa Tarongers 1967', $familyHtml);
    if ($familyRes['success']) {
        $adminEmailSent = true;
        call_supabase('notification_logs', 'POST', [
            'id' => 'notif-' . uniqid(),
            'reservation_id' => $id,
            'email_type' => 'family_alert',
            'recipient' => $FAMILY_EMAIL,
            'status' => 'sent',
            'sent_at' => gmdate('Y-m-d\TH:i:s\Z')
        ]);
    } else {
        call_supabase('notification_logs', 'POST', [
            'id' => 'notif-' . uniqid(),
            'reservation_id' => $id,
            'email_type' => 'family_alert',
            'recipient' => $FAMILY_EMAIL,
            'status' => 'failed',
            'error' => $familyRes['error'] ?? 'Resend error',
            'sent_at' => gmdate('Y-m-d\TH:i:s\Z')
        ]);
    }

    // 4. Update reservation with email flags
    call_supabase("reservations?id=eq.{$id}", 'PATCH', [
        'guest_email_sent' => $guestEmailSent,
        'guest_email_sent_at' => $guestEmailSent ? gmdate('Y-m-d\TH:i:s\Z') : null,
        'admin_email_sent' => $adminEmailSent,
        'admin_email_sent_at' => $adminEmailSent ? gmdate('Y-m-d\TH:i:s\Z') : null,
        'email_error' => $emailError
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'bookingId' => $id,
        'message' => 'Solicitud de reserva recibida y registrada correctamente.',
        'booking' => [
            'id' => $id,
            'guestName' => $guestName,
            'guestEmail' => $guestEmail,
            'guestPhone' => $guestPhone,
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'guestsCount' => $guestsCount,
            'status' => 'pending',
            'guestEmailSent' => $guestEmailSent,
            'adminEmailSent' => $adminEmailSent
        ]
    ]);
    exit;
}

// -------------------------------------------------------------
// ROUTE: POST /api/notifications/reservation-created
// -------------------------------------------------------------
if ($method === 'POST' && strpos($uri, 'reservation-created') !== false) {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    $bookingId = trim($body['bookingId'] ?? '');

    if (empty($bookingId)) {
        http_response_code(400);
        echo json_encode(['error' => 'bookingId es obligatorio.']);
        exit;
    }

    $resQuery = call_supabase("reservations?id=eq.{$bookingId}&select=*");
    if (empty($resQuery['data']) || !isset($resQuery['data'][0])) {
        http_response_code(404);
        echo json_encode(['error' => 'La reserva no existe en la base de datos.']);
        exit;
    }

    $b = $resQuery['data'][0];

    // Skip if already sent
    if (!empty($b['guest_email_sent']) && !empty($b['admin_email_sent'])) {
        echo json_encode(['success' => true, 'message' => 'Notificaciones ya enviadas previamente.', 'skipped' => true]);
        exit;
    }

    $safeName = escape_str($b['guest_name']);
    $safeCheckIn = format_date($b['check_in']);
    $safeCheckOut = format_date($b['check_out']);
    $safeGuests = $b['guests_count'];
    $safeMessage = !empty($b['message']) ? escape_str($b['message']) : null;
    $safeId = escape_str($b['id']);
    $safeSiteUrl = escape_str($SITE_URL);

    // Guest Receipt Email
    $guestHtml = "
    <!DOCTYPE html>
    <html lang='es'>
    <body style='background-color:#FAFAF5; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#292524; margin:0; padding:20px;'>
      <div style='max-width:580px; margin:0 auto; background:#FFFFFF; border:1px solid #E7E5E4; border-radius:16px; padding:28px;'>
        <div style='text-align:center; padding-bottom:16px; border-bottom:1px solid #F5F5F0;'>
          <span style='font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#C05A3E; font-weight:bold;'>Masia Tradicional · 1967</span>
          <h1 style='font-family:Georgia,serif; color:#1C2E15; margin:6px 0 0 0; font-size:24px;'>Casa Tarongers 1967</h1>
        </div>
        <div style='padding-top:20px;'>
          <p style='font-size:16px; font-weight:bold; color:#1C2E15;'>Hola, {$safeName}:</p>
          <p style='font-size:14px; line-height:1.6; color:#44403C;'>Hemos recibido correctamente tu solicitud de estancia. A continuación tienes los detalles:</p>
          <table style='width:100%; font-size:13px; border-collapse:collapse; margin:16px 0; background:#FAFAF5; border-radius:8px; padding:12px;'>
            <tr><td style='padding:6px 12px; color:#78716C;'>Identificador:</td><td style='padding:6px 12px; text-align:right; font-weight:bold; font-family:monospace; color:#1C2E15;'>{$safeId}</td></tr>
            <tr><td style='padding:6px 12px; color:#78716C;'>Entrada:</td><td style='padding:6px 12px; text-align:right; font-weight:bold; color:#1C2E15;'>{$safeCheckIn}</td></tr>
            <tr><td style='padding:6px 12px; color:#78716C;'>Salida:</td><td style='padding:6px 12px; text-align:right; font-weight:bold; color:#1C2E15;'>{$safeCheckOut}</td></tr>
            <tr><td style='padding:6px 12px; color:#78716C;'>Huéspedes:</td><td style='padding:6px 12px; text-align:right; font-weight:bold; color:#1C2E15;'>{$safeGuests} personas</td></tr>
          </table>
          " . ($safeMessage ? "<p style='font-size:13px; color:#57534E;'><strong>Tu mensaje:</strong> <em>\"{$safeMessage}\"</em></p>" : "") . "
          <div style='background:#FFF7ED; border-left:4px solid #C05A3E; padding:14px; border-radius:4px; font-size:13px; color:#9A3412; margin:20px 0;'>
            <strong>Aviso importante:</strong> Este correo confirma la <strong>recepción de tu solicitud</strong>, no constituye la confirmación definitiva de la reserva. La familia Civit revisará las fechas y nos pondremos en contacto contigo.
          </div>
          <div style='font-size:13px; color:#57534E; line-height:1.6; padding-top:14px; border-top:1px solid #E7E5E4;'>
            Teléfono: <strong>+34 629 30 85 70</strong><br>
            Email: <a href='mailto:acivit@coac.net' style='color:#1C2E15;'>acivit@coac.net</a><br>
            Web: <a href='{$safeSiteUrl}' style='color:#C05A3E;'>casatarongers1967.com</a>
          </div>
        </div>
      </div>
    </body>
    </html>";

    $guestRes = send_resend_email($b['guest_email'], 'Hemos recibido tu solicitud de reserva en Casa Tarongers 1967', $guestHtml);
    $guestEmailSent = $guestRes['success'];

    // Family Alert
    $familyHtml = "
    <!DOCTYPE html>
    <html lang='es'>
    <body style='background-color:#FAFAF5; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#292524; margin:0; padding:20px;'>
      <div style='max-width:580px; margin:0 auto; background:#FFFFFF; border:1px solid #E7E5E4; border-radius:16px; padding:28px;'>
        <h2 style='font-family:Georgia,serif; color:#1C2E15; margin-top:0;'>Nueva Solicitud de Reserva — {$safeId}</h2>
        <table style='width:100%; font-size:13px; border-collapse:collapse; margin-bottom:20px;'>
          <tr><td style='padding:8px 0; color:#78716C;'>Huésped:</td><td style='padding:8px 0; font-weight:bold;'>{$safeName}</td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Email:</td><td style='padding:8px 0; font-weight:bold;'><a href='mailto:{$b['guest_email']}'>{$b['guest_email']}</a></td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Teléfono:</td><td style='padding:8px 0; font-weight:bold;'><a href='tel:{$b['guest_phone']}'>{$b['guest_phone']}</a></td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Fechas:</td><td style='padding:8px 0; font-weight:bold;'>{$safeCheckIn} &rarr; {$safeCheckOut}</td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Huéspedes:</td><td style='padding:8px 0; font-weight:bold;'>{$safeGuests} personas</td></tr>
          <tr><td style='padding:8px 0; color:#78716C;'>Mensaje:</td><td style='padding:8px 0; font-style:italic;'>" . ($safeMessage ?: 'Sin mensaje') . "</td></tr>
        </table>
        <div style='text-align:center;'>
          <a href='{$safeSiteUrl}#reservas' style='display:inline-block; background:#1C2E15; color:#FFFFFF; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; font-size:13px;'>Abrir Panel Familiar</a>
        </div>
      </div>
    </body>
    </html>";

    $familyRes = send_resend_email($FAMILY_EMAIL, 'Nueva solicitud de reserva en Casa Tarongers 1967', $familyHtml);
    $adminEmailSent = $familyRes['success'];

    call_supabase("reservations?id=eq.{$bookingId}", 'PATCH', [
        'guest_email_sent' => $guestEmailSent,
        'guest_email_sent_at' => $guestEmailSent ? gmdate('Y-m-d\TH:i:s\Z') : null,
        'admin_email_sent' => $adminEmailSent,
        'admin_email_sent_at' => $adminEmailSent ? gmdate('Y-m-d\TH:i:s\Z') : null
    ]);

    echo json_encode(['success' => true, 'guestEmailSent' => $guestEmailSent, 'adminEmailSent' => $adminEmailSent]);
    exit;
}

// -------------------------------------------------------------
// Fallback
// -------------------------------------------------------------
http_response_code(404);
echo json_encode(['error' => 'Ruta no encontrada en API.']);
