<?php
session_start();
require_once "db.php";

$ADMIN_USER = "admin";
$ADMIN_PASS = "Petro@2026";

if (isset($_GET["logout"])) {
    session_destroy();
    header("Location: petro-admin-analytics.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["login"])) {
    if ($_POST["username"] === $ADMIN_USER && $_POST["password"] === $ADMIN_PASS) {
        $_SESSION["tracker_logged_in"] = true;
        header("Location: petro-admin-analytics.php");
        exit;
    } else {
        $login_error = "Invalid username or password";
    }
}

if (!isset($_SESSION["tracker_logged_in"])) {
?>
<!DOCTYPE html>
<html>
<head>
    <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
    <title>Petro Tracker Login</title>
    <style>
        body{margin:0;font-family:Arial;background:linear-gradient(135deg,#108082,#063b3d);height:100vh;display:flex;align-items:center;justify-content:center}
        .login{background:#fff;width:380px;padding:35px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
        h2{margin:0 0 20px;color:#108082}
        input{width:100%;padding:14px;margin:10px 0;border:1px solid #ddd;border-radius:10px}
        button{width:100%;padding:14px;background:#108082;color:#fff;border:0;border-radius:10px;font-weight:bold;cursor:pointer}
        .err{color:red;font-size:14px;margin-bottom:10px}
    </style>
</head>
<body>
<form class="login" method="POST">
    <h2>Petro Analytics Login</h2>
    <?php if(isset($login_error)) echo "<div class='err'>$login_error</div>"; ?>
    <input type="text" name="username" placeholder="Username" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit" name="login">Login</button>
</form>
</body>
</html>
<?php exit; } ?>

<?php
if (isset($_POST["reset_data"])) {
    $conn->query("TRUNCATE TABLE tracker_events");
    header("Location: petro-admin-analytics.php");
    exit;
}

if (isset($_GET["export"]) && $_GET["export"] === "csv") {
    header("Content-Type: text/csv");
    header("Content-Disposition: attachment; filename=petro-tracker-report.csv");

    $out = fopen("php://output", "w");
    fputcsv($out, ["ID","Event","Label","Page","Device","Browser","IP","Date","Time","Created At"]);

    $res = $conn->query("SELECT * FROM tracker_events ORDER BY id DESC");
    while ($row = $res->fetch_assoc()) {
        fputcsv($out, [
            $row["id"],
            $row["event_name"],
            $row["label_name"],
            $row["page_path"],
            $row["device"],
            $row["browser"],
            $row["ip_address"],
            $row["event_date"],
            $row["event_time"],
            $row["created_at"]
        ]);
    }
    fclose($out);
    exit;
}

$totalEvents = $conn->query("SELECT COUNT(*) AS c FROM tracker_events")->fetch_assoc()["c"];
$totalClicks = $conn->query("SELECT COUNT(*) AS c FROM tracker_events WHERE event_name NOT LIKE 'page_view' AND event_name NOT LIKE 'scroll_%'")->fetch_assoc()["c"];
$pageViews = $conn->query("SELECT COUNT(*) AS c FROM tracker_events WHERE event_name='page_view'")->fetch_assoc()["c"];
$sessions = $conn->query("SELECT COUNT(DISTINCT session_id) AS c FROM tracker_events")->fetch_assoc()["c"];

$eventSummary = $conn->query("
    SELECT event_name, label_name, COUNT(*) AS total
    FROM tracker_events
    GROUP BY event_name, label_name
    ORDER BY total DESC
");

$recent = $conn->query("
    SELECT *
    FROM tracker_events
    ORDER BY id DESC
    LIMIT 100
");
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
<meta name="googlebot" content="noindex,nofollow,noarchive,nosnippet">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Petro Admin Analytics</title>

<style>
:root{
    --primary:#108082;
    --dark:#0f172a;
    --muted:#64748b;
    --bg:#f4f8fb;
    --white:#fff;
    --border:#e5e7eb;
    --danger:#dc2626;
    --success:#16a34a;
    --shadow:0 18px 45px rgba(15,23,42,.08);
}
*{box-sizing:border-box}
body{
    margin:0;
    font-family:"Segoe UI",Arial,sans-serif;
    background:radial-gradient(circle at top left,rgba(16,128,130,.18),transparent 35%),linear-gradient(135deg,#f5fbfb,#eef4f8);
    color:#1f2937;
}
.layout{display:flex;min-height:100vh}
.sidebar{
    width:270px;
    background:linear-gradient(180deg,#0b5f61,#063b3d);
    color:#fff;
    padding:24px 18px;
    position:fixed;
    inset:0 auto 0 0;
}
.brand{
    display:flex;
    gap:12px;
    align-items:center;
    padding-bottom:24px;
    border-bottom:1px solid rgba(255,255,255,.15);
    margin-bottom:22px;
}
.logo{
    width:48px;height:48px;border-radius:16px;
    background:rgba(255,255,255,.15);
    display:grid;place-items:center;
    font-weight:900;font-size:22px;
}
.brand h2{margin:0;font-size:20px}
.brand p{margin:4px 0 0;font-size:12px;opacity:.75}
.nav{
    padding:14px;
    border-radius:14px;
    margin-bottom:9px;
    font-weight:700;
    color:rgba(255,255,255,.84);
}
.nav.active,.nav:hover{background:rgba(255,255,255,.14);color:#fff}
.main{
    margin-left:270px;
    width:calc(100% - 270px);
    padding:28px;
}
.topbar{
    background:rgba(255,255,255,.82);
    backdrop-filter:blur(18px);
    padding:24px;
    border-radius:22px;
    box-shadow:var(--shadow);
    display:flex;
    justify-content:space-between;
    gap:18px;
    align-items:center;
    margin-bottom:24px;
}
.topbar h1{margin:0;color:var(--dark);font-size:30px}
.topbar p{margin:8px 0 0;color:var(--muted)}
.actions{display:flex;gap:10px;flex-wrap:wrap}
.btn{
    border:0;
    padding:12px 18px;
    border-radius:14px;
    font-weight:800;
    cursor:pointer;
    text-decoration:none;
    display:inline-block;
}
.btn-primary{background:var(--primary);color:#fff}
.btn-danger{background:#fee2e2;color:var(--danger)}
.btn-dark{background:#0f172a;color:#fff}
.cards{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:18px;
    margin-bottom:24px;
}
.card{
    background:#fff;
    border-radius:22px;
    padding:22px;
    box-shadow:var(--shadow);
    border:1px solid var(--border);
    overflow:hidden;
    position:relative;
}
.card:after{
    content:"";
    position:absolute;
    right:-35px;top:-35px;
    width:110px;height:110px;
    border-radius:50%;
    background:#e8f7f7;
}
.card span{
    color:var(--muted);
    font-size:13px;
    font-weight:800;
    text-transform:uppercase;
}
.card h2{
    margin:12px 0 6px;
    font-size:36px;
    color:var(--dark);
    position:relative;
    z-index:2;
}
.card p{margin:0;color:var(--success);font-size:13px;font-weight:700}
.grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:18px;
}
.panel{
    background:#fff;
    border-radius:22px;
    box-shadow:var(--shadow);
    border:1px solid var(--border);
    overflow:hidden;
    margin-bottom:24px;
}
.panel-header{
    padding:20px 22px;
    border-bottom:1px solid var(--border);
    display:flex;
    justify-content:space-between;
    align-items:center;
}
.panel-header h3{margin:0;color:var(--dark)}
.badge{
    background:#e8f7f7;
    color:#0b5f61;
    padding:7px 12px;
    border-radius:999px;
    font-size:12px;
    font-weight:900;
}
.table-wrap{overflow-x:auto}
table{
    width:100%;
    border-collapse:collapse;
    min-width:780px;
}
th{
    background:#f8fafc;
    color:#475569;
    text-align:left;
    padding:15px 18px;
    font-size:12px;
    text-transform:uppercase;
    border-bottom:1px solid var(--border);
}
td{
    padding:15px 18px;
    border-bottom:1px solid #edf2f7;
    font-size:14px;
}
tr:hover{background:#f8fefe}
.event-pill{
    background:#e8f7f7;
    color:#0b5f61;
    padding:7px 11px;
    border-radius:999px;
    font-size:12px;
    font-weight:900;
}
.count{
    background:#0f172a;
    color:white;
    padding:7px 12px;
    border-radius:12px;
    font-weight:900;
}
.footer{
    text-align:center;
    color:var(--muted);
    font-size:13px;
    padding-bottom:25px;
}
@media(max-width:1100px){
    .sidebar{display:none}
    .main{margin-left:0;width:100%}
    .cards{grid-template-columns:repeat(2,1fr)}
    .grid{grid-template-columns:1fr}
}
@media(max-width:640px){
    .main{padding:14px}
    .topbar{flex-direction:column;align-items:flex-start}
    .cards{grid-template-columns:1fr}
    .btn{width:100%;text-align:center}
    .actions{width:100%}
}
</style>
</head>

<body>

<div class="layout">

<aside class="sidebar">
    <div class="brand">
        <div class="logo">P</div>
        <div>
            <h2>PETRO ERP</h2>
            <p>Live Website Analytics</p>
        </div>
    </div>

    <div class="nav active">📊 Dashboard Overview</div>
    <div class="nav">🖱 Button Tracking</div>
    <div class="nav">📄 Page Views</div>
    <div class="nav">📱 Device Report</div>
    <div class="nav">🕒 Recent Activity</div>
</aside>

<main class="main">

    <div class="topbar">
        <div>
            <h1>Petro Admin Analytics</h1>
            <p>Live button clicks, page views, scrolls, device and browser tracking.</p>
        </div>

        <div class="actions">
            <a class="btn btn-primary" href="petro-admin-analytics.php">Refresh</a>
            <a class="btn btn-dark" href="?export=csv">Export CSV</a>
            <form method="POST" onsubmit="return confirm('Reset all tracker data?');">
                <button class="btn btn-danger" name="reset_data">Reset Data</button>
            </form>
            <a class="btn btn-danger" href="?logout=1">Logout</a>
        </div>
    </div>

    <div class="cards">
        <div class="card">
            <span>Total Events</span>
            <h2><?= $totalEvents ?></h2>
            <p>All tracked activity</p>
        </div>

        <div class="card">
            <span>Total Clicks</span>
            <h2><?= $totalClicks ?></h2>
            <p>Button click events</p>
        </div>

        <div class="card">
            <span>Page Views</span>
            <h2><?= $pageViews ?></h2>
            <p>Page load count</p>
        </div>

        <div class="card">
            <span>Unique Sessions</span>
            <h2><?= $sessions ?></h2>
            <p>Visitor sessions</p>
        </div>
    </div>

    <div class="grid">

        <section class="panel">
            <div class="panel-header">
                <h3>Event Summary</h3>
                <span class="badge">Live MySQL Data</span>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Label</th>
                            <th>Total Count</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php if ($eventSummary->num_rows > 0): ?>
                        <?php while($row = $eventSummary->fetch_assoc()): ?>
                        <tr>
                            <td><span class="event-pill"><?= htmlspecialchars($row["event_name"]) ?></span></td>
                            <td><?= htmlspecialchars($row["label_name"]) ?></td>
                            <td><span class="count"><?= $row["total"] ?></span></td>
                        </tr>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <tr><td colspan="3">No tracking data found.</td></tr>
                    <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="panel">
            <div class="panel-header">
                <h3>Recent Activity</h3>
                <span class="badge">Last 100 Logs</span>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Event</th>
                            <th>Page</th>
                            <th>Device</th>
                            <th>Browser</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php if ($recent->num_rows > 0): ?>
                        <?php while($row = $recent->fetch_assoc()): ?>
                        <tr>
                            <td><?= htmlspecialchars($row["event_date"]) ?></td>
                            <td><?= htmlspecialchars($row["event_time"]) ?></td>
                            <td><span class="event-pill"><?= htmlspecialchars($row["label_name"]) ?></span></td>
                            <td><?= htmlspecialchars($row["page_path"]) ?></td>
                            <td><?= htmlspecialchars($row["device"]) ?></td>
                            <td><?= htmlspecialchars($row["browser"]) ?></td>
                        </tr>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <tr><td colspan="6">No recent activity found.</td></tr>
                    <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

    </div>

    <p class="footer">
        Petro Tracker Dashboard | Noindex protected | MySQL powered analytics system
    </p>

</main>
</div>

</body>
</html>