<?php
$plain = "yourpassword"; // replace with your actual password
$hash = '$2y$10$something...'; // copy the hash from your DB

if (password_verify($plain, $hash)) {
    echo "Password matches!";
} else {
    echo "No match.";
}
?>
