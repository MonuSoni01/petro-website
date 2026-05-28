<?php
/*
 ╔══════════════════════════════════════════════════════════╗
 ║  PETRO ERP — Admin Analytics Dashboard                  ║
 ║  Version 2.0 | IST Time Fixed | Premium Design          ║
 ╚══════════════════════════════════════════════════════════╝

 ⚠️  TIME BUG FIX:
     MySQL event_time stores in server timezone (usually UTC).
     We use CONVERT_TZ(event_time, '+00:00', '+05:30') to show IST.
     If your MySQL server is already IST, remove CONVERT_TZ wrapping.
*/

date_default_timezone_set('Asia/Kolkata');
session_start();

// ── CSRF Token ────────────────────────────────────────────────────────────────
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

require_once "db.php";

define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'Petro@2026');

// ── LOGOUT ────────────────────────────────────────────────────────────────────
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: petro-admin-analytics.php');
    exit;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if ($_POST['username'] === ADMIN_USER && $_POST['password'] === ADMIN_PASS) {
        session_regenerate_id(true);
        $_SESSION['tracker_logged_in'] = true;
        header('Location: petro-admin-analytics.php');
        exit;
    }
    $login_error = 'Invalid username or password';
}

// ── AUTH GUARD ────────────────────────────────────────────────────────────────
if (!isset($_SESSION['tracker_logged_in'])) { ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
<title>Petro Analytics — Secure Login</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --p: #00c4b4;
  --p2: #008f83;
  --bg: #030d0e;
}
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
/* Animated grid bg */
.bg {
  position: fixed; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,196,180,.12), transparent),
    radial-gradient(ellipse 60% 80% at 80% 90%, rgba(0,143,131,.10), transparent);
}
.grid-lines {
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(0,196,180,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,196,180,.06) 1px, transparent 1px);
  background-size: 48px 48px;
}
/* Login card */
.card {
  position: relative; z-index: 10;
  width: 100%; max-width: 420px;
  margin: 20px;
  background: rgba(255,255,255,.035);
  backdrop-filter: blur(32px) saturate(150%);
  border: 1px solid rgba(0,196,180,.2);
  border-radius: 28px;
  padding: 48px 40px 44px;
  box-shadow: 0 0 0 1px rgba(0,196,180,.05), 0 48px 96px rgba(0,0,0,.7);
  animation: rise .6s cubic-bezier(.22,1,.36,1) both;
}
@keyframes rise {
  from { opacity:0; transform: translateY(40px) scale(.97); }
  to   { opacity:1; transform: none; }
}
.brand {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 40px;
}
.brand-icon {
  width: 54px; height: 54px;
  background: linear-gradient(135deg, var(--p), var(--p2));
  border-radius: 16px;
  display: grid; place-items: center;
  font-size: 26px; font-weight: 800; color: #fff;
  box-shadow: 0 8px 28px rgba(0,196,180,.35);
  flex-shrink: 0;
  letter-spacing: -1px;
}
.brand-text h2 { color: #fff; font-size: 20px; font-weight: 800; }
.brand-text p  { color: rgba(255,255,255,.4); font-size: 12px; margin-top: 2px; }
.error-box {
  background: rgba(239,68,68,.12);
  border: 1px solid rgba(239,68,68,.3);
  color: #fca5a5;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  margin-bottom: 22px;
  display: flex; align-items: center; gap: 8px;
}
.field { margin-bottom: 18px; }
.field label {
  display: block;
  color: rgba(255,255,255,.45);
  font-size: 11px; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
  margin-bottom: 8px;
}
.field input {
  width: 100%;
  background: rgba(255,255,255,.055);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  padding: 14px 16px;
  color: #fff;
  font-family: inherit; font-size: 15px;
  outline: none;
  transition: border-color .2s, background .2s, box-shadow .2s;
}
.field input::placeholder { color: rgba(255,255,255,.25); }
.field input:focus {
  border-color: rgba(0,196,180,.6);
  background: rgba(0,196,180,.07);
  box-shadow: 0 0 0 4px rgba(0,196,180,.12);
}
.btn-submit {
  width: 100%; margin-top: 8px;
  padding: 15px;
  background: linear-gradient(135deg, var(--p), var(--p2));
  color: #fff; border: none; border-radius: 12px;
  font-family: inherit; font-size: 15px; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(0,196,180,.35);
  transition: transform .2s, box-shadow .2s;
}
.btn-submit:hover  { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0,196,180,.45); }
.btn-submit:active { transform: none; }
</style>
</head>
<body>
<div class="bg"></div>
<div class="grid-lines"></div>
<form class="card" method="POST" action="petro-admin-analytics.php">
  <div class="brand">
    <div class="brand-icon">PE</div>
    <div class="brand-text">
      <h2>PETRO TRACKING</h2>
      <p>Analytics Dashboard · Secure Area</p>
    </div>
  </div>
  <?php if (!empty($login_error)): ?>
    <div class="error-box">⚠ <?= htmlspecialchars($login_error) ?></div>
  <?php endif; ?>
  <div class="field">
    <label>Username</label>
    <input type="text" name="username" placeholder="Enter admin username" autocomplete="username" required>
  </div>
  <div class="field">
    <label>Password</label>
    <input type="password" name="password" placeholder="••••••••" autocomplete="current-password" required>
  </div>
  <button class="btn-submit" type="submit" name="login">Sign in to Dashboard →</button>
</form>
</body>
</html>
<?php exit; }

// ══════════════════════════════════════════════════════════════════════════════
//  AUTHENTICATED AREA
// ══════════════════════════════════════════════════════════════════════════════

// ── RESET (CSRF protected) ────────────────────────────────────────────────────
if (
    isset($_POST['reset_data'], $_POST['csrf_token']) &&
    hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])
) {
    $conn->query('TRUNCATE TABLE tracker_events');
    session_regenerate_id(true);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    header('Location: petro-admin-analytics.php?msg=reset');
    exit;
}

// ── CSV EXPORT ────────────────────────────────────────────────────────────────
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=petro-analytics-' . date('Y-m-d') . '.csv');
    $out = fopen('php://output', 'w');
    fputs($out, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel
    fputcsv($out, ['ID','Event','Label','Page','Device','Browser','IP','Country','State','City','Pincode','Date','Time (IST)','Created At']);
    $res = $conn->query("
        SELECT id, event_name, label_name, page_path, device, browser, ip_address,
       country, state_name, city_name, pincode,
       event_date,
       TIME_FORMAT(event_time, '%H:%i:%s') AS event_time_ist,
       created_at
FROM tracker_events ORDER BY id DESC
    ");
    while ($r = $res->fetch_assoc()) {
       fputcsv($out, [
    $r['id'],
    $r['event_name'],
    $r['label_name'],
    $r['page_path'],
    $r['device'],
    $r['browser'],
    $r['ip_address'],
    $r['country'],
    $r['state_name'],
    $r['city_name'],
    $r['pincode'],
    $r['event_date'],
    $r['event_time_ist'],
    $r['created_at']
]);
    }
    fclose($out);
    exit;
}

// ── DATE RANGE ────────────────────────────────────────────────────────────────
$dateFrom = !empty($_GET['from']) ? $conn->real_escape_string($_GET['from']) : date('Y-m-d', strtotime('-30 days'));
$dateTo   = !empty($_GET['to'])   ? $conn->real_escape_string($_GET['to'])   : date('Y-m-d');
$dRange   = "event_date BETWEEN '$dateFrom' AND '$dateTo'";

/*
 ┌─────────────────────────────────────────────────────────────┐
 │  TIME BUG EXPLANATION & FIX                                 │
 │                                                             │
 │  Problem: MySQL stores time in server TZ (often UTC).      │
 │  Your server shows 07:42 but IST should be 13:12 (+5:30)  │
 │                                                             │
 │  Fix: CONVERT_TZ(time_col, '+00:00', '+05:30')            │
 │                                                             │
 │  If MySQL server is ALREADY in IST, then times are correct │
 │  and no conversion needed. Check with: SELECT NOW();       │
 └─────────────────────────────────────────────────────────────┘
*/
define('TZ_FROM', '+05:30');   // Change to '+05:30' if server already IST
define('TZ_TO',   '+05:30');   // Target: India Standard Time

// Helper: wrap time col with IST conversion
function istTime($col = 'event_time', $dateCol = 'event_date') {
    return "TIME_FORMAT(CONVERT_TZ(CONCAT($dateCol,' ',$col), '" . TZ_FROM . "', '" . TZ_TO . "'), '%H:%i:%s')";
}
function istHour($col = 'event_time', $dateCol = 'event_date') {
    return "HOUR(CONVERT_TZ(CONCAT($dateCol,' ',$col), '" . TZ_FROM . "', '" . TZ_TO . "'))";
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function q($conn, $sql) { return $conn->query($sql)->fetch_assoc(); }

$totalEvents = q($conn, "SELECT COUNT(*) c FROM tracker_events WHERE $dRange")['c'];
$totalClicks = q($conn, "SELECT COUNT(*) c FROM tracker_events WHERE $dRange AND event_name NOT LIKE 'page_view' AND event_name NOT LIKE 'scroll_%'")['c'];
$pageViews   = q($conn, "SELECT COUNT(*) c FROM tracker_events WHERE $dRange AND event_name='page_view'")['c'];
$sessions    = q($conn, "SELECT COUNT(DISTINCT session_id) c FROM tracker_events WHERE $dRange")['c'];
$uniqueIPs   = q($conn, "SELECT COUNT(DISTINCT ip_address) c FROM tracker_events WHERE $dRange")['c'];
$days        = max(1, (strtotime($dateTo) - strtotime($dateFrom)) / 86400 + 1);
$avgPerDay   = $days > 0 ? round($totalEvents / $days) : 0;
$bounceRate  = $sessions > 0 ? round(($pageViews / $sessions), 1) : 0; // pages per session

// ── TOP BUTTONS ───────────────────────────────────────────────────────────────
$topBtnsRes = $conn->query("
    SELECT label_name, COUNT(*) total
    FROM tracker_events
    WHERE $dRange AND event_name NOT LIKE 'page_view' AND event_name NOT LIKE 'scroll_%'
    GROUP BY label_name ORDER BY total DESC LIMIT 10
");
$btnRows = []; $maxBtn = 1;
while ($r = $topBtnsRes->fetch_assoc()) { $btnRows[] = $r; if ($r['total'] > $maxBtn) $maxBtn = $r['total']; }

// ── TOP PAGES ─────────────────────────────────────────────────────────────────
$topPagesRes = $conn->query("
    SELECT page_path, COUNT(*) total
    FROM tracker_events
    WHERE $dRange AND event_name='page_view'
    GROUP BY page_path ORDER BY total DESC LIMIT 10
");
$pageRows = []; $maxPage = 1;
while ($r = $topPagesRes->fetch_assoc()) { $pageRows[] = $r; if ($r['total'] > $maxPage) $maxPage = $r['total']; }

// ── EVENT SUMMARY ─────────────────────────────────────────────────────────────
$evSumRes = $conn->query("
    SELECT event_name, label_name, COUNT(*) total
    FROM tracker_events WHERE $dRange
    GROUP BY event_name, label_name ORDER BY total DESC LIMIT 50
");
$evRows = []; while ($r = $evSumRes->fetch_assoc()) $evRows[] = $r;
$maxEv = !empty($evRows) ? $evRows[0]['total'] : 1;

// ── CATALOGUE PERFORMANCE ────────────────────────────────────────────────────
$catalogueRes = $conn->query("
    SELECT 
        event_name,
        label_name,
        COUNT(*) AS total,
        COUNT(DISTINCT session_id) AS sessions,
        SUM(CASE WHEN LOWER(device) = 'mobile' THEN 1 ELSE 0 END) AS mobile_clicks,
        SUM(CASE WHEN LOWER(device) = 'desktop' THEN 1 ELSE 0 END) AS desktop_clicks,
        SUM(CASE WHEN LOWER(device) = 'tablet' THEN 1 ELSE 0 END) AS tablet_clicks
    FROM tracker_events
    WHERE $dRange
      AND page_path LIKE '%catalogue%'
      AND event_name IN (
        'pdf_download',
        'call_click',
        'whatsapp_click',
        'app_download_click',
        'nav_click'
      )
    GROUP BY event_name, label_name
    ORDER BY total DESC
");

$catalogueRows = [];
while ($r = $catalogueRes->fetch_assoc()) {
    $catalogueRows[] = $r;
}

// ── LOCATION PERFORMANCE ─────────────────────────────────────────────────────
$locationRes = $conn->query("
    SELECT 
        country,
        state_name,
        city_name,
        pincode,
        COUNT(*) AS total_events,
        SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END) AS page_views,
        SUM(CASE WHEN event_name != 'page_view' AND event_name NOT LIKE 'scroll_%' THEN 1 ELSE 0 END) AS actions,
        COUNT(DISTINCT session_id) AS sessions
    FROM tracker_events
    WHERE $dRange
    GROUP BY country, state_name, city_name, pincode
    ORDER BY total_events DESC
    LIMIT 20
");

$locationRows = [];
while ($r = $locationRes->fetch_assoc()) {
    $locationRows[] = $r;
}

// ── DEVICES ───────────────────────────────────────────────────────────────────
$devRes = $conn->query("SELECT device, COUNT(*) total FROM tracker_events WHERE $dRange GROUP BY device ORDER BY total DESC");
$devLabels = []; $devCounts = [];
while ($r = $devRes->fetch_assoc()) { $devLabels[] = $r['device'] ?: 'Unknown'; $devCounts[] = (int)$r['total']; }

// ── BROWSERS ──────────────────────────────────────────────────────────────────
$brwRes = $conn->query("SELECT browser, COUNT(*) total FROM tracker_events WHERE $dRange GROUP BY browser ORDER BY total DESC LIMIT 7");
$brwLabels = []; $brwCounts = [];
while ($r = $brwRes->fetch_assoc()) { $brwLabels[] = $r['browser'] ?: 'Unknown'; $brwCounts[] = (int)$r['total']; }

// ── HOURLY (IST FIXED) ────────────────────────────────────────────────────────
$hrRes = $conn->query("
    SELECT " . istHour() . " AS hr, COUNT(*) total
    FROM tracker_events WHERE $dRange
    GROUP BY hr ORDER BY hr ASC
");
$hourlyData = array_fill(0, 24, 0);
while ($r = $hrRes->fetch_assoc()) {
    if ($r['hr'] !== null) $hourlyData[(int)$r['hr']] = (int)$r['total'];
}

// ── DAILY TREND ───────────────────────────────────────────────────────────────
$dayRes = $conn->query("
    SELECT event_date, COUNT(*) total
    FROM tracker_events
    WHERE event_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
    GROUP BY event_date ORDER BY event_date ASC
");
$dayLabels = []; $dayCounts = [];
while ($r = $dayRes->fetch_assoc()) {
    $dayLabels[] = date('d M', strtotime($r['event_date']));
    $dayCounts[] = (int)$r['total'];
}

// ── RECENT ACTIVITY (IST TIME FIXED) ──────────────────────────────────────────
$recentRes = $conn->query("
    SELECT
        id, event_name, label_name, page_path, device, browser, ip_address,
country, state_name, city_name, pincode,
        event_date,
        " . istTime() . " AS event_time_ist,
        session_id
    FROM tracker_events
    WHERE $dRange
    ORDER BY id DESC LIMIT 300
");
$recentRows = [];
while ($r = $recentRes->fetch_assoc()) $recentRows[] = $r;

$csrf = htmlspecialchars($_SESSION['csrf_token']);
$nowIST = date('d M Y, g:i A');
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
<meta name="googlebot" content="noindex,nofollow,noarchive,nosnippet">
<title>Petro Analytics — Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<style>
/* ══════════════════════════════════════════
   DESIGN SYSTEM — PETRO DARK INDUSTRIAL
   ══════════════════════════════════════════ */
:root {
  /* Brand */
  --teal:       #00c4b4;
  --teal-dim:   #00917f;
  --teal-glow:  rgba(0,196,180,.18);
  --teal-soft:  rgba(0,196,180,.1);

  /* Dark theme (default) */
  --bg:         #070d0e;
  --surface:    #0d1a1c;
  --surface-2:  #112023;
  --surface-3:  #162628;
  --border:     rgba(0,196,180,.12);
  --border-2:   rgba(255,255,255,.06);
  --text-1:     #e8f0f0;
  --text-2:     #8fa8aa;
  --text-3:     #5a7275;

  /* Semantic */
  --green:   #22c55e;
  --amber:   #f59e0b;
  --red:     #ef4444;
  --blue:    #3b82f6;

  /* Layout */
  --sidebar-w: 264px;
  --radius:    16px;
  --radius-sm: 10px;
  --radius-xs: 7px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3);
  --shadow:    0 4px 16px rgba(0,0,0,.5);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.6);
}
[data-theme="light"] {
  --bg:        #f4f8f8;
  --surface:   #ffffff;
  --surface-2: #f0f6f6;
  --surface-3: #e6f2f2;
  --border:    rgba(0,143,131,.15);
  --border-2:  rgba(0,0,0,.06);
  --text-1:    #0d1a1c;
  --text-2:    #3d6066;
  --text-3:    #7a9ea2;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
  --shadow:    0 4px 16px rgba(0,0,0,.1);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.14);
}

/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg);
  color: var(--text-1);
  min-height: 100vh;
  transition: background .3s, color .3s;
  font-size: 14px;
  line-height: 1.5;
}
a { text-decoration: none; color: inherit; }
button { font-family: inherit; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 99px; }

/* ── LAYOUT ── */
.layout { display: flex; min-height: 100vh; }

/* ── SIDEBAR ── */
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-w);
  background: linear-gradient(180deg, #081214 0%, #030d0e 100%);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: transform .3s cubic-bezier(.4,0,.2,1);
  overflow-y: auto;
  overflow-x: hidden;
}
/* Light mode sidebar */
[data-theme="light"] .sidebar {
  background: linear-gradient(180deg, #0b2428 0%, #071619 100%);
}
.sidebar-brand {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(0,196,180,.1);
  margin-bottom: 8px;
}
.brand-row { display: flex; align-items: center; gap: 12px; }
.brand-logo {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, var(--teal), var(--teal-dim));
  border-radius: 13px;
  display: grid; place-items: center;
  font-size: 16px; font-weight: 800;
  color: #fff; flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(0,196,180,.3);
  letter-spacing: -.5px;
}
.brand-name { color: #fff; font-size: 16px; font-weight: 800; letter-spacing: -.3px; }
.brand-sub  { color: rgba(255,255,255,.35); font-size: 10.5px; margin-top: 1px; }
.live-pill {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 14px;
  background: rgba(34,197,94,.1);
  border: 1px solid rgba(34,197,94,.2);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 11px; font-weight: 600; color: #4ade80;
}
.live-dot {
  width: 6px; height: 6px;
  background: #4ade80; border-radius: 50%;
  animation: livepulse 1.8s ease infinite;
}
@keyframes livepulse {
  0%, 100% { opacity:1; box-shadow: 0 0 0 0 rgba(74,222,128,.5); }
  50%       { opacity:.6; box-shadow: 0 0 0 5px rgba(74,222,128,0); }
}
/* Nav */
.nav-group { padding: 6px 12px; margin-bottom: 2px; }
.nav-group-label {
  font-size: 9.5px; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; color: rgba(255,255,255,.22);
  padding: 10px 8px 6px;
}
.nav-link {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 10px;
  border-radius: 10px;
  color: rgba(255,255,255,.5);
  font-size: 13px; font-weight: 500;
  transition: all .18s;
  margin-bottom: 1px;
  cursor: pointer;
}
.nav-link .ni {
  width: 32px; height: 32px;
  background: rgba(255,255,255,.05);
  border-radius: 9px;
  display: grid; place-items: center;
  font-size: 15px; flex-shrink: 0;
  transition: background .18s;
}
.nav-link:hover { background: rgba(0,196,180,.1); color: rgba(255,255,255,.85); }
.nav-link:hover .ni { background: rgba(0,196,180,.18); }
.nav-link.active {
  background: rgba(0,196,180,.15);
  color: var(--teal);
  border: 1px solid rgba(0,196,180,.2);
}
.nav-link.active .ni { background: rgba(0,196,180,.2); }
/* Countdown */
.sidebar-foot {
  margin-top: auto;
  padding: 16px 20px;
  border-top: 1px solid rgba(0,196,180,.08);
}
.refresh-bar {
  background: var(--surface-3);
  border-radius: 99px;
  height: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}
.refresh-fill {
  height: 100%;
  background: var(--teal);
  width: 100%;
  border-radius: 99px;
  transition: width 1s linear;
}
.refresh-text {
  font-size: 11px; color: rgba(255,255,255,.3);
  text-align: center;
}

/* ── MAIN ── */
.main {
  margin-left: var(--sidebar-w);
  flex: 1;
  padding: 24px 28px;
  min-height: 100vh;
}

/* ── TOPBAR ── */
.topbar {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.topbar-title { font-size: 22px; font-weight: 800; letter-spacing: -.4px; }
.topbar-sub   { color: var(--text-2); font-size: 12.5px; margin-top: 3px; }
.topbar-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

/* ── BUTTONS ── */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  font-family: inherit; font-size: 13px; font-weight: 600;
  cursor: pointer; border: none;
  transition: all .18s; white-space: nowrap;
}
.btn:hover { transform: translateY(-1px); }
.btn-teal  {
  background: linear-gradient(135deg, var(--teal), var(--teal-dim));
  color: #fff;
  box-shadow: 0 4px 14px rgba(0,196,180,.28);
}
.btn-teal:hover { box-shadow: 0 6px 20px rgba(0,196,180,.4); }
.btn-ghost  { background: var(--surface-2); color: var(--text-2); border: 1px solid var(--border-2); }
.btn-ghost:hover { color: var(--text-1); background: var(--surface-3); }
.btn-danger { background: rgba(239,68,68,.1); color: #f87171; border: 1px solid rgba(239,68,68,.2); }
.btn-danger:hover { background: rgba(239,68,68,.18); }
.btn-icon {
  width: 36px; height: 36px; padding: 0;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text-2);
  border: 1px solid var(--border-2);
  font-size: 17px;
  cursor: pointer;
  display: grid; place-items: center;
  transition: all .18s;
}
.btn-icon:hover { background: var(--surface-3); color: var(--text-1); }

/* ── FILTER BAR ── */
.filter-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}
.filter-label { font-size: 12px; font-weight: 600; color: var(--text-3); }
.filter-input {
  padding: 8px 13px;
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-xs);
  color: var(--text-1);
  font-family: inherit; font-size: 13px;
  outline: none;
  transition: border-color .18s, box-shadow .18s;
}
.filter-input:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px var(--teal-soft);
}
.filter-arrow { color: var(--text-3); font-size: 18px; }
.filter-showing {
  margin-left: auto;
  font-size: 11.5px; color: var(--text-3);
}
.filter-showing strong { color: var(--teal); }

/* ── STAT CARDS ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  position: relative; overflow: hidden;
  transition: transform .2s, box-shadow .2s;
  box-shadow: var(--shadow-sm);
}
.stat-card::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--teal), var(--teal-dim));
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow), 0 0 0 1px var(--teal) inset;
}
.stat-top {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 14px;
}
.stat-icon {
  width: 38px; height: 38px;
  background: var(--teal-soft);
  border: 1px solid var(--border);
  border-radius: 11px;
  display: grid; place-items: center;
  font-size: 18px;
}
.stat-badge {
  font-size: 10px; font-weight: 700; letter-spacing: .06em;
  padding: 3px 8px; border-radius: 99px;
  background: var(--surface-2); color: var(--text-3);
}
.stat-value {
  font-size: 34px; font-weight: 800;
  letter-spacing: -1.5px;
  line-height: 1; margin-bottom: 4px;
}
.stat-label {
  font-size: 11px; font-weight: 600; letter-spacing: .08em;
  text-transform: uppercase; color: var(--text-3);
}

/* ── PANEL ── */
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 18px;
}
.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 10px;
}
.panel-title {
  font-size: 14px; font-weight: 700; letter-spacing: -.2px;
}
.chip {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase;
  padding: 4px 10px; border-radius: 99px;
  background: var(--teal-soft);
  color: var(--teal); border: 1px solid var(--border);
}

/* ── CHARTS GRID ── */
.charts-grid {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}
.chart-body { padding: 20px; }

/* ── TABLE ── */
.table-controls {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
}
.search-wrap { position: relative; flex: 1; min-width: 220px; }
.search-wrap::before {
  content: '⌕';
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  font-size: 17px; color: var(--text-3); pointer-events: none;
  line-height: 1;
}
.search-input {
  width: 100%;
  padding: 9px 14px 9px 36px;
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-xs);
  color: var(--text-1);
  font-family: inherit; font-size: 13px;
  outline: none;
  transition: border-color .18s, box-shadow .18s;
}
.search-input:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px var(--teal-soft);
}
.search-input::placeholder { color: var(--text-3); }
.fsel {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-xs);
  color: var(--text-1);
  font-family: inherit; font-size: 12.5px;
  outline: none; cursor: pointer;
}
.fsel:focus { border-color: var(--teal); }
.row-count { font-size: 11.5px; color: var(--text-3); white-space: nowrap; }

/* Table */
.tscroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 740px; }
thead th {
  background: var(--surface-2);
  color: var(--text-3);
  font-size: 10.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap; text-align: left;
  position: sticky; top: 0; z-index: 1;
}
tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 13px; color: var(--text-1);
  vertical-align: middle;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr { transition: background .12s; }
tbody tr:hover td { background: var(--surface-2); }

/* Badges */
.tag {
  display: inline-flex; align-items: center;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.tag-teal   { background: var(--teal-soft);            color: var(--teal);  border: 1px solid var(--border); }
.tag-blue   { background: rgba(59,130,246,.1);          color: #60a5fa;      border: 1px solid rgba(59,130,246,.15); }
.tag-amber  { background: rgba(245,158,11,.1);          color: #fbbf24;      border: 1px solid rgba(245,158,11,.15); }
.tag-green  { background: rgba(34,197,94,.1);           color: #4ade80;      border: 1px solid rgba(34,197,94,.15); }
.tag-purple { background: rgba(168,85,247,.1);          color: #c084fc;      border: 1px solid rgba(168,85,247,.15); }
[data-theme="light"] .tag-teal   { color: #007268; }
[data-theme="light"] .tag-blue   { color: #1d4ed8; }
[data-theme="light"] .tag-amber  { color: #92400e; }
[data-theme="light"] .tag-green  { color: #166534; }

.mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
.count-pill {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500;
  padding: 3px 10px;
  border-radius: var(--radius-xs);
  background: var(--surface-3);
  color: var(--text-1);
  border: 1px solid var(--border-2);
}
.bar-wrap { display: flex; align-items: center; gap: 10px; }
.bar-track {
  flex: 1; height: 5px;
  background: var(--surface-3); border-radius: 99px;
  overflow: hidden; min-width: 60px;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--teal), var(--teal-dim));
  border-radius: 99px;
}
.bar-pct { font-size: 10.5px; color: var(--text-3); min-width: 32px; text-align: right; }

/* ── Progress bars in top lists ── */
.list-item {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 20px;
  border-bottom: 1px solid var(--border);
}
.list-item:last-child { border-bottom: none; }
.list-item-label {
  font-size: 13px; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  flex: 1; min-width: 0;
}
.list-item-label.mono { font-size: 12px; color: var(--teal); }

/* ── ALERTS ── */
.alert {
  padding: 13px 18px; border-radius: var(--radius-sm);
  margin-bottom: 18px; font-size: 13px;
  display: flex; align-items: center; gap: 10px;
}
.alert-ok {
  background: rgba(34,197,94,.08);
  border: 1px solid rgba(34,197,94,.2);
  color: #4ade80;
}

/* ── HAMBURGER ── */
.hamburger {
  display: none;
  position: fixed; top: 14px; left: 14px;
  z-index: 300;
  width: 40px; height: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  box-shadow: var(--shadow);
  cursor: pointer;
  flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  padding: 0;
}
.hamburger span { display: block; width: 16px; height: 2px; background: var(--text-2); border-radius: 2px; transition: .25s; }
.sidebar-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.65);
  z-index: 150; backdrop-filter: blur(3px);
}

/* ── TWO COL GRID ── */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }

/* ── FOOTER ── */
.footer {
  text-align: center; color: var(--text-3);
  font-size: 11.5px; padding: 20px 0 32px;
}

/* ══ RESPONSIVE ══ */
@media (max-width: 1280px) {
  .charts-grid { grid-template-columns: 1fr 1fr; }
  .stats-row   { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: none; }
  .main { margin-left: 0; padding: 16px; }
  .hamburger { display: flex; }
  .sidebar-overlay.show { display: block; }
  .charts-grid { grid-template-columns: 1fr; }
  .two-col     { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .topbar { flex-direction: column; }
  .topbar-actions { width: 100%; flex-wrap: wrap; }
  .btn { font-size: 12px; padding: 8px 12px; }
}
</style>
</head>
<body>

<!-- ── HAMBURGER ── -->
<button class="hamburger" id="ham" aria-label="Toggle menu">
  <span></span><span></span><span></span>
</button>
<div class="sidebar-overlay" id="overlay"></div>

<!-- ══ SIDEBAR ══ -->
<aside class="sidebar" id="sidebar">
  <div class="sidebar-brand">
    <div class="brand-row">
      <div class="brand-logo">PT</div>
      <div>
        <div class="brand-name">PETRO TRACKING</div>
        <div class="brand-sub">Analytics Dashboard</div>
      </div>
    </div>
    <div class="live-pill">
      <div class="live-dot"></div>
      Live Tracking Active
    </div>
  </div>

  <div class="nav-group">
    <div class="nav-group-label">Reports</div>
    <a href="#sec-overview" class="nav-link active" onclick="nav(this)">
      <span class="ni">📊</span> Overview
    </a>
    <a href="#sec-trends" class="nav-link" onclick="nav(this)">
      <span class="ni">📈</span> Daily Trends
    </a>
    <a href="#sec-buttons" class="nav-link" onclick="nav(this)">
      <span class="ni">🖱</span> Button Clicks
    </a>
    <a href="#sec-pages" class="nav-link" onclick="nav(this)">
      <span class="ni">📄</span> Top Pages
    </a>
    <a href="#sec-catalogue" class="nav-link" onclick="nav(this)">
  <span class="ni">📘</span> Catalogue Report
</a>
  </div>

  <div class="nav-group">
    <div class="nav-group-label">Insights</div>
    <a href="#sec-devices" class="nav-link" onclick="nav(this)">
      <span class="ni">📱</span> Devices
    </a>
    <a href="#sec-browsers" class="nav-link" onclick="nav(this)">
      <span class="ni">🌐</span> Browsers
    </a>
    <a href="#sec-hourly" class="nav-link" onclick="nav(this)">
      <span class="ni">⏰</span> Hourly Activity
    </a>
    <a href="#sec-events" class="nav-link" onclick="nav(this)">
      <span class="ni">⚡</span> Event Summary
    </a>
    <a href="#sec-recent" class="nav-link" onclick="nav(this)">
      <span class="ni">🕒</span> Activity Log
    </a>
    <a href="#sec-locations" class="nav-link" onclick="nav(this)">
  <span class="ni">📍</span> Locations
</a>
  </div>

  <div class="sidebar-foot">
    <div class="refresh-bar"><div class="refresh-fill" id="rfill"></div></div>
    <div class="refresh-text">Auto-refresh in <span id="cdown">60</span>s</div>
  </div>
</aside>

<!-- ══ MAIN ══ -->
<main class="main">

  <?php if (isset($_GET['msg']) && $_GET['msg'] === 'reset'): ?>
  <div class="alert alert-ok">✓ All tracker data has been reset successfully.</div>
  <?php endif; ?>

  <!-- ── TOPBAR ── -->
  <section id="sec-overview">
  <div class="topbar">
    <div>
      <div class="topbar-title">📊 Petro Analytics</div>
      <div class="topbar-sub">Live tracking · Button clicks · Page views · Scroll depth · IST <?= $nowIST ?></div>
    </div>
    <div class="topbar-actions">
      <button class="btn-icon" id="themeBtn" title="Toggle theme">🌙</button>
      <a class="btn btn-ghost" href="petro-admin-analytics.php?from=<?= $dateFrom ?>&to=<?= $dateTo ?>">🔄 Refresh</a>
      <a class="btn btn-ghost" href="?export=csv&from=<?= $dateFrom ?>&to=<?= $dateTo ?>">📥 Export CSV</a>
      <form method="POST" style="display:inline" onsubmit="return confirm('Permanently delete ALL tracker data?')">
        <input type="hidden" name="csrf_token" value="<?= $csrf ?>">
        <button class="btn btn-danger" name="reset_data">🗑 Reset All</button>
      </form>
      <a class="btn btn-ghost" href="?logout=1">← Logout</a>
    </div>
  </div>

  <!-- ── DATE FILTER ── -->
  <form class="filter-bar" method="GET" action="petro-admin-analytics.php">
    <span class="filter-label">📅 Date Range</span>
    <input class="filter-input" type="date" name="from" value="<?= htmlspecialchars($dateFrom) ?>">
    <span class="filter-arrow">→</span>
    <input class="filter-input" type="date" name="to" value="<?= htmlspecialchars($dateTo) ?>">
    <button class="btn btn-teal" type="submit">Apply</button>
    <a class="btn btn-ghost" href="petro-admin-analytics.php">Reset</a>
    <span class="filter-showing">
      Showing <strong><?= htmlspecialchars($dateFrom) ?></strong> → <strong><?= htmlspecialchars($dateTo) ?></strong>
    </span>
  </form>

  <!-- ── STAT CARDS ── -->
  <div class="stats-row">
    <?php
    $cards = [
      ['⚡', 'Total Events',   $totalEvents,  'All tracked activity',  'EVENTS'],
      ['🖱', 'Button Clicks',   $totalClicks,  'CTA interactions',      'CLICKS'],
      ['📄', 'Page Views',      $pageViews,    'Page load count',       'VIEWS'],
      ['👤', 'Unique Sessions', $sessions,     'Distinct visitor sessions','SESSIONS'],
      ['🌍', 'Unique IPs',      $uniqueIPs,    'Distinct IP addresses', 'IPS'],
      ['📅', 'Avg / Day',       $avgPerDay,    'Events per day avg',    'AVG'],
    ];
    foreach ($cards as [$icon, $label, $val, $sub, $badge]): ?>
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon"><?= $icon ?></div>
        <span class="stat-badge"><?= $badge ?></span>
      </div>
      <div class="stat-value counter" data-t="<?= $val ?>">0</div>
      <div class="stat-label"><?= $label ?></div>
    </div>
    <?php endforeach; ?>
  </div>
  </section>

  <!-- ── CHARTS ROW ── -->
  <div class="charts-grid" id="sec-trends">

    <div class="panel" style="margin:0">
      <div class="panel-head">
        <span class="panel-title">📈 Daily Event Trend — Last 14 Days</span>
        <span class="chip">Line Chart</span>
      </div>
      <div class="chart-body">
        <canvas id="cDay" height="120"></canvas>
      </div>
    </div>

    <div class="panel" style="margin:0" id="sec-devices">
      <div class="panel-head">
        <span class="panel-title">📱 Device Split</span>
        <span class="chip">Doughnut</span>
      </div>
      <div class="chart-body">
        <canvas id="cDev" height="180"></canvas>
      </div>
    </div>

    <div class="panel" style="margin:0" id="sec-browsers">
      <div class="panel-head">
        <span class="panel-title">🌐 Browsers</span>
        <span class="chip">Horizontal Bar</span>
      </div>
      <div class="chart-body">
        <canvas id="cBrw" height="180"></canvas>
      </div>
    </div>

  </div><!-- /charts-grid -->

  <!-- ── HOURLY CHART ── -->
  <div class="panel" id="sec-hourly">
    <div class="panel-head">
      <span class="panel-title">⏰ Hourly Activity — IST (India Standard Time)</span>
      <span class="chip">24 Hour Bar</span>
    </div>
    <div class="chart-body">
      <canvas id="cHour" height="80"></canvas>
    </div>
  </div>

  <!-- ── TOP BUTTONS + TOP PAGES ── -->
  <div class="two-col">

    <div class="panel" style="margin:0" id="sec-buttons">
      <div class="panel-head">
        <span class="panel-title">🖱 Top Button Clicks</span>
        <span class="chip">By Label</span>
      </div>
      <?php if (empty($btnRows)): ?>
        <div style="padding:20px;color:var(--text-3);font-size:13px">No click data in this range.</div>
      <?php else: ?>
        <?php foreach ($btnRows as $r):
          $pct = round(($r['total'] / $maxBtn) * 100);
        ?>
        <div class="list-item">
          <span class="list-item-label"><?= htmlspecialchars($r['label_name'] ?: '—') ?></span>
          <div class="bar-wrap" style="flex:1.2;min-width:80px">
            <div class="bar-track"><div class="bar-fill" style="width:<?= $pct ?>%"></div></div>
            <span class="bar-pct"><?= $pct ?>%</span>
          </div>
          <span class="count-pill"><?= number_format($r['total']) ?></span>
        </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>

    <div class="panel" style="margin:0" id="sec-pages">
      <div class="panel-head">
        <span class="panel-title">📄 Top Pages</span>
        <span class="chip">By Views</span>
      </div>
      <?php if (empty($pageRows)): ?>
        <div style="padding:20px;color:var(--text-3);font-size:13px">No page view data in this range.</div>
      <?php else: ?>
        <?php foreach ($pageRows as $r):
          $pct = round(($r['total'] / $maxPage) * 100);
        ?>
        <div class="list-item">
          <span class="list-item-label mono"><?= htmlspecialchars($r['page_path'] ?: '/') ?></span>
          <div class="bar-wrap" style="flex:1.2;min-width:80px">
            <div class="bar-track"><div class="bar-fill" style="width:<?= $pct ?>%"></div></div>
            <span class="bar-pct"><?= $pct ?>%</span>
          </div>
          <span class="count-pill"><?= number_format($r['total']) ?></span>
        </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>

  </div>

  <!-- ── CATALOGUE PERFORMANCE ── -->
<div class="panel" id="sec-catalogue">
  <div class="panel-head">
    <span class="panel-title">📘 Catalogue Performance</span>
    <span class="chip">Catalogue Page Actions</span>
  </div>

  <div class="tscroll">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Event</th>
          <th>Action Label</th>
          <th>Total Clicks</th>
          <th>Unique Sessions</th>
          <th>Mobile</th>
          <th>Desktop</th>
          <th>Tablet</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($catalogueRows)): ?>
          <tr>
            <td colspan="8" style="padding:20px;color:var(--text-3)">
              No catalogue tracking data in this date range.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($catalogueRows as $i => $r): ?>
            <tr>
              <td style="color:var(--text-3);font-size:12px">
                <?= $i + 1 ?>
              </td>

              <td>
                <span class="tag tag-green mono">
                  <?= htmlspecialchars($r['event_name']) ?>
                </span>
              </td>

              <td style="font-weight:600">
                <?= htmlspecialchars($r['label_name'] ?: '—') ?>
              </td>

              <td>
                <span class="count-pill">
                  <?= number_format($r['total']) ?>
                </span>
              </td>

              <td>
                <span class="count-pill">
                  <?= number_format($r['sessions']) ?>
                </span>
              </td>

              <td>📱 <?= number_format($r['mobile_clicks']) ?></td>
              <td>💻 <?= number_format($r['desktop_clicks']) ?></td>
              <td>🖥 <?= number_format($r['tablet_clicks']) ?></td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- ── LOCATION PERFORMANCE ── -->
<div class="panel" id="sec-locations">
  <div class="panel-head">
    <span class="panel-title">📍 Location Performance</span>
    <span class="chip">State / City Wise</span>
  </div>

  <div class="tscroll">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Country</th>
          <th>State</th>
          <th>City</th>
          <th>Pincode</th>
          <th>Total Events</th>
          <th>Page Views</th>
          <th>Actions</th>
          <th>Sessions</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($locationRows)): ?>
          <tr>
            <td colspan="9" style="padding:20px;color:var(--text-3)">
              No location data in this date range.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($locationRows as $i => $r): ?>
            <tr>
              <td style="color:var(--text-3);font-size:12px"><?= $i + 1 ?></td>
              <td><?= htmlspecialchars($r['country'] ?: '—') ?></td>
              <td><?= htmlspecialchars($r['state_name'] ?: '—') ?></td>
              <td style="font-weight:600"><?= htmlspecialchars($r['city_name'] ?: '—') ?></td>
              <td class="mono"><?= htmlspecialchars($r['pincode'] ?: '—') ?></td>
              <td><span class="count-pill"><?= number_format($r['total_events']) ?></span></td>
              <td><span class="count-pill"><?= number_format($r['page_views']) ?></span></td>
              <td><span class="count-pill"><?= number_format($r['actions']) ?></span></td>
              <td><span class="count-pill"><?= number_format($r['sessions']) ?></span></td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

  <!-- ── EVENT SUMMARY TABLE ── -->
  <div class="panel" id="sec-events">
    <div class="panel-head">
      <span class="panel-title">⚡ Event Summary</span>
      <span class="chip">MySQL Live</span>
    </div>
    <div class="tscroll">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Event Name</th>
            <th>Label</th>
            <th>Count</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($evRows)): ?>
            <tr><td colspan="5" style="padding:20px;color:var(--text-3)">No events in this date range.</td></tr>
          <?php else: ?>
            <?php foreach ($evRows as $i => $r):
              $pct  = round(($r['total'] / $maxEv) * 100);
              $en   = $r['event_name'];
              if (str_contains($en, 'page_view')) $tagClass = 'tag-blue';
              elseif (str_contains($en, 'scroll')) $tagClass = 'tag-amber';
              else                                 $tagClass = 'tag-green';
            ?>
            <tr>
              <td style="color:var(--text-3);font-size:12px"><?= $i+1 ?></td>
              <td><span class="tag <?= $tagClass ?> mono"><?= htmlspecialchars($en) ?></span></td>
              <td style="color:var(--text-1)"><?= htmlspecialchars($r['label_name'] ?: '—') ?></td>
              <td><span class="count-pill"><?= number_format($r['total']) ?></span></td>
              <td>
                <div class="bar-wrap">
                  <div class="bar-track"><div class="bar-fill" style="width:<?= $pct ?>%"></div></div>
                  <span class="bar-pct"><?= $pct ?>%</span>
                </div>
              </td>
            </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── RECENT ACTIVITY LOG ── -->
  <div class="panel" id="sec-recent">
    <div class="panel-head">
      <span class="panel-title">🕒 Recent Activity Log</span>
      <span class="chip">IST Time · Last 300</span>
    </div>

    <div class="table-controls">
      <div class="search-wrap">
        <input class="search-input" id="tSearch" type="text"
               placeholder="Search event, label, page, IP, browser…">
      </div>
      <select class="fsel" id="fEvent">
        <option value="">All Events</option>
<option value="page_view">Page View</option>
<option value="pdf_download">PDF Download</option>
<option value="call_click">Call Click</option>
<option value="whatsapp_click">WhatsApp Click</option>
<option value="app_download_click">App Download Click</option>
<option value="nav_click">Navigation Click</option>
<option value="cta_click">CTA Click</option>
<option value="social_click">Social Click</option>
<option value="dealer_card_click">Dealer Card Click</option>
<option value="form_submit">Form Submit</option>
<option value="scroll">Scroll</option>
<option value="click">Click</option>
      </select>
      <select class="fsel" id="fDevice">
        <option value="">All Devices</option>
        <option value="mobile">Mobile</option>
        <option value="desktop">Desktop</option>
        <option value="tablet">Tablet</option>
      </select>
      <span class="row-count" id="rowCount"></span>
    </div>

    <div class="tscroll">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time (IST)</th>
            <th>Event</th>
            <th>Label</th>
            <th>Page</th>
            <th>Device</th>
            <th>Browser</th>
            <th>IP Address</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody id="recentTbody">
          <?php if (empty($recentRows)): ?>
            <tr><td colspan="9" style="padding:20px;color:var(--text-3)">No activity in this date range.</td></tr>
          <?php else: ?>
            <?php foreach ($recentRows as $r):
              $en = $r['event_name'];
              if (str_contains($en, 'page_view'))  $tagClass = 'tag-blue';
              elseif (str_contains($en, 'scroll')) $tagClass = 'tag-amber';
              else                                  $tagClass = 'tag-green';
            ?>
            <tr>
              <td class="mono" style="color:var(--text-2)"><?= htmlspecialchars($r['event_date']) ?></td>
              <td class="mono" style="color:var(--teal);font-weight:600">
                <?= htmlspecialchars($r['event_time_ist'] ?: '—') ?>
              </td>
              <td><span class="tag <?= $tagClass ?> mono"><?= htmlspecialchars($en) ?></span></td>
              <td style="font-weight:500"><?= htmlspecialchars($r['label_name'] ?: '—') ?></td>
              <td class="mono" style="color:var(--text-2)"><?= htmlspecialchars($r['page_path'] ?: '/') ?></td>
              <td>
                <?php
                  $dev = strtolower($r['device'] ?? '');
                  $dicon = match(true) {
                    str_contains($dev,'mobile')  => '📱',
                    str_contains($dev,'tablet')  => '🖥',
                    str_contains($dev,'desktop') => '💻',
                    default                      => '?',
                  };
                ?>
                <?= $dicon ?> <?= htmlspecialchars($r['device'] ?: '—') ?>
              </td>
              <td><?= htmlspecialchars($r['browser'] ?: '—') ?></td>
              <td class="mono" style="color:var(--text-3);font-size:11.5px">
                <?= htmlspecialchars($r['ip_address'] ?: '—') ?>
              </td>
              <td>
  <?= htmlspecialchars($r['city_name'] ?: '—') ?>,
  <?= htmlspecialchars($r['state_name'] ?: '—') ?>
  <br>
  <span class="mono" style="color:var(--text-3);font-size:11px">
    <?= htmlspecialchars($r['country'] ?: '—') ?>
    <?= !empty($r['pincode']) ? ' - ' . htmlspecialchars($r['pincode']) : '' ?>
  </span>
</td>
            </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

  <p class="footer">
    Petro Analytics Dashboard &middot; IST Time &middot; Noindex Protected &middot; MySQL Powered &middot; <?= date('Y') ?>
  </p>

</main><!-- /main -->

<!-- ══ SCRIPTS ══ -->
<script>
// ── DATA FROM PHP ─────────────────────────────────────────────────────────────
const D = {
  dayLabels:  <?= json_encode($dayLabels)              ?>,
  dayCounts:  <?= json_encode($dayCounts)              ?>,
  devLabels:  <?= json_encode($devLabels)              ?>,
  devCounts:  <?= json_encode($devCounts)              ?>,
  brwLabels:  <?= json_encode($brwLabels)              ?>,
  brwCounts:  <?= json_encode($brwCounts)              ?>,
  hourCounts: <?= json_encode(array_values($hourlyData)) ?>,
};
const HOUR_LABELS = Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}h`);

// ── THEME ─────────────────────────────────────────────────────────────────────
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const saved = localStorage.getItem('petro_t') || 'dark';
html.setAttribute('data-theme', saved);
themeBtn.textContent = saved === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const now = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', now);
  localStorage.setItem('petro_t', now);
  themeBtn.textContent = now === 'dark' ? '☀️' : '🌙';
  rebuildCharts();
});

// ── COUNTER ANIMATION ─────────────────────────────────────────────────────────
document.querySelectorAll('.counter').forEach(el => {
  const target = parseInt(el.dataset.t, 10) || 0;
  if (target === 0) { el.textContent = '0'; return; }
  const dur = 1100;
  const steps = 50;
  const step = target / steps;
  let cur = 0, i = 0;
  const t = setInterval(() => {
    i++;
    cur = Math.min(Math.round(step * i), target);
    el.textContent = cur.toLocaleString('en-IN');
    if (i >= steps) clearInterval(t);
  }, dur / steps);
});

// ── CHART PALETTE ─────────────────────────────────────────────────────────────
const PAL = ['#00c4b4','#0ed2c4','#34d399','#60a5fa','#c084fc','#f472b6','#fb923c','#facc15'];
function gv(v) { return getComputedStyle(html).getPropertyValue(v).trim(); }

Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

// ── BUILD CHARTS ──────────────────────────────────────────────────────────────
let charts = {};

function buildCharts() {
  const textColor  = gv('--text-2');
  const gridColor  = gv('--border');
  const surfColor  = gv('--surface-2');

  // Shared axis style
  const axis = (col) => ({
    grid: { color: gridColor, drawBorder: false },
    ticks: { color: col || textColor, font: { size: 11 } },
  });
  const noGrid = { grid: { display:false }, ticks: { color: textColor, font:{ size:10 } } };

  // Day trend
  const dayCtx = document.getElementById('cDay').getContext('2d');
  const grad = dayCtx.createLinearGradient(0,0,0,220);
  grad.addColorStop(0,'rgba(0,196,180,.22)');
  grad.addColorStop(1,'rgba(0,196,180,0)');
  charts.day = new Chart(dayCtx, {
    type: 'line',
    data: {
      labels: D.dayLabels,
      datasets: [{
        data: D.dayCounts,
        borderColor: '#00c4b4',
        backgroundColor: grad,
        borderWidth: 2,
        fill: true,
        tension: .45,
        pointBackgroundColor: '#00c4b4',
        pointRadius: 4, pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend:{ display:false } },
      scales: { x: noGrid, y: axis() }
    }
  });

  // Device doughnut
  charts.dev = new Chart(document.getElementById('cDev').getContext('2d'), {
    type: 'doughnut',
    data: { labels: D.devLabels, datasets: [{ data: D.devCounts, backgroundColor: PAL, borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true,
      plugins: {
        legend: { position:'bottom', labels:{ color: textColor, font:{size:11}, boxWidth:10, padding:12 } }
      },
      cutout: '68%'
    }
  });

  // Browser bar
  charts.brw = new Chart(document.getElementById('cBrw').getContext('2d'), {
    type: 'bar',
    data: { labels: D.brwLabels, datasets: [{ data: D.brwCounts, backgroundColor: PAL, borderRadius: 6, borderSkipped: false }] },
    options: {
      indexAxis: 'y', responsive: true,
      plugins: { legend:{ display:false } },
      scales: { x: axis(), y: noGrid }
    }
  });

  // Hourly
  const hCtx = document.getElementById('cHour').getContext('2d');
  const hGrad = hCtx.createLinearGradient(0,0,0,160);
  hGrad.addColorStop(0,'rgba(0,196,180,.55)');
  hGrad.addColorStop(1,'rgba(0,196,180,.05)');
  charts.hr = new Chart(hCtx, {
    type: 'bar',
    data: {
      labels: HOUR_LABELS,
      datasets: [{
        data: D.hourCounts,
        backgroundColor: hGrad,
        borderColor: '#00c4b4',
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend:{ display:false } },
      scales: { x: noGrid, y: axis() }
    }
  });
}

function rebuildCharts() {
  Object.values(charts).forEach(c => c.destroy());
  charts = {};
  buildCharts();
}

buildCharts();

// ── SIDEBAR NAV ───────────────────────────────────────────────────────────────
function nav(el) {
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  if (window.innerWidth <= 1024) closeSidebar();
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}
document.getElementById('ham').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
});
document.getElementById('overlay').addEventListener('click', closeSidebar);

// ── LIVE TABLE SEARCH + FILTER ────────────────────────────────────────────────
const tbody    = document.getElementById('recentTbody');
const allRows  = Array.from(tbody.querySelectorAll('tr'));
const rcEl     = document.getElementById('rowCount');
const srch     = document.getElementById('tSearch');
const fEv      = document.getElementById('fEvent');
const fDev     = document.getElementById('fDevice');

function filterTable() {
  const q   = srch.value.toLowerCase().trim();
  const ev  = fEv.value.toLowerCase();
  const dv  = fDev.value.toLowerCase();
  let vis = 0;
  allRows.forEach(row => {
    const txt  = row.textContent.toLowerCase();
    const evT  = (row.cells[2]?.textContent || '').toLowerCase();
    const dvT  = (row.cells[5]?.textContent || '').toLowerCase();
    const show = (!q || txt.includes(q)) && (!ev || evT.includes(ev)) && (!dv || dvT.includes(dv));
    row.style.display = show ? '' : 'none';
    if (show) vis++;
  });
  rcEl.textContent = `${vis.toLocaleString('en-IN')} of ${allRows.length.toLocaleString('en-IN')} rows`;
}
srch.addEventListener('input', filterTable);
fEv.addEventListener('change',  filterTable);
fDev.addEventListener('change', filterTable);
filterTable();

// ── AUTO REFRESH COUNTDOWN ────────────────────────────────────────────────────
let secs = 60;
const cdEl   = document.getElementById('cdown');
const rfill  = document.getElementById('rfill');
const timer  = setInterval(() => {
  secs--;
  if (cdEl)  cdEl.textContent = secs;
  if (rfill) rfill.style.width = ((secs / 60) * 100) + '%';
  if (secs <= 0) location.reload();
}, 1000);
</script>
</body>
</html>
<?php
if (isset($conn)) $conn->close();
?>