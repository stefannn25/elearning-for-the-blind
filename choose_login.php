<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Choose Access | E-Learning Portal</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #121212;
      --bg-card: #1e1e1e;
      --text-light: #f5f5f5;
      --accent: #88e785ff;
      --accent-hover: #5fb75f;
    }

    body {
      background: var(--bg-dark);
      color: var(--text-light);
      font-family: 'Poppins', sans-serif;
      margin: 0;
      padding: 0;
    }

    .container-choice {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    h2 {
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .subtitle {
      color: #f1f1f1;
      font-size: 1.1rem;
      margin-bottom: 2.5rem;
      font-weight: 500;
    }

    .card-option {
      background: var(--bg-card);
      border-radius: 20px;
      padding: 2rem;
      color: var(--text-light);
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(0,0,0,0.4);
      outline: none;
    }

    .card-option:hover, .card-option:focus {
      transform: scale(1.05);
      box-shadow: 0 10px 35px rgba(0,0,0,0.6);
      background: #242424;
    }

    .card-option i {
      font-size: 3.5rem;
      color: var(--accent);
      margin-bottom: 1rem;
    }

    .card-option h4 {
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 0.8rem;
    }

    .card-option p {
      color: #f1f1f1; 
      font-size: 1.05rem;
      font-weight: 500;
    }

    .fade-slide {
      opacity: 0;
      transform: translateY(15px);
      animation: fadeSlideIn 1s ease forwards;
    }

    @keyframes fadeSlideIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .col-md-5 {
        margin-bottom: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container container-choice fade-slide">
    <h2><i class="bi bi-mortarboard"></i> Welcome to E-Learning Portal for Visually Impaired Learners</h2>
    <p class="subtitle">Please choose how you want to continue</p>

    <div class="row justify-content-center g-4 px-3">
      <div class="col-md-5">
        <div class="card-option h-100" tabindex="0" onclick="transitionTo('login.php')" role="button" aria-label="Login as a registered student">
          <i class="bi bi-person-circle"></i>
          <h4>Login as Student</h4>
          <p>Access your personalized dashboard, subjects, and learning progress.</p>
        </div>
      </div>

      <div class="col-md-5">
        <div class="card-option h-100" tabindex="0" onclick="transitionTo('workspace.php?guest=true')" role="button" aria-label="Continue as guest user">
          <i class="bi bi-chat-dots"></i>
          <h4>Continue as Guest</h4>
          <p>Use the learning chatbot and explore without logging in.</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    function transitionTo(page) {
      document.body.style.transition = "opacity 0.6s ease";
      document.body.style.opacity = "0";
      setTimeout(() => window.location.href = page, 600);
    }
  </script>
</body>
</html>
