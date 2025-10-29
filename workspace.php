<?php
  session_start();

  $subject = isset($_GET['subject']) ? htmlspecialchars($_GET['subject']) : 'Workspace';

  if (!isset($_SESSION['logged_in']) && !isset($_SESSION['guest'])) {
    header("Location: choose_login.php");
    exit();
}
  $uploadMessage = '';
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['document'])) {
      $uploaddir = __DIR__ . '/uploads/';
      if (!is_dir($uploaddir)) mkdir($uploaddir, 0755, true);

      $file = $_FILES['document'];
      $filename = basename($file['name']);
      $target = $uploaddir . $filename;

      // Simple collision handling
      $i = 1;
      while (file_exists($target)) {
          $target = $uploaddir . pathinfo($filename, PATHINFO_FILENAME) . "-{$i}." . pathinfo($filename, PATHINFO_EXTENSION);
          $i++;
      }

      if (move_uploaded_file($file['tmp_name'], $target)) {
          $uploadMessage = 'Uploaded: ' . htmlspecialchars(basename($target));
      } else {
          $uploadMessage = 'Upload failed.';
      }
  }

  // Helper: list uploaded files
  function listUploads() {
      $dir = __DIR__ . '/uploads/';
      $files = [];
      if (is_dir($dir)) {
          $all = array_diff(scandir($dir), ['..', '.']);
          foreach ($all as $f) {
              $path = $dir . $f;
              if (is_file($path)) $files[] = $f;
          }
      }
      return $files;
  }

  // Simple API endpoints (AJAX)
  if (isset($_GET['api'])) {
      header('Content-Type: application/json');
      $api = $_GET['api'];
      if ($api === 'files') {
          echo json_encode(['files' => listUploads()]);
          exit;
      }
  if ($api === 'ask') {
      $question = $_POST['question'] ?? '';
      $contextFile = $_POST['file'] ?? null;

      // Load context from uploaded file
      $contextText = '';
      if ($contextFile && file_exists(__DIR__ . "/uploads/$contextFile")) {
          $contextText = file_get_contents(__DIR__ . "/uploads/$contextFile");
      }

      $apiKey = "AIzaSyD5_4EXAmIyYmhA07WRg7RauWfYBA5aE9k";

      $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

      $payload = [
          "contents" => [
              [
                  "parts" => [
                      ["text" => "Context:\n" . $contextText . "\n\nQuestion: " . $question]
                  ]
              ]
          ]
      ];

      $ch = curl_init($url);
      curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
      curl_setopt($ch, CURLOPT_POST, 1);
      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      $response = curl_exec($ch);
      curl_close($ch);

      $json = json_decode($response, true);
      $answer = $json['candidates'][0]['content']['parts'][0]['text'] ?? "Error: no response from Gemini";

      echo json_encode(['answer' => $answer]);
      exit;
      }


      // unknown api
      echo json_encode(['error' => 'unknown api']);
      exit;
  }


// ----------------- HTML below -----------------
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Student Dashboard</title>
  <link rel="icon" type="image/png" href="images/logo.png">
  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Poppins:wght@400;600&display=swap" rel="stylesheet"> 
  <link rel = "stylesheet" href = "dashboard_styles.css" > 
</head>
<body>
<div class="container-fluid">
  <div class="row">
    <nav class="col-md-3 col-lg-2 sidebar p-3 d-flex flex-column">
      <div id="sidebar" class="sidebar d-flex flex-column p-3">
        <div class="brand mb-4 d-flex align-items-center">
          <i class="bi bi-journal-text me-2"></i> 
          <span class="sidebar-text">Student Dashboard</span>
        </div>

      <div class="sidebar p-3">
        <h4 class="brand mb-4 text-accent">E-Learning</h4>
        
        <a href="student_dashboard.php" class="nav-btn active mb-2">
          <i class="bi bi-house-door me-2"></i> Home
        </a>

        <a href="student_dashboard.php" class="nav-btn mb-2">
          <i class="bi bi-chat-dots me-2"></i> Chat
        </a>

        <a href="documents.php" class="nav-btn mb-2">
          <i class="bi bi-folder2-open me-2"></i> Documents
        </a>
      </div>


        <hr class="text-secondary">

        <div class="d-flex align-items-center">
          <i class="bi bi-person-circle me-2"></i>
          <span class="sidebar-text">Profile</span>
        </div>

        <button id="toggleSidebar" class="btn btn-outline-light mt-3">
          <i class="bi bi-list"></i>
        </button>
      </div>
    </nav>

    <main class="col-md-9 ms-sm-auto col-lg-10 px-4 py-4">
      <div class="col-md-9 p-4">
        <h2 class="mb-4"><?= $subject ?> Workspace</h2>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="docs-tab" data-bs-toggle="tab" data-bs-target="#docs" type="button" role="tab">Documents</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="chat-tab" data-bs-toggle="tab" data-bs-target="#chat" type="button" role="tab">Chat</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="summary-tab" data-bs-toggle="tab" data-bs-target="#summary" type="button" role="tab">Summaries</button>
            <div id="summaryContent" class="mt-3"></div>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="myTabContent">

          <!-- Documents Tab -->
          <div class="tab-pane fade show active" id="docs" role="tabpanel">
            <div class="content-card">
              <h4>Upload your Documents</h4>
              <input type="file" class="form-control mt-3" multiple onchange="handleUpload(event)">
              <p class="text-secondary mt-2">Supported: PDF, TXT, DOCX</p>
            </div>

            <div class="content-card mt-3">
              <h5>Uploaded Files</h5>
              <ul id="docList" class="list-group list-group-flush"></ul>
            </div>
          </div>


          <!-- Chat Tab -->
          <div class="tab-pane fade" id="chat" role="tabpanel">
            <div class="content-card mb-3" id="chatArea">
              <!-- Messages will appear here -->
            </div>
            <div class="input-group">
              <input type="text" id="userInput" class="form-control" placeholder="Type your message...">
              <button id="sendButton" class="btn accent-btn" onclick="sendMessage()">Send</button>
              <button class="btn btn-outline-danger btn-sm" onclick="clearChatHistory()">Clear Chat</button>
            </div>
          </div>

          <!-- Summaries Tab -->
          <div class="tab-pane fade" id="summary" role="tabpanel">
            <div class="content-card">
              <h4>Workplace Summaries</h4>
              <p class="text-secondary">Summarize your documents.</p>
              <button class="btn accent-btn mt-3" onclick="generateSummary()">Generate Summaries</button>
              <div id="summaryContent" class="mt-3"></div>
            </div>
          </div>

        </div>
        <!-- Floating Mic Button -->
        <button id="micButton" class="btn btn-danger rounded-circle shadow-lg">
          <i class="bi bi-mic-fill fs-0.9"></i>
        </button>
      <!-- Floating Speaker Button -->
        <button id="speakerButton" class="btn btn-info rounded-circle shadow-lg">
          <i class="bi bi-volume-up-fill fs-0.9"></i>
        </button>
      </div>
    </main>
  </div>
</div>


<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="dashboard_script.js"></script>
</body>
</html>
