<?php
session_start();
session_unset();
$_SESSION['guest'] = true;
$_SESSION['fullname'] = "Guest User";
header("Location: workspace.php");
exit();
?>
