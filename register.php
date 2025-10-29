<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Learning | Register</title>

    <!-- Bootstrap & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Poppins:wght@400;600&display=swap" rel="stylesheet"> 

    <!-- Custom CSS -->
    <link rel="stylesheet" href="dashboard_styles.css">
  </head>

  <body class="login-body">
    <div class="login-container d-flex justify-content-center align-items-center min-vh-100">
      <div class="login-card card p-4 shadow border-0">
        <div class="text-center mb-4">
          <i class="bi bi-mortarboard-fill fs-1 text-accent"></i>
          <h4 class="fw-bold mt-2">Create Your Account</h4>
          <p class="text-muted small">Join our e-learning platform today</p>
        </div>

        <!-- Registration Form -->
        <form action="register_process.php" method="POST">
          <div class="mb-3">
            <label for="fullname" class="form-label fw-semibold">Full Name</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
              <input type="text" id="fullname" name="fullname" class="form-control" placeholder="Enter your full name" required>
            </div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label fw-semibold">Email Address</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope-fill"></i></span>
              <input type="email" id="email" name="email" class="form-control" placeholder="Enter your email" required>
            </div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label fw-semibold">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
              <input type="password" id="password" name="password" class="form-control" placeholder="Create a password" required>
            </div>
          </div>

          <div class="mb-3">
            <label for="confirm_password" class="form-label fw-semibold">Confirm Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-shield-lock-fill"></i></span>
              <input type="password" id="confirm_password" name="confirm_password" class="form-control" placeholder="Confirm your password" required>
            </div>
          </div>

          <button type="submit" class="btn accent-btn w-100 py-2 rounded-pill">Register</button>
        </form>

        <div class="text-center mt-4">
          <p class="small mb-0">
            Already have an account?
            <a href="login.php" class="text-accent fw-semibold text-decoration-none">Login here</a>
          </p>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>
