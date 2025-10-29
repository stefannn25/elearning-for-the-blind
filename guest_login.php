<?php
session_start();

// Clear any student session
session_unset();

// Set guest session
$_SESSION['guest'] = true;
$_SESSION['fullname'] = "Guest User";

header("Location: workspace.php");
exit();
?>
