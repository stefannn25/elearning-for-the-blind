let documents = [];
let summaries = [];

function handleUpload(event) {
  const files = event.target.files;
  const docList = document.getElementById("docList");

  for (let file of files) {
    // Add to memory
    documents.push({ name: file.name, content: "Dummy text for " + file.name });

    // Add to UI
    const li = document.createElement("li");
    li.className = "list-group-item bg-transparent text-light d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span><i class="bi bi-file-earmark-text me-2"></i> ${file.name}</span>
      <button class="btn btn-sm btn-outline-danger" onclick="removeDocument('${file.name}', this)">
        <i class="bi bi-trash"></i>
      </button>
    `;
    docList.appendChild(li);
  }
}
function removeDocument(fileName, button) {
  // Remove from array
  documents = documents.filter(doc => doc.name !== fileName);
  // Remove from UI
  button.closest("li").remove();
}

const inputField = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");

inputField.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();   // stops newline
    sendButton.click();   // triggers send
  }
  // Shift+Enter = allow newline
});



async function generateSummary() {
  const summaryOutput = document.getElementById("summaryOutput");
  summaryOutput.innerText = "Generating summary...";

  try {
    const docContext = documents.map(d => d.content).join("\n");

    const res = await fetch("gemini.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Summarize the following documents clearly and concisely:\n\n" + docContext
      })
    });

    const data = await res.json();
    console.log("Summary API response:", data);

    let summary = "No summary available.";

    if (data?.candidates?.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content?.parts?.[0]?.text) {
        summary = candidate.content.parts[0].text;
      } else if (candidate.content?.parts) {
        summary = candidate.content.parts.map(p => p.text || "").join(" ");
      } else if (candidate.output) {
        summary = candidate.output;
      }
    }

    summaryOutput.innerText = summary;

  } catch (err) {
    console.error("Error:", err);
    summaryOutput.innerText = "⚠️ Error: Could not generate summary.";
  }
}



async function fetchFiles() {
  const res = await fetch('?api=files');
  const json = await res.json();
  const files = json.files || [];

  const fileList = document.getElementById('fileList');
  const notebookList = document.getElementById('notebookList');
  const contextSelect = document.getElementById('contextFile');
  fileList.innerHTML = '';
  notebookList.innerHTML = '';
  contextSelect.innerHTML = '<option value="">(No file selected — global)</option>';

  files.forEach(f => {
    const li = document.createElement('li');
    li.innerHTML = `<div class=\"d-flex justify-content-between align-items-center\"><a href=\"uploads/${encodeURIComponent(f)}\" target=\"_blank\">${f}</a><small class=\"text-muted\"> </small></div>`;
    fileList.appendChild(li);

    const nb = document.createElement('li');
    nb.innerHTML = `<a href=\"#\" data-file=\"${f}\">${f}</a>`;
    nb.querySelector('a').addEventListener('click', (e)=>{
      e.preventDefault();
      document.getElementById('currentNotebook').textContent = f;
      document.getElementById('previewArea').textContent = `Selected: ${f}`;
    });
    notebookList.appendChild(nb);

    const opt = document.createElement('option');
    opt.value = f; opt.textContent = f;
    contextSelect.appendChild(opt);
  });
}

fetchFiles();

document.getElementById('refreshFiles').addEventListener('click', fetchFiles);

function addMessage(role, text, save = true) {
  const chat = document.getElementById("chatArea");
  const div = document.createElement("div");
  div.className = (role === "user" ? "mb-3 text-end" : "mb-3 text-start") + " chat-message";

  if (role === "user") {
    div.innerHTML = `<div class="user-bubble">${text}</div>`;
  } else {
    div.innerHTML = `<div class="bot-bubble">${marked.parse(text)}</div>`;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  // 🔹 Save message to localStorage only if new
  if (save) saveChatMessage(role, text);

  return div.querySelector(role === "user" ? ".user-bubble" : ".bot-bubble");
}




function showTyping() {
  return addMessage("bot", "<span class='typing-dots'><span>.</span><span>.</span><span>.</span></span>");
}

document.getElementById("askBtn").addEventListener("click", async () => {
  const question = document.getElementById("question").value.trim();
  const file = document.getElementById("contextFile").value;
  if (!question) return;

  addMessage("user", question);
  document.getElementById("question").value = "";

  // Show typing dots
  const typingDiv = showTyping();

  const form = new FormData();
  form.append("question", question);
  form.append("file", file);

  const res = await fetch("?api=ask", { method: "POST", body: form });
  const data = await res.json();

  // Replace typing dots with actual answer
  typingDiv.innerHTML = `<div class="d-inline-block px-3 py-2 rounded bg-light text-dark">${data.answer || "(no response)"}</div>`;
});

async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  // Typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.className = "bot-bubble typing-dots";
  typingDiv.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  document.getElementById("chatArea").appendChild(typingDiv);

  try {
    const docContext = documents.map(d => d.content).join("\n");

    const res = await fetch("gemini.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Documents:\n" + docContext + "\n\nUser: " + text
      })
    });

    const data = await res.json();
    console.log("Chat API response:", data);

    typingDiv.remove();

    let botReply = "No response.";

    if (data?.candidates?.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content?.parts?.[0]?.text) {
        botReply = candidate.content.parts[0].text;
      } else if (candidate.content?.parts) {
        botReply = candidate.content.parts.map(p => p.text || "").join(" ");
      } else if (candidate.output) {
        botReply = candidate.output;
      }
    }

    addMessage("bot", botReply);

  } catch (err) {
    console.error("Error:", err);
    typingDiv.remove();
    addMessage("bot", "⚠️ Error: Could not connect to AI.");
  }
}


function addBotMessage(message) {
  const chatBox = document.getElementById("chatBox");

  const botBubble = document.createElement("div");
  botBubble.className = "bot-bubble";

  // Convert markdown → HTML
  botBubble.innerHTML = marked.parse(message);

  chatBox.appendChild(botBubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}



// ========== CHAT HISTORY (localStorage) ==========

function saveChatMessage(role, text) {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ role, text });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function loadChatHistory() {
  const chat = document.getElementById("chatArea");
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

  chat.innerHTML = "";

  // Fade-in each old message with a small delay for effect
  history.forEach((msg, i) => {
    setTimeout(() => {
      addMessage(msg.role, msg.text, false); // no save to localStorage
    }, i * 100);
  });

  chat.scrollTop = chat.scrollHeight;
}

function clearChatHistory() {
  localStorage.removeItem("chatHistory");
  document.getElementById("chatArea").innerHTML = "workspace.php";
}

async function analyzeDocumentsNLP() {
  const docContext = documents.map(d => d.content).join("\n");
  if (!docContext) return alert("No documents uploaded.");

  const outputArea = document.getElementById("summaryOutput");
  outputArea.innerText = "Analyzing documents with NLP...";

  try {
    const res = await fetch("gemini.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nlp_analysis: true,
        text: docContext
      })
    });

    const data = await res.json();
    console.log("NLP Analysis:", data);

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No NLP output.";

    // Try to format JSON output nicely
    try {
      const parsed = JSON.parse(text);
      text = `
🧩 **Key Phrases:** ${parsed.key_phrases.join(", ")}
🏷️ **Named Entities:** ${parsed.named_entities.join(", ")}
📊 **Sentiment:** ${parsed.sentiment}
🧠 **Topics:** ${parsed.topics.join(", ")}
📝 **Summary:** ${parsed.summary}
      `;
    } catch { /* fallback if not structured */ }

    outputArea.innerHTML = marked.parse(text);
  } catch (err) {
    console.error("Error:", err);
    outputArea.innerText = "⚠️ Error: NLP analysis failed.";
  }
}


document.getElementById('clearBtn').addEventListener('click', ()=>{
  document.getElementById('question').value = '';
  document.getElementById('answerContainer').style.display = 'none';
});

// Optional: intercept the upload form and refresh file list after submit
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', (e)=>{
  // Let normal POST happen; after a short delay refresh the list
  setTimeout(fetchFiles, 700);
});

document.getElementById("toggleSidebar").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("collapsed");
});


document.getElementById("micButton").addEventListener("click", function () {
  if (!recognition) {
    alert("Speech recognition not supported in your browser.");
    return;
  }

  if (!isRecording) {
    recognition.start();
    this.classList.remove("btn-danger");
    this.classList.add("btn-success", "recording");
    isRecording = true;
  } else {
    recognition.stop();
    this.classList.remove("btn-success", "recording");
    this.classList.add("btn-danger");
    isRecording = false;
  }
});



// 🎙️ Voice Recognition (Speech-to-Text)
let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;

  let finalTranscript = '';

  recognition.onstart = () => {
    console.log("🎤 Listening...");
    document.getElementById("micButton").classList.add("recording");
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Show live text as user speaks
    const input = document.getElementById("userInput");
    input.value = finalTranscript + interimTranscript;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = () => {
    console.log("🎤 Stopped listening");
    document.getElementById("micButton").classList.remove("recording");
    isRecording = false;

    // Auto-send when user finishes talking
    const input = document.getElementById("userInput");
    if (input.value.trim()) {
      sendMessage();
    }
  };
} else {
  console.warn("⚠️ Speech recognition not supported in this browser.");
}

// 🎚️ Mic Button Toggle
document.getElementById("micButton").addEventListener("click", function () {
  if (!recognition) {
    alert("Speech recognition not supported in your browser. Try Chrome or Edge.");
    return;
  }

  if (!isRecording) {
    recognition.start();
    this.classList.remove("btn-danger");
    this.classList.add("btn-success");
    isRecording = true;
  } else {
    recognition.stop();
    this.classList.remove("btn-success");
    this.classList.add("btn-danger");
    isRecording = false;
  }
});

// 🔊 Text-to-Speech (Speaker)
document.getElementById("speakerButton").addEventListener("click", function () {
  const botMessages = document.querySelectorAll(".bot-bubble");
  if (botMessages.length === 0) return;

  const lastMessage = botMessages[botMessages.length - 1].innerText;
  const utterance = new SpeechSynthesisUtterance(lastMessage);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
});


document.addEventListener("DOMContentLoaded", () => {
  loadChatHistory();
});