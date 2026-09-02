<?php
// File Name: config.php
// IMPORTANT: Use a NEW API key. The old shared key must be revoked.

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| OpenAI
|--------------------------------------------------------------------------
*/

// Recommended: set OPENAI_API_KEY in your hosting environment.
// Fallback placeholder below is only for hosts where env vars are unavailable.
$envKey = getenv("OPENAI_API_KEY");

if ($envKey && trim($envKey) !== "") {
    define("OPENAI_API_KEY", trim($envKey));
} else {
    define("OPENAI_API_KEY", "YOUR_NEW_OPENAI_API_KEY_HERE");
}

// Cost-sensitive production chatbot model.
define("OPENAI_MODEL", "gpt-5.6-luna");

define("OPENAI_TIMEOUT", 35);
define("PETRO_AI_DEBUG", false);

/*
|--------------------------------------------------------------------------
| Petro Business Details
|--------------------------------------------------------------------------
*/

define("PETRO_PHONE", "+91 8000007336");
define("PETRO_PHONE_DIGITS", "918000007336");
define("PETRO_EMAIL", "contact@petroindustech.com");
define("PETRO_WEBSITE", "https://www.petroindustech.com");

define("PETRO_EXPORT_PHONE", "+91 7669036572");
define("PETRO_EXPORT_EMAIL", "exim@petroindustech.com");

define("PETRO_CATALOGUE_PAGE", PETRO_WEBSITE . "/catalogue.html");
define("PETRO_CPP_PAGE", PETRO_WEBSITE . "/petro-channel-partner-program.html");
define("PETRO_DEALER_PAGE", PETRO_WEBSITE . "/find-a-distributor.html");
define("PETRO_CONTACT_PAGE", PETRO_WEBSITE . "/contact.html");
define("PETRO_STORE", "https://onlinepetro.com/");

/*
|--------------------------------------------------------------------------
| Chat Limits
|--------------------------------------------------------------------------
*/

define("MAX_MESSAGE_LENGTH", 1200);
define("PETRO_HISTORY_MESSAGES", 10);

define("PETRO_RATE_LIMIT_MAX", 20);
define("PETRO_RATE_LIMIT_WINDOW", 600);
