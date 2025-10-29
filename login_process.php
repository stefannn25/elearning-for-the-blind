<?php
session_start();

$conn = new mysqli("localhost", "root", "@dminpassword", "elearning_db");
if ($conn->connect_error) die("DB error: " . $conn->connect_error);

$email = strtolower(trim($_POST['email']));
$password = trim($_POST['password']);

$stmt = $conn->prepare("SELECT id, fullname, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 1) {
    $user = $res->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['fullname'] = $user['fullname'];
        $_SESSION['email'] = $email;
        $_SESSION['logged_in'] = true; 
        echo '
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Logging In...</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
            <link rel="stylesheet" href="dashboard_styles.css">
            <style>
                .loading-screen {
                background: var(--bg-dark);
                color: var(--text-light);
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                }
                .spinner-border {
                color: var(--accent);
                width: 4rem;
                height: 4rem;
                margin-bottom: 1rem;
                }
                .loading-text {
                font-family: "Poppins", sans-serif;
                font-size: 1.1rem;
                color: var(--text-light);
                }
                .accent-text {
                color: var(--accent);
                font-weight: 600;
                }
            </style>
            <meta http-equiv="refresh" content="1.8;url=student_dashboard.php">
            </head>
            <body>
            <div class="loading-screen text-center">
                <div class="spinner-border" role="status"></div>
                <p class="loading-text mt-3">Logging you in<span class="accent-text">...</span></p>
            </div>
            </body>
            </html>
            ';
        header("Refresh: 2; URL=student_dashboard.php");
        exit;
    } else {
        echo "❌ Wrong password.";
    }
} else {
    echo "❌ Email not found.";
}
?>

