<?php

$host = "localhost";
$dbname = "petro_tracker";
$username = "petroindustech_petro_user";
$password = "Monusoni@2003#";

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Database Connection Failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>