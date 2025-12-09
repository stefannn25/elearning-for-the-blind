let documents = [];
let activeSpeechBtn = null; 
let isDeleteMode = false;
let hoverTTSTimer = null;

const SoundEffects = {
    ctx: null,
    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playTone: function(freq, type, duration, delay = 0) {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    },
    click: function() { this.playTone(800, 'sine', 0.1); },           
    hover: function() { this.playTone(400, 'triangle', 0.05); },      
    success: function() {                                     
        this.playTone(500, 'sine', 0.1, 0);
        this.playTone(1000, 'sine', 0.2, 0.1);
    },
    error: function() { this.playTone(150, 'sawtooth', 0.3); },       
    processing: function() { this.playTone(300, 'square', 0.05); },
    toggle: function() { this.playTone(600, 'sine', 0.05); }    
};

const BRAILLE_MAP = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
  'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
  '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚',
  ',': '⠂', ';': '⠆', ':': '⠒', '.': '⠲', '!': '⠖', '(': '⠶', ')': '⠶', '?': '⠦', '"': '⠦', "'": '⠴', '-': '⠤', ' ': ' '
};

const VOICE_COMMANDS = {
    "home": () => window.location.href = 'student_dashboard.php',
    "go back": () => window.location.href = 'student_dashboard.php',
    "stop": () => stopAllAudio(),
    "silence": () => stopAllAudio(),
    "read": () => readLastMessage(),
    "speak": () => readLastMessage(),
    "documents": () => clickTab('#docs-tab'),
    "files": () => clickTab('#docs-tab'),
    "chat": () => clickTab('#chat-tab'),
    "analyze": () => triggerFirstAnalysis(), 
    "help": () => {
        const modal = new bootstrap.Modal(document.getElementById('shortcutsModal'));
        modal.show();
    },
    "commands": () => { 
        const modal = new bootstrap.Modal(document.getElementById('voiceModal'));
        modal.show();
    },
    "voice help": () => { 
        const modal = new bootstrap.Modal(document.getElementById('voiceModal'));
        modal.show();
    },
    "contrast": () => toggleHighContrast(), 
    "bigger": () => changeFontSize(1),      
    "smaller": () => changeFontSize(-1),
    "delete mode": () => toggleDeleteMode() 
};

const SafeStorage = {
  memory: {},
  setItem: function(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { this.memory[key] = value; }
  },
  getItem: function(key) {
    try { return localStorage.getItem(key); } catch (e) { return this.memory[key] || null; }
  },
  removeItem: function(key) {
    try { localStorage.removeItem(key); } catch (e) { delete this.memory[key]; }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initWorkspace();
  initKeyboardShortcuts(); 
  initGlobalSounds(); 
  initAccessibilityControls(); 
  loadMathJax(); 
  injectChatStyles();
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});

function loadMathJax() {
    if (window.MathJax) return;
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true
        },
        svg: {
            fontCache: 'global'
        }
    };
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    document.head.appendChild(script);
}

function injectChatStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Force text wrapping inside bubbles */
        .bot-bubble, .user-bubble {
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            max-width: 85%; /* Ensure it fits nicely in the chat area */
        }
        
        /* Make MathJax scrollable if equation is too wide */
        mjx-container {
            overflow-x: auto !important;
            overflow-y: hidden;
            max-width: 100% !important;
            display: inline-grid !important; /* Helps with containment */
        }

        /* Ensure images inside chat don't overflow */
        .bot-bubble img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        
        /* Code blocks wrapping */
        .bot-bubble pre {
            white-space: pre-wrap !important;
            word-break: break-all !important;
        }
    `;
    document.head.appendChild(style);
}

function initGlobalSounds() {
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .nav-link');
        if (!target) return;
        if (target.classList.contains('btn-danger') || target.closest('.btn-danger') || target.id === 'deleteBtn') {
            SoundEffects.error();
        } else if (target.classList.contains('btn-success') || target.classList.contains('btn-primary')) {
            SoundEffects.success();
        } else if (target.classList.contains('btn-outline-warning') || target.title === 'Analyze & Summarize') {
            SoundEffects.processing();
        } else if (target.id === 'micButton' || target.id === 'speakerButton') {
            SoundEffects.toggle();
        } else {
            SoundEffects.click();
        }
    });

    document.body.addEventListener('mouseover', (e) => {
        const target = e.target.closest('button, a, .nav-link, .list-group-item');
        
        if (target) {
            SoundEffects.hover();
            clearTimeout(hoverTTSTimer);
            hoverTTSTimer = setTimeout(() => {
                let textToRead = target.getAttribute('aria-label') || target.getAttribute('title') || target.innerText;
                if (textToRead) {
                    textToRead = textToRead.trim();
                    if (textToRead.length > 0) {
                        window.speechSynthesis.cancel();
                        const u = new SpeechSynthesisUtterance(textToRead);
                        u.rate = 1.1;
                        window.speechSynthesis.speak(u);
                    }
                }
            }, 250); // delay ni tts
        }
    });
    document.body.addEventListener('mouseout', (e) => {
        const target = e.target.closest('button, a, .nav-link, .list-group-item');
        if (target) {
            clearTimeout(hoverTTSTimer);
        }
    });
    
    // 4. CANCEL Timer on Click (user already acted)
    document.body.addEventListener('mousedown', () => {
        clearTimeout(hoverTTSTimer);
    });
}


function initAccessibilityControls() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* High Contrast Styles */
        body.high-contrast { background-color: #000 !important; color: #ffff00 !important; }
        .high-contrast .card, .high-contrast .content-card, .high-contrast .sidebar, .high-contrast .navbar { 
            background-color: #000 !important; border: 2px solid #ffff00 !important; 
        }
        .high-contrast h1, .high-contrast h2, .high-contrast h3, .high-contrast h4, .high-contrast h5, .high-contrast h6, 
        .high-contrast p, .high-contrast span, .high-contrast a, .high-contrast i, .high-contrast button { 
            color: #ffff00 !important; 
        }
        .high-contrast .btn { 
            background-color: #000 !important; border: 2px solid #ffff00 !important; color: #ffff00 !important; 
        }
        .high-contrast .btn:hover { 
            background-color: #ffff00 !important; color: #000 !important; 
        }
        .high-contrast input, .high-contrast textarea { 
            background-color: #000 !important; color: #ffff00 !important; border: 2px solid #ffff00 !important; 
        }

        /* Toolbar Positioned at Top Right */
        #a11yToolbar { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            z-index: 1100; 
            background: rgba(30, 30, 30, 0.95); 
            padding: 12px 25px; 
            border-radius: 50px; 
            border: 2px solid #555; 
            display: flex; 
            gap: 15px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
        }
        .high-contrast #a11yToolbar { 
            border: 2px solid #ffff00; 
            background: #000;
        }
        #a11yToolbar button {
            font-weight: 600;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 25px;
            padding: 8px 20px;
            transition: transform 0.2s;
        }
        #a11yToolbar button:hover {
            transform: translateY(-2px);
        }
        
        /* Mobile Layout */
        @media (max-width: 768px) {
            #a11yToolbar {
                top: 10px;
                right: 50%;
                transform: translateX(50%);
                width: 90%;
                justify-content: center;
                padding: 10px;
            }
            #a11yToolbar button span { display: none; } 
            #a11yToolbar button { padding: 10px 15px; }
        }
    `;
    document.head.appendChild(style);

    const toolbar = document.createElement('div');
    toolbar.id = 'a11yToolbar';
    toolbar.innerHTML = `
        <button class="btn btn-outline-warning" onclick="toggleHighContrast()" title="Toggle High Contrast">
            <i class="bi bi-circle-half fs-5"></i> <span>Contrast</span>
        </button>
        <button class="btn btn-outline-light" onclick="changeFontSize(1)" title="Increase Font Size">
            <i class="bi bi-zoom-in fs-5"></i> <span>Bigger</span>
        </button>
        <button class="btn btn-outline-light" onclick="changeFontSize(-1)" title="Decrease Font Size">
            <i class="bi bi-zoom-out fs-5"></i> <span>Smaller</span>
        </button>
    `;
    document.body.appendChild(toolbar);

    if (SafeStorage.getItem('highContrast') === 'true') { document.body.classList.add('high-contrast'); }
    const savedSize = SafeStorage.getItem('fontSize');
    if (savedSize) { document.documentElement.style.fontSize = savedSize + 'px'; }
}

function toggleHighContrast() {
    SoundEffects.toggle();
    document.body.classList.toggle('high-contrast');
    SafeStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

function changeFontSize(delta) {
    SoundEffects.click();
    const root = document.documentElement;
    const currentSize = parseFloat(window.getComputedStyle(root).fontSize);
    const newSize = currentSize + delta;
    if (newSize >= 12 && newSize <= 28) { 
        root.style.fontSize = newSize + 'px';
        SafeStorage.setItem('fontSize', newSize);
    }
}

function initWorkspace() {
  const subjectName = getSubjectFromURL();
  const storageKey = getStorageKey();
  
  console.log("Subject:", subjectName);

  const headerTitle = document.querySelector("h2");
  if (headerTitle) {
      headerTitle.innerHTML = `<i class="bi bi-folder2-open me-2"></i>${subjectName} Workspace`;
  }

  const docList = document.getElementById("docList");
  if (docList) {
      const oldLabel = document.getElementById("storageDebugLabel");
      if(oldLabel) oldLabel.remove();
      
      const debugLabel = document.createElement("small");
      debugLabel.id = "storageDebugLabel";
      debugLabel.className = "text-muted d-block mb-2";
      docList.parentElement.insertBefore(debugLabel, docList);
      let deleteToggleBtn = document.getElementById("toggleDeleteBtn");
      if (!deleteToggleBtn) {
          deleteToggleBtn = document.createElement("button");
          deleteToggleBtn.id = "toggleDeleteBtn";
          deleteToggleBtn.className = "btn btn-outline-danger btn-sm fw-bold"; 
          deleteToggleBtn.innerHTML = '<i class="bi bi-trash-fill me-1"></i> Select file to Delete';
          deleteToggleBtn.onclick = toggleDeleteMode;

          const prevEl = docList.previousElementSibling;
          if (prevEl && ['H3','H4','H5','H6'].includes(prevEl.tagName)) {
             const wrapper = document.createElement("div");
             wrapper.className = "d-flex justify-content-between align-items-center mb-2";
             prevEl.parentNode.insertBefore(wrapper, prevEl);
             wrapper.appendChild(prevEl);
             wrapper.appendChild(deleteToggleBtn);
             
             prevEl.classList.add("mb-0"); 
          } else {
             const btnContainer = document.createElement("div");
             btnContainer.className = "d-flex justify-content-end mb-2";
             btnContainer.appendChild(deleteToggleBtn);
             docList.parentElement.insertBefore(btnContainer, docList);
          }
      }
  }

  loadDocs();
  loadChatHistory();
}

// DELETE MODE NI BAKLA
function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    const btn = document.getElementById("toggleDeleteBtn");
    
    if (isDeleteMode) { //delete
        btn.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Done';
        btn.classList.remove("btn-outline-danger");
        btn.classList.add("btn-success");
        SoundEffects.success();
    } else { //balik sa select file
        btn.innerHTML = '<i class="bi bi-trash-fill me-1"></i> Select file to Delete';
        btn.classList.remove("btn-success");
        btn.classList.add("btn-outline-danger");
        SoundEffects.click();
    }
    loadDocs();
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (!e.altKey) return;

        switch (e.key.toLowerCase()) {
            case 'r': e.preventDefault(); readLastMessage(); break;
            case 's': e.preventDefault(); stopAllAudio(); break;
            case 'm': e.preventDefault(); 
                const mic = document.getElementById('micButton');
                if (mic) mic.click();
                break;
            case 'h': e.preventDefault(); window.location.href = 'student_dashboard.php'; break;
            case '1': e.preventDefault(); clickTab('#docs-tab'); break;
            case '2': e.preventDefault(); clickTab('#chat-tab'); break;
            case 'c': e.preventDefault(); toggleHighContrast(); break; 
            case '+': e.preventDefault(); changeFontSize(1); break;    
            case '-': e.preventDefault(); changeFontSize(-1); break;   
            case 'd': e.preventDefault(); toggleDeleteMode(); break; 
            case '/': 
            case '?':
                e.preventDefault();
                const modalEl = document.getElementById('shortcutsModal');
                if (modalEl) {
                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                }
                break;
        }
    });
}

function processVoiceCommand(transcript) {
    const lowerText = transcript.toLowerCase().trim();
    
    for (const [command, action] of Object.entries(VOICE_COMMANDS)) {
        if (lowerText.includes(command)) {
            SoundEffects.success(); 
            action();
            const u = new SpeechSynthesisUtterance("Command recognized: " + command);
            u.rate = 1.2; 
            window.speechSynthesis.speak(u);
            return true; 
        }
    }
    return false; 
}

function triggerFirstAnalysis() {
    const analyzeBtn = document.querySelector('button[title="Analyze & Summarize"]');
    if (analyzeBtn) {
        analyzeBtn.click();
    } else {
        SoundEffects.error();
        const u = new SpeechSynthesisUtterance("No documents available to analyze.");
        window.speechSynthesis.speak(u);
    }
}

function clickTab(selector) {
    const tab = document.querySelector(selector);
    if (tab) {
        SoundEffects.click(); 
        const bsTab = new bootstrap.Tab(tab);
        bsTab.show();
    }
}

function stopAllAudio() {
    SoundEffects.processing(); 
    window.speechSynthesis.cancel();
    if (activeSpeechBtn) {
        resetSpeechButton(activeSpeechBtn);
        activeSpeechBtn = null;
    }
    const mainSpeaker = document.getElementById('speakerButton');
    if (mainSpeaker) {
        mainSpeaker.classList.remove("btn-danger");
        mainSpeaker.classList.add("btn-info");
        mainSpeaker.innerHTML = '<i class="bi bi-volume-up-fill fs-0.9"></i>';
    }
}

function readLastMessage() {
    clickTab('#chat-tab');
    const botMessages = document.querySelectorAll(".bot-bubble");
    if (botMessages.length === 0) {
        SoundEffects.error();
        return;
    }

    const lastMsg = botMessages[botMessages.length - 1];
    const wrapper = lastMsg.parentElement; 
    const speakerBtn = wrapper.querySelector('button');
    
    if (speakerBtn) {
        speakerBtn.click();
    } else {
        const text = lastMsg.innerText;
        const u = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
    }
}

function getSubjectFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('subject')) return decodeURIComponent(urlParams.get('subject'));
    if (typeof CURRENT_COURSE !== 'undefined' && CURRENT_COURSE) return CURRENT_COURSE;
    return "General";
}

function getStorageKey() {
    const subject = getSubjectFromURL();
    const safeKey = subject.toLowerCase().replace(/[^a-z0-9]/g, "");
    return "docs_" + safeKey;
}

function saveDocs() {
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(documents));
}

function loadDocs() {
  const key = getStorageKey();
  documents = [];
  const docList = document.getElementById("docList");
  if (docList) docList.innerHTML = ""; 

  const stored = localStorage.getItem(key);
  if (stored) {
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            documents = parsed;
            documents.forEach(doc => {
              addDocToUI(doc); 
            });
        }
    } catch (e) {
        console.error("Storage Error:", e);
        documents = [];
    }
  }
}

function addDocToUI(doc) {
  const docList = document.getElementById("docList");
  if (!docList) return;

  const fileName = doc.name;
  const hasSummary = doc.summary && doc.summary.length > 0;

  const li = document.createElement("li");
  li.className = "list-group-item bg-transparent text-light mb-4 border border-secondary rounded p-4";
  li.id = `doc-item-${fileName.replace(/[^a-z0-9]/gi, '-')}`;
  
  let contentHTML = '';
  if (isDeleteMode) {
      contentHTML = `
        <div class="d-flex flex-wrap align-items-center gap-4 w-100 position-relative">
            <!-- File Info -->
            <div class="d-flex align-items-center" style="min-width: 200px; flex: 1;">
                <i class="bi bi-file-earmark-x fs-1 text-danger me-3 flex-shrink-0"></i>
                <span class="fs-4 fw-bold text-wrap text-break text-danger" title="${fileName}">${fileName}</span>
            </div>
            
            <!-- Dynamic Confirmation Button Container (Top Right) -->
            <div id="delete-action-${fileName.replace(/[^a-z0-9]/gi, '-')}" class="position-absolute top-0 end-0 mt-n2 me-n2">
                <button class="btn btn-danger btn-lg px-4 py-2 fw-bold shadow fs-5" onclick="showDeleteConfirm(this, '${fileName}')">
                    <i class="bi bi-trash-fill"></i> DELETE
                </button>
            </div>
        </div>
      `;
  } else {
      let actionButtons = '';
      if (!hasSummary) {
          actionButtons = `
            <button class="btn btn-outline-warning btn-lg px-4 py-2 d-flex align-items-center gap-2" onclick="analyzeDocument('${fileName}', this)" title="Analyze & Summarize">
                <i class="bi bi-magic fs-3"></i> <span class="fs-5 fw-bold">Analyze</span>
            </button>
          `;
      } else {
            //action buttons ng bawat files (read, chat, braille, print)
          actionButtons = `
            <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-outline-info btn-lg px-3 py-2 d-flex align-items-center gap-2" onclick="speakSummary('${fileName}')" title="Read Aloud">
                    <i class="bi bi-megaphone-fill fs-4"></i> <span class="fs-6 fw-bold">Read</span>
                </button>
                <button class="btn btn-outline-success btn-lg px-3 py-2 d-flex align-items-center gap-2" onclick="sendSummaryToChat('${fileName}')" title="Discuss in Chat">
                    <i class="bi bi-chat-quote-fill fs-4"></i> <span class="fs-6 fw-bold">Chat</span>
                </button>
                <button class="btn btn-outline-light btn-lg px-3 py-2 d-flex align-items-center gap-2" onclick="translateToBraille('${fileName}')" title="Translate to Braille">
                    <i class="bi bi-braille fs-4"></i> <span class="fs-6 fw-bold">Braille</span>
                </button>
                <button class="btn btn-outline-secondary btn-lg px-3 py-2 d-flex align-items-center gap-2" onclick="printBraille('${fileName}')" title="Print Braille">
                    <i class="bi bi-printer-fill fs-4"></i> <span class="fs-6 fw-bold">Print</span>
                </button>
            </div>
          `;
      }

      contentHTML = `
        <div class="d-flex flex-wrap align-items-center gap-4 w-100 position-relative">
            <!-- File Info -->
            <div class="d-flex align-items-center" style="min-width: 200px; flex: 1;">
                <i class="bi bi-file-earmark-text fs-1 text-secondary me-3 flex-shrink-0"></i>
                <span class="fs-4 fw-bold text-wrap text-break" title="${fileName}">${fileName}</span>
            </div>
            
            <!-- Actions -->
            <div id="actions-${fileName.replace(/[^a-z0-9]/gi, '-')}" class="d-flex align-items-center ms-auto mt-3 mt-md-0">
                ${actionButtons}
            </div>
        </div>
      `;
  }

  li.innerHTML = contentHTML;
  docList.appendChild(li);
}

function showDeleteConfirm(btn, fileName) {
    SoundEffects.error();
    const container = btn.parentElement;
    container.innerHTML = `
        <div class="d-flex align-items-center bg-dark border border-danger rounded p-2 shadow">
            <span class="text-danger fw-bold me-3 fs-5">Sure?</span>
            <button class="btn btn-danger px-3 py-1 me-2" onclick="confirmDelete('${fileName}')">Yes</button>
            <button class="btn btn-secondary px-3 py-1" onclick="cancelDelete(this, '${fileName}')">No</button>
        </div>
    `;
}

function confirmDelete(fileName) {
    SoundEffects.click();
    removeDocument(fileName);
}

function cancelDelete(btn, fileName) {
    SoundEffects.click();
    const container = btn.parentElement.parentElement; 
    container.innerHTML = `
        <button class="btn btn-danger btn-lg px-4 py-2 fw-bold shadow fs-5" onclick="showDeleteConfirm(this, '${fileName}')">
            <i class="bi bi-trash-fill"></i> DELETE
        </button>
    `;
}

function textToBraille(text) {
    return text.toLowerCase().split('').map(char => BRAILLE_MAP[char] || char).join('');
}

function printBraille(fileName) {
    const doc = documents.find(d => d.name === fileName);
    if (!doc || !doc.summary) { SoundEffects.error(); return alert("No summary found."); }
    const brailleText = textToBraille(doc.summary);
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Braille</title>');
    printWindow.document.write('<style>body{font-family:Arial;padding:40px} h1{border-bottom:2px solid #000}.braille-box{background:#f4f4f4;padding:20px;margin-top:20px}.braille{font-size:3rem;letter-spacing:2px;font-weight:bold}.original{font-size:1.2rem;color:#555}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h1>${fileName}</h1><p><strong>Original:</strong></p><div class="original">${doc.summary}</div>`);
    printWindow.document.write(`<div class="braille-box"><div class="braille">${brailleText}</div></div>`);
    printWindow.document.write('<script>window.onload=function(){window.print();window.close();}</script></body></html>');
    printWindow.document.close();
    printWindow.focus();
}

function printChatReply(msgId) {
    SoundEffects.click();
    const msgDiv = document.getElementById(msgId);
    if (!msgDiv) return;
    const text = msgDiv.innerText;

    const brailleText = textToBraille(text);
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Braille Chat</title>');
    printWindow.document.write('<style>body{font-family:Arial;padding:40px} h1{border-bottom:2px solid #000}.braille-box{background:#f4f4f4;padding:20px;margin-top:20px}.braille{font-size:3rem;letter-spacing:2px;font-weight:bold}.original{font-size:1.2rem;color:#555}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h1>Chat Reply (Braille)</h1><p><strong>Original Text:</strong></p><div class="original">${text}</div>`);
    printWindow.document.write(`<div class="braille-box"><div class="braille">${brailleText}</div></div>`);
    printWindow.document.write('<script>window.onload=function(){window.print();window.close();}</script></body></html>');
    printWindow.document.close();
    printWindow.focus();
}

function translateToBraille(fileName) {
    const doc = documents.find(d => d.name === fileName);
    if (!doc || !doc.summary) { SoundEffects.error(); return alert("No summary found."); }

    const brailleText = textToBraille(doc.summary);
    const chatTabBtn = document.querySelector('#chat-tab');
    if(chatTabBtn) { const tab = new bootstrap.Tab(chatTabBtn); tab.show(); }

    addMessage('bot', `**Braille Translation for ${fileName}**\n\n<span style="font-size: 1.5rem; letter-spacing: 2px;">${brailleText}</span>`);
    setTimeout(() => { addMessage('bot', `(Original Text: ${doc.summary})`); }, 500);
}

async function analyzeDocument(fileName, btn) {
    SoundEffects.processing(); 
    const doc = documents.find(d => d.name === fileName);
    if (!doc) return alert("Error: Document not found.");

    const originalContent = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border" style="width: 1.5rem; height: 1.5rem;" role="status" aria-hidden="true"></span> <span class="ms-2 fs-5">Analyzing...</span>`;
    btn.disabled = true;

    try {
        const res = await fetch("gemini.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: `Analyze the following document and provide a clear, concise summary (approx 3-5 sentences). Highlight the key points.\n\nDOCUMENT TEXT:\n${doc.content}`
            })
        });
        
        const data = await res.json();
        let summaryText = "Could not generate summary.";
        
        if (data?.candidates?.length > 0) {
             summaryText = data.candidates[0].content?.parts?.[0]?.text || summaryText;
        }

        doc.summary = summaryText;
        saveDocs(); 
        loadDocs(); 
        SoundEffects.success(); 

    } catch (err) {
        console.error(err);
        SoundEffects.error(); 
        alert("Analysis failed.");
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

function speakSummary(fileName) {
    const doc = documents.find(d => d.name === fileName);
    if (!doc || !doc.summary) return alert("No summary found.");

    if (activeSpeechBtn) {
        resetSpeechButton(activeSpeechBtn);
        activeSpeechBtn = null;
    }

    window.speechSynthesis.cancel(); 
    const u = new SpeechSynthesisUtterance("Summary for " + fileName + ". " + doc.summary);
    window.speechSynthesis.speak(u);
}

function sendSummaryToChat(fileName) {
    const doc = documents.find(d => d.name === fileName);
    if (!doc || !doc.summary) return alert("No summary found.");

    const chatTabBtn = document.querySelector('#chat-tab');
    if(chatTabBtn) { const tab = new bootstrap.Tab(chatTabBtn); tab.show(); }

    addMessage('bot', `**Analysis of ${fileName}**\n\n${doc.summary}`);
    setTimeout(() => { addMessage('bot', `Summary posted. Ask me questions about it.`); }, 500);
}

async function getPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  if (typeof pdfjsLib === 'undefined') return "Error: PDF.js not loaded.";
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += `[Page ${i}]: ${pageText}\n\n`;
  }
  return fullText;
}

function getDocxText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (typeof mammoth === 'undefined') { reject("Error: Mammoth.js library not loaded."); return; }
            mammoth.extractRawText({ arrayBuffer: event.target.result })
                .then(result => resolve(result.value))
                .catch(err => reject(err));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function handleUpload(event) {
  const files = event.target.files;
  const docList = document.getElementById("docList");
  if (!docList) return;

  const statusMsg = document.createElement("li");
  statusMsg.className = "list-group-item text-warning p-4 fs-5";
  statusMsg.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Processing...`;
  docList.appendChild(statusMsg);
  SoundEffects.processing(); 

  for (let file of files) {
    documents = documents.filter(doc => doc.name !== file.name);
    
    let extractedText = "";
    try {
      if (file.type === "application/pdf") extractedText = await getPdfText(file);
      else if (file.type.includes("word") || file.name.endsWith(".docx")) extractedText = await getDocxText(file);
      else if (file.type === "text/plain") extractedText = await readTextFile(file);
      else extractedText = "File type not supported.";
    } catch (err) {
      console.error(err);
      SoundEffects.error();
      extractedText = "Error reading content.";
    }

    const newDoc = { 
      name: file.name, 
      content: `--- START OF FILE: ${file.name} ---\n${extractedText}\n--- END OF FILE ---\n`,
      summary: "" 
    };

    documents.push(newDoc);
    addDocToUI(newDoc);
  }
  
  statusMsg.remove();
  SoundEffects.success(); 
  saveDocs(); 
  loadDocs(); 
}

function removeDocument(fileName, button) {
  SoundEffects.click();
  documents = documents.filter(doc => doc.name !== fileName);
  saveDocs();
  loadDocs();
}

const inputField = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
if (inputField) {
  inputField.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });
}

function addMessage(role, text, save = true) {
  const chat = document.getElementById("chatArea");
  if (!chat) return;
  
  const div = document.createElement("div");
  div.className = (role === "user" ? "mb-3 text-end" : "mb-3 text-start") + " chat-message";

  if (role === "user") {
    div.innerHTML = `<div class="user-bubble fs-5">${text}</div>`;
  } else {
    // Process markdown first
    const html = (typeof marked !== 'undefined') ? marked.parse(text) : text;
    const msgId = "msg-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    
    div.innerHTML = `
      <div class="d-flex align-items-end">
        <div id="${msgId}" class="bot-bubble fs-5" style="word-break: break-word;">${html}</div>
        <button class="btn btn-link text-light ms-2 p-0 mb-1 flex-shrink-0" onclick="toggleChatTTS('${msgId}', this)" title="Read Aloud">
            <i class="bi bi-volume-up-fill fs-3"></i>
        </button>
        <!-- Printer Button added here -->
        <button class="btn btn-link text-light ms-1 p-0 mb-1 flex-shrink-0" onclick="printChatReply('${msgId}')" title="Print Braille">
            <i class="bi bi-printer-fill fs-3"></i>
        </button>
      </div>
    `;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  if (save) saveChatMessage(role, text);
  
  if(role === 'bot') {
      SoundEffects.success();
      if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([div]).catch((err) => console.log('MathJax error:', err));
      } else if (window.MathJax && window.MathJax.Hub) {
          window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, div]);
      }
  }
}

function toggleChatTTS(msgId, btn) {
    SoundEffects.click();
    const msgDiv = document.getElementById(msgId);
    if (!msgDiv) return;
    const text = msgDiv.innerText; 

    if (activeSpeechBtn === btn && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        resetSpeechButton(btn);
        activeSpeechBtn = null;
        return;
    }

    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    if (activeSpeechBtn) resetSpeechButton(activeSpeechBtn);

    activeSpeechBtn = btn;
    setStopButton(btn); 

    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => { resetSpeechButton(btn); activeSpeechBtn = null; };
    u.onerror = () => { resetSpeechButton(btn); activeSpeechBtn = null; };
    window.speechSynthesis.speak(u);
}

function setStopButton(btn) { btn.innerHTML = '<i class="bi bi-stop-circle-fill fs-1 text-danger"></i>'; }
function resetSpeechButton(btn) { btn.innerHTML = '<i class="bi bi-volume-up-fill fs-3"></i>'; }


//function to send message to backend and get response
async function sendMessage() {
  const input = document.getElementById("userInput");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";
  SoundEffects.click(); 

  const chatArea = document.getElementById("chatArea");
  const typingDiv = document.createElement("div");
  typingDiv.className = "mb-3 text-start chat-message"; 
  typingDiv.innerHTML = `<div class="bot-bubble typing-dots"><span>.</span><span>.</span><span>.</span></div>`;
  chatArea.appendChild(typingDiv);
  chatArea.scrollTop = chatArea.scrollHeight;

  try {
    let docContext = "No documents uploaded for this specific subject.";
    if (documents.length > 0) {
        docContext = documents.map(d => d.content).join("\n\n");
    }

    const currentSubject = getSubjectFromURL();
    const mathPrompt = `
    Role: You are a tutor for the subject "${currentSubject}".
    Context: The user has uploaded documents for this subject.
    [DOCUMENTS START]
    ${docContext}
    [DOCUMENTS END]

    User Question: ${text}

    Instructions:
    1. Answer the question based on the documents provided.
    2. If the answer involves mathematical expressions or equations, format them using LaTeX syntax.
    3. Use single dollar signs ($...$) for inline math.
    4. Use double dollar signs ($$...$$) for display block math equations.
    5. Ensure step-by-step solutions are clearly formatted using aligned environments if needed (e.g., \\begin{align*} ... \\end{align*}).
    `;

    const res = await fetch("gemini.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: mathPrompt
      })
    });

    const data = await res.json();
    typingDiv.remove();

    let botReply = "Sorry, I couldn't get a response.";
    if (data?.candidates?.length > 0) {
      botReply = data.candidates[0].content?.parts?.[0]?.text || "No text found.";
    } else if (data?.error) {
        botReply = `⚠️ Error: ${data.error}`;
        SoundEffects.error();
    }

    addMessage("bot", botReply);

  } catch (err) {
    console.error(err);
    typingDiv.remove();
    addMessage("bot", "⚠️ Error: Connection failed.");
    SoundEffects.error();
  }
}


function getChatHistoryKey() {
    const subject = getSubjectFromURL();
    const safeKey = subject.toLowerCase().replace(/[^a-z0-9]/g, "");
    return "chat_history_" + safeKey;
}

function saveChatMessage(role, text) {
  const key = getChatHistoryKey();
  const history = JSON.parse(localStorage.getItem(key)) || [];
  history.push({ role, text });
  localStorage.setItem(key, JSON.stringify(history));
}

function loadChatHistory() {
  const chat = document.getElementById("chatArea");
  if (!chat) return;
  const key = getChatHistoryKey();
  const stored = localStorage.getItem(key);
  const history = stored ? JSON.parse(stored) : [];
  chat.innerHTML = "";
  history.forEach((msg) => addMessage(msg.role, msg.text, false));
  chat.scrollTop = chat.scrollHeight;
}

function clearChatHistory() {
  const key = getChatHistoryKey();
  localStorage.removeItem(key);
  const chat = document.getElementById("chatArea");
  if (chat) { chat.innerHTML = ""; addMessage("bot", "Chat history cleared.", false); }
  SoundEffects.click();
}

if (sendButton) sendButton.addEventListener("click", sendMessage);

const micButton = document.getElementById("micButton");
let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (inputField) inputField.value = transcript;
      if (processVoiceCommand(transcript)) {
          inputField.value = ""; 
      }
  };
  recognition.onend = () => {
      if (micButton) { micButton.classList.remove("recording", "btn-success"); micButton.classList.add("btn-danger"); }
      isRecording = false;
      if (inputField && inputField.value.trim()) sendMessage();
  };
  if (micButton) {
      micButton.addEventListener("click", () => {
          SoundEffects.click();
          if (!isRecording) {
              recognition.start();
              micButton.classList.add("recording", "btn-success");
              micButton.classList.remove("btn-danger");
              isRecording = true;
          } else {
              recognition.stop();
          }
      });
  }
}
const speakerButton = document.getElementById("speakerButton");
if (speakerButton) {
  speakerButton.addEventListener("click", function () {
    SoundEffects.click();
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        this.classList.remove("btn-danger");
        this.classList.add("btn-info");
        this.innerHTML = '<i class="bi bi-volume-up-fill fs-0.9"></i>';
        return;
    }

    const botMessages = document.querySelectorAll(".bot-bubble");
    if (botMessages.length === 0) return;

    const text = botMessages[botMessages.length - 1].innerText;
    const u = new SpeechSynthesisUtterance(text);
    
    this.classList.remove("btn-info");
    this.classList.add("btn-danger");
    this.innerHTML = '<i class="bi bi-stop-circle-fill fs-0.9"></i>';

    u.onend = () => {
        this.classList.remove("btn-danger");
        this.classList.add("btn-info");
        this.innerHTML = '<i class="bi bi-volume-up-fill fs-0.9"></i>';
    };
    
    u.onerror = () => {
        this.classList.remove("btn-danger");
        this.classList.add("btn-info");
        this.innerHTML = '<i class="bi bi-volume-up-fill fs-0.9"></i>';
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  });
}
