<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "status" => false,
        "message" => "Invalid request method"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "status" => false,
        "message" => "No data received"
    ]);
    exit;
}

$event_name = $data["event_name"] ?? "";
$label_name = $data["label_name"] ?? "";
$page_url = $data["page_url"] ?? "";
$page_path = $data["page_path"] ?? "";
$page_title = $data["page_title"] ?? "";
$device = $data["device"] ?? "";
$browser = $data["browser"] ?? "";
$session_id = $data["session_id"] ?? "";
$referrer = $data["referrer"] ?? "";
$event_date = date("Y-m-d");
$event_time = date("H:i:s");

$ip_address = $_SERVER["REMOTE_ADDR"] ?? "";

$stmt = $conn->prepare("
    INSERT INTO tracker_events
    (
        event_name,
        label_name,
        page_url,
        page_path,
        page_title,
        device,
        browser,
        session_id,
        ip_address,
        referrer,
        event_date,
        event_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "ssssssssssss",
    $event_name,
    $label_name,
    $page_url,
    $page_path,
    $page_title,
    $device,
    $browser,
    $session_id,
    $ip_address,
    $referrer,
    $event_date,
    $event_time
);

if ($stmt->execute()) {
    echo json_encode([
        "status" => true,
        "message" => "Tracked successfully"
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Database insert failed"
    ]);
}

$stmt->close();
$conn->close();
?>