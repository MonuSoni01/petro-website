<?php
/*
|--------------------------------------------------------------------------
| PETRO TRACKER API
| File: tracker.php
| Purpose: Website events ko tracker_events table me save karna
|--------------------------------------------------------------------------
*/

date_default_timezone_set('Asia/Kolkata');

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// ✅ CORS: Sirf apne trusted domains allow karo
$allowedOrigins = [
    "https://www.petroindustech.com",
    "https://petroindustech.com"
];

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: https://www.petroindustech.com");
}

// ✅ Preflight request handle
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "db.php";

// ✅ JSON response helper
function sendResponse($status, $message, $extra = []) {
    echo json_encode(array_merge([
        "status" => $status,
        "message" => $message
    ], $extra));
    exit;
}

// ✅ Only POST allowed
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    sendResponse(false, "Invalid request method");
}

// ✅ Read raw JSON input
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    http_response_code(400);
    sendResponse(false, "Invalid or empty JSON data");
}

// ✅ Clean function
function cleanValue($value, $maxLength = 150) {
    $value = trim((string)($value ?? ""));
    $value = strip_tags($value);
    return mb_substr($value, 0, $maxLength, "UTF-8");
}

// ✅ Real IP detect function
function getClientIP() {
    // Cloudflare real visitor IP
    if (!empty($_SERVER["HTTP_CF_CONNECTING_IP"])) {
        return $_SERVER["HTTP_CF_CONNECTING_IP"];
    }

    // Proxy fallback
    if (!empty($_SERVER["HTTP_X_FORWARDED_FOR"])) {
        $ips = explode(",", $_SERVER["HTTP_X_FORWARDED_FOR"]);
        return trim($ips[0]);
    }

    return $_SERVER["REMOTE_ADDR"] ?? "0.0.0.0";
}

// ✅ IP se Country / State / City / Pincode detect
function getLocationByIP($ip) {
    $ip = trim($ip);

    // Local/private IP ke liye location nahi milegi
    if (
        $ip === "" ||
        $ip === "0.0.0.0" ||
        $ip === "127.0.0.1" ||
        $ip === "::1" ||
        strpos($ip, "192.168.") === 0 ||
        strpos($ip, "10.") === 0 ||
        strpos($ip, "172.16.") === 0
    ) {
        return [
            "country" => "Local",
            "state" => "Local",
            "city" => "Local",
            "pincode" => ""
        ];
    }

    $url = "http://ip-api.com/json/" . urlencode($ip) . "?fields=status,country,regionName,city,zip";

    $response = false;

    // cURL method
    if (function_exists("curl_init")) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2);
        $response = curl_exec($ch);
        curl_close($ch);
    }

    // fallback method
    if (!$response) {
        $response = @file_get_contents($url);
    }

    if (!$response) {
        return [
            "country" => "Unknown",
            "state" => "Unknown",
            "city" => "Unknown",
            "pincode" => ""
        ];
    }

    $geo = json_decode($response, true);

    if (!is_array($geo) || ($geo["status"] ?? "") !== "success") {
        return [
            "country" => "Unknown",
            "state" => "Unknown",
            "city" => "Unknown",
            "pincode" => ""
        ];
    }

    return [
        "country" => $geo["country"] ?? "Unknown",
        "state" => $geo["regionName"] ?? "Unknown",
        "city" => $geo["city"] ?? "Unknown",
        "pincode" => $geo["zip"] ?? ""
    ];
}

// ✅ Input sanitize
$event_name = cleanValue($data["event_name"] ?? "", 100);
$label_name = cleanValue($data["label_name"] ?? "", 150);
$page_url   = cleanValue($data["page_url"] ?? "", 500);
$page_path  = cleanValue($data["page_path"] ?? "", 255);
$page_title = cleanValue($data["page_title"] ?? "", 255);
$device     = cleanValue($data["device"] ?? "", 50);
$browser    = cleanValue($data["browser"] ?? "", 100);
$session_id = cleanValue($data["session_id"] ?? "", 100);
$referrer   = cleanValue($data["referrer"] ?? "", 500);

// ✅ IP Address
$ip_address = getClientIP();
$ip_address = cleanValue($ip_address, 45);

// ✅ Location data
$location = getLocationByIP($ip_address);

$country    = cleanValue($location["country"] ?? "Unknown", 100);
$state_name = cleanValue($location["state"] ?? "Unknown", 100);
$city_name  = cleanValue($location["city"] ?? "Unknown", 100);
$pincode    = cleanValue($location["pincode"] ?? "", 20);

// ✅ IST Date & Time
$event_date = date("Y-m-d");
$event_time = date("H:i:s");

// ✅ Required validation
if ($event_name === "") {
    http_response_code(422);
    sendResponse(false, "event_name is required");
}

// ✅ Allowed events list
$allowedEvents = [
    "page_view",
    "pdf_download",
    "call_click",
    "whatsapp_click",
    "app_download_click",
    "nav_click",
    "cta_click",
    "social_click",
    "image_click",
    "dealer_card_click",
    "form_submit",
    "button_click",
    "click"
];

// ✅ scroll_25, scroll_50, scroll_75, scroll_100 type events allow
$isScrollEvent = strpos($event_name, "scroll_") === 0;

if (!in_array($event_name, $allowedEvents, true) && !$isScrollEvent) {
    http_response_code(422);
    sendResponse(false, "Invalid event name");
}

// ✅ Default fallback values
if ($label_name === "") {
    $label_name = "Unknown_Label";
}

if ($page_path === "") {
    $page_path = "/";
}

if ($device === "") {
    $device = "Unknown";
}

if ($browser === "") {
    $browser = "Unknown";
}

if ($session_id === "") {
    $session_id = "unknown_session";
}

if ($referrer === "") {
    $referrer = "direct";
}

// ✅ Prepare insert query
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
        country,
        state_name,
        city_name,
        pincode,
        referrer,
        event_date,
        event_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
    http_response_code(500);
    sendResponse(false, "Database prepare failed");
}

$stmt->bind_param(
    "ssssssssssssssss",
    $event_name,
    $label_name,
    $page_url,
    $page_path,
    $page_title,
    $device,
    $browser,
    $session_id,
    $ip_address,
    $country,
    $state_name,
    $city_name,
    $pincode,
    $referrer,
    $event_date,
    $event_time
);

// ✅ Execute
if ($stmt->execute()) {

    $stmt->close();
    $conn->close();

    sendResponse(true, "Tracked successfully", [
        "event_name" => $event_name,
        "label_name" => $label_name,
        "country" => $country,
        "state" => $state_name,
        "city" => $city_name
    ]);

} else {

    $stmt->close();
    $conn->close();

    http_response_code(500);
    sendResponse(false, "Database insert failed");
}
?>