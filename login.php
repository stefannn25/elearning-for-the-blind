<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>E-Learning | Login</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">

  <style>
    :root {
      --bg-dark: #121212;
      --bg-card: #1e1e1e;
      --text-light: #f5f5f5;
      --accent: #88e785ff;
      --accent-2: #ffcc00;
    }

    body {
      background: var(--bg-dark);
      color: var(--text-light);
      font-family: 'Poppins', sans-serif;
      font-size: 1.3rem;
      line-height: 1.6;
    }

    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bg-dark);
    }

    .login-card {
      background: var(--bg-card);
      border-radius: 30px;
      padding: 3rem;
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: 0 0 40px rgba(0,0,0,0.5);
      transition: 0.3s ease;
    }

    .login-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0 50px rgba(136,231,133,0.15);
    }

    h2 {
      color: var(--accent);
      font-weight: 700;
      font-size: 2.2rem;
      margin-bottom: 2rem;
    }

    .input-group {
      margin-bottom: 1.8rem;
      align-items: center;
    }

    .input-group-text {
      background: #2a2a2a !important;
      border: 2px solid var(--accent);
      border-right: none;
      color: var(--accent);
      font-size: 1.6rem;
      border-radius: 16px 0 0 16px !important;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 1.2rem;
    }

    .form-control {
      background: #2a2a2a !important;
      border: 2px solid var(--accent);
      border-left: none;
      color: #ffffffff;
      font-size: 1.3rem;
      padding: 1rem 1.2rem;
      border-radius: 0 16px 16px 0 !important;
      height: 70px !important;
      box-shadow: none !important;
    }

    .form-control:focus {
      border-color: var(--accent-2);
      box-shadow: 0 0 15px rgba(255,204,0,0.3);
      color: var(--accent-2);
    }
    .form-control::placeholder {
      color: var(--accent-2);
      opacity: 0.8 !important;
    }

    .btn-login {
      width: 100%;
      background: var(--accent);
      color: #111;
      font-weight: 700;
      border: none;
      padding: 1.2rem 2rem;
      font-size: 1.5rem;
      border-radius: 50px;
      transition: all 0.3s ease;
    }

    .btn-login:hover {
      background: #6dd06d;
      transform: scale(1.05);
    }

    .form-label {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text-light);
      text-align: left;
      display: block;
      margin-bottom: .6rem;
    }

    .footer-text {
      margin-top: 1.8rem;
      font-size: 1.1rem;
      color: #ccc;
    }

    .footer-text a {
      color: var(--accent-2);
      text-decoration: none;
      font-weight: 600;
    }

    .footer-text a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-card">
      <h2><i class="bi bi-book-half"></i> E-Learning Login</h2>

      <form action="login_process.php" method="POST">
        <div class="mb-3">
          <label for="email" class="form-label">Email Address</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input type="email" class="form-control" name="email" id="email" placeholder="Enter your email" required>
          </div>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input type="password" class="form-control" name="password" id="password" placeholder="Enter your password" required>
          </div>
        </div>

        <button type="submit" class="btn-login">Login</button>
      </form>

      <div class="footer-text mt-3">
        Don’t have an account? <a href="register.php">Register here</a>
      </div>
    </div>
  </div>
</body>
</html>
