const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const newChatBtn = document.getElementById('new-chat-btn');
const sessionHistory = document.getElementById('session-history');
const historyEmpty = document.getElementById('history-empty');
const API_URL = 'http://localhost:3000/api/chat';

let sessions = [];
let activeSessionIndex = 0;

function createSession(name) {
  return {
    id: Date.now() + Math.random(),
    name,
    messages: [
      { sender: 'bot', text: 'Selamat datang! Mimin Aridev siap membantu. Ketik pertanyaan Anda untuk memulai sesi baru.' },
    ],
  };
}

function setActiveSession(index) {
  activeSessionIndex = index;
  renderMessages();
  renderHistory();
}

function renderHistory() {
  sessionHistory.innerHTML = '';

  sessions.forEach((session, index) => {
    const item = document.createElement('li');
    item.className = 'session-item' + (index === activeSessionIndex ? ' active' : '');
    item.innerHTML = `<strong>${session.name}</strong><span>${Math.max(0, session.messages.length - 1)} pesan</span>`;
    item.addEventListener('click', () => setActiveSession(index));
    sessionHistory.appendChild(item);
  });

  historyEmpty.style.display = sessions.length ? 'none' : 'block';
}

function renderMessages() {
  chatBox.innerHTML = '';
  const session = sessions[activeSessionIndex];
  session.messages.forEach((message) => appendMessage(message.sender, message.text, false));
}

function addMessageToActiveSession(sender, text) {
  sessions[activeSessionIndex].messages.push({ sender, text });
}

function startNewChat() {
  const newSession = createSession(`Sesi ${sessions.length + 1}`);
  sessions.push(newSession);
  setActiveSession(sessions.length - 1);
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessageToActiveSession('user', userMessage);
  appendMessage('user', userMessage, true);
  input.value = '';
  input.disabled = true;
  form.querySelector('button').disabled = true;
  addMessageToActiveSession('bot', 'Mimin Aridev sedang memikirkan jawaban terbaik...');
  appendMessage('bot', 'Mimin Aridev sedang memikirkan jawaban terbaik...', true);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userMessage }),
    });

    const data = await response.json();

    const lastBotMessage = chatBox.lastElementChild;
    if (lastBotMessage && lastBotMessage.classList.contains('bot')) {
      lastBotMessage.remove();
      sessions[activeSessionIndex].messages.pop();
    }

    if (!response.ok) {
      throw new Error(data.error || 'Gagal mendapatkan respons dari server');
    }

    const botText = data.output_text || 'Mimin Aridev belum mendapatkan jawaban.';
    addMessageToActiveSession('bot', botText);
    appendMessage('bot', botText, true);
  } catch (error) {
    const lastBotMessage = chatBox.lastElementChild;
    if (lastBotMessage && lastBotMessage.classList.contains('bot')) {
      lastBotMessage.remove();
      sessions[activeSessionIndex].messages.pop();
    }
    const errorMessage = `Maaf, terjadi kesalahan: ${error.message}`;
    addMessageToActiveSession('bot', errorMessage);
    appendMessage('bot', errorMessage, true);
  } finally {
    input.disabled = false;
    form.querySelector('button').disabled = false;
    input.focus();
    renderHistory();
  }
});

newChatBtn.addEventListener('click', function () {
  startNewChat();
  input.focus();
});

function cleanMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#+\s?/gm, '')
    .replace(/[-*+]\s+/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = cleanMarkdown(text);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function cleanMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#+\s?/gm, '')
    .replace(/[-*+]\s+/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = cleanMarkdown(text);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
