<?php
session_start();
$subject = isset($_GET['subject']) ? htmlspecialchars($_GET['subject']) : 'General';
if (!isset($_SESSION['logged_in']) && !isset($_SESSION['guest'])) {
    header("Location: choose_login.php");
    exit();
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= $subject ?> | Workspace</title>
  
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Poppins:wght@400;600&display=swap" rel="stylesheet"> 
  <link rel="stylesheet" href="dashboard_styles.css"> 
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';</script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
      const CURRENT_COURSE = "<?= $subject ?>"; 
      console.log("Active Course:", CURRENT_COURSE);
  </script>
  <script src="dashboard_script.js?v=<?= time(); ?>" defer></script>

  <style>
    .modal-content {
        background-color: #1e1e1e;
        color: #f5f5f5;
        border: 1px solid #444;
    }
    .modal-header { border-bottom: 1px solid #333; }
    .modal-footer { border-top: 1px solid #333; }
    .kbd-key {
        background-color: #333;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 2px 6px;
        font-family: monospace;
        color: #ffcc00;
        font-weight: bold;
    }
    .voice-cmd {
        color: #0dcaf0;
        font-weight: bold;
        font-style: italic;
    }
  </style>
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
          <i class="bi bi-arrow-left me-2"></i> Back to Courses
        </a>
        <button class="nav-btn mb-2 w-100 text-start border-0" data-bs-toggle="modal" data-bs-target="#shortcutsModal">
            <i class="bi bi-keyboard me-2"></i> Shortcuts Info
        </button>
        <button class="nav-btn mb-2 w-100 text-start border-0" data-bs-toggle="modal" data-bs-target="#voiceModal">
            <i class="bi bi-mic me-2"></i> Voice Commands
        </button>
      </div>

        <hr class="text-secondary">
        <div class="d-flex align-items-center">
          <i class="bi bi-person-circle me-2"></i>
          <span class="sidebar-text"><?= $_SESSION['fullname'] ?? 'Guest' ?></span>
        </div>
      </div>
    </nav>

    <main class="col-md-9 ms-sm-auto col-lg-10 px-4 py-4">
      <div class="col-md-9 p-4">
        <h2 class="mb-4 text-warning"><i class="bi bi-folder2-open me-2"></i><?= $subject ?> Workspace</h2>
        <ul class="nav nav-tabs mb-3" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="docs-tab" data-bs-toggle="tab" data-bs-target="#docs" type="button" role="tab">Documents</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="chat-tab" data-bs-toggle="tab" data-bs-target="#chat" type="button" role="tab">Chat</button>
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <div class="tab-pane fade show active" id="docs" role="tabpanel">
            <div class="content-card">
              <h4>Upload Documents for <span class="text-accent"><?= $subject ?></span></h4>
              <input type="file" class="form-control mt-3" multiple onchange="handleUpload(event)">
              <p class="text-secondary mt-2">Supported: PDF, TXT, DOCX</p>
            </div>

            <div class="content-card mt-3">
              <h3>Uploaded Files</h3>
              <ul id="docList" class="list-group list-group-flush"></ul>
            </div>
          </div>
          <div class="tab-pane fade" id="chat" role="tabpanel">
            <div class="content-card mb-3" id="chatArea">
            </div>
            <div class="input-group">
              <input type="text" id="userInput" class="form-control" placeholder="Ask about your <?= $subject ?> documents...">
              <button id="sendButton" class="btn accent-btn" onclick="sendMessage()">Send</button>
              <button class="btn btn-outline-danger btn-sm" onclick="clearChatHistory()">Clear</button>
            </div>
          </div>

        </div>

        <button id="micButton" class="btn btn-danger rounded-circle shadow-lg">
          <i class="bi bi-mic-fill fs-0.9"></i>
        </button>
      
        <button id="speakerButton" class="btn btn-info rounded-circle shadow-lg">
          <i class="bi bi-volume-up-fill fs-0.9"></i>
        </button>
      </div>
    </main>
  </div>
</div>
<div class="modal fade" id="shortcutsModal" tabindex="-1" aria-labelledby="shortcutsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="shortcutsModalLabel"><i class="bi bi-keyboard text-warning me-2"></i> Keyboard Shortcuts</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
            <table class="table table-dark table-hover mb-0">
                <thead>
                    <tr>
                        <th scope="col">Action</th>
                        <th scope="col">Shortcut</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Navigate Home</td><td><span class="kbd-key">Alt</span> + <span class="kbd-key">H</span></td></tr>
                    <tr><td>Open Documents</td><td><span class="kbd-key">Alt</span> + <span class="kbd-key">1</span></td></tr>
                    <tr><td>Open Chat</td><td><span class="kbd-key">Alt</span> + <span class="kbd-key">2</span></td></tr>
                    <tr><td>Read Last Reply</td><td><span class="kbd-key">Alt</span> + <span class="kbd-key">R</span></td></tr>
                    <tr><td>Stop Audio</td><td><span class="kbd-key">Alt</span> + <span class="kbd-key">S</span></td></tr>
                    <tr><td>Toggle Mic</td><td><span class="kbd-key">Alt</span> + <span class="kbd-key">M</span></td></tr>
                    <tr><td>Contrast Mode</td><td><span class="kbd-key">Alt</span> + <span class="kbd-key">C</span></td></tr>
                    <tr><td>Zoom In/Out</td><td><span class="kbd-key">Alt</span> + <span class="kbd-key">+ / -</span></td></tr>
                </tbody>
            </table>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="voiceModal" tabindex="-1" aria-labelledby="voiceModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="voiceModalLabel"><i class="bi bi-mic text-info me-2"></i> Voice Commands</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p class="text-muted small">Click the microphone and say any of the following:</p>
        <div class="table-responsive">
            <table class="table table-dark table-hover mb-0">
                <thead>
                    <tr>
                        <th scope="col">Say This...</th>
                        <th scope="col">To Do This...</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td><span class="voice-cmd">"Home"</span></td><td>Go to Dashboard</td></tr>
                    <tr><td><span class="voice-cmd">"Documents"</span></td><td>Open Documents Tab</td></tr>
                    <tr><td><span class="voice-cmd">"Chat"</span></td><td>Open Chat Tab</td></tr>
                    <tr><td><span class="voice-cmd">"Read"</span></td><td>Read Last Message</td></tr>
                    <tr><td><span class="voice-cmd">"Stop"</span></td><td>Stop Audio</td></tr>
                    <tr><td><span class="voice-cmd">"Analyze"</span></td><td>Analyze First Document</td></tr>
                    <tr><td><span class="voice-cmd">"Contrast"</span></td><td>Toggle High Contrast</td></tr>
                    <tr><td><span class="voice-cmd">"Bigger"</span></td><td>Increase Font Size</td></tr>
                    <tr><td><span class="voice-cmd">"Smaller"</span></td><td>Decrease Font Size</td></tr>
                    <tr><td><span class="voice-cmd">"Help"</span></td><td>Show Shortcuts</td></tr>
                </tbody>
            </table>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
