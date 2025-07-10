
// Gera um ID único para a sessão do usuário
const sessionId = Math.random().toString(36).substring(2, 15);

function formatDateTime() {
  const options = {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  return new Date().toLocaleString('pt-BR', options);
}

function displayDateTime() {
  document.getElementById('datetime').innerText = formatDateTime();
}

function addMessageToChat(sender, message) {
  const chatbox = document.getElementById('chatbox');
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'Usuário' ? 'user' : 'bot';
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;

  addMessageToChat('Usuário', message);
  input.value = '';

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message })
    });
    const data = await response.json();
    if (data.reply) {
      addMessageToChat('Chatbot Pajubá', data.reply);
      displayDateTime();
    } else {
      addMessageToChat('Chatbot Pajubá', 'Ô mona, algo deu errado no babado! Tenta de novo.');
    }
  } catch (error) {
    addMessageToChat('Chatbot Pajubá', 'Ô mona, deu um kaô no sistema! Tenta de novo, vai!');
    console.error('Erro no frontend:', error);
  }
}

document.getElementById('userInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

window.onload = displayDateTime;