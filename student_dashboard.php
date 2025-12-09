<?php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: login.php");
    exit();
}

$subjects = [
    ["name" => "Mathematics", "icon" => "bi-calculator", "desc" => "Improve problem-solving and analytical skills."],
    ["name" => "English", "icon" => "bi-journal-bookmark", "desc" => "Enhance communication and writing skills."],
    ["name" => "Computer Studies", "icon" => "bi-laptop", "desc" => "Learn coding and digital literacy."],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Dashboard | Subjects</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link rel="stylesheet" href="dashboard_styles.css">
  <style>
    body {
      background-color: #121212;
      color: #f8f9fa;
      font-family: 'Poppins', sans-serif;
    }

    .text-accent {
      color: #0dcaf0; /* cyan accent */
    }

    .content-card {
      background-color: #1e1e1e;
      border: 1px solid #2c2c2c;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .content-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    .content-card p {
      color: #b0b3b8 !important;
    }

    .navbar {
      border-bottom: 1px solid #2c2c2c;
    }
  </style>
</head>

<body>
  <nav class="navbar navbar-dark bg-dark px-4 py-3">
    <span class="navbar-brand mb-0 h1">
      <i class="bi bi-mortarboard text-accent me-2"></i> Student Dashboard
    </span>
    <div class="d-flex align-items-center">
      <span class="me-3">Welcome, <strong><?= htmlspecialchars($_SESSION['fullname']); ?></strong></span>
      <a href="logout.php" class="btn btn-outline-light btn-sm rounded-pill px-3">Logout</a>
    </div>
  </nav>

  <div class="container py-5">
    <h3 class="text-center text-accent mb-4">Your Enrolled Subjects</h3>

    <div class="row justify-content-center g-4">
      <?php foreach ($subjects as $subject): ?>
        <div class="col-md-4 col-lg-3">
          <div class="card content-card text-center p-4 h-100 shadow-sm"
               style="cursor:pointer"
               onclick="openWorkspace('<?= urlencode($subject['name']); ?>')">
            <i class="bi <?= $subject['icon']; ?> fs-1 text-accent mb-3"></i>
            <h5 class="fw-bold"><?= htmlspecialchars($subject['name']); ?></h5>
            <p class="small"><?= htmlspecialchars($subject['desc']); ?></p>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>

<script>
  function openWorkspace(subject) {
    window.location.href = `workspace.php?subject=${encodeURIComponent(subject)}`;
  }
</script>


  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
