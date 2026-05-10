const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

const conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  input.value = '';

  const thinkingEl = appendMessage('bot', 'Gemini is thinking...');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Request failed');

    const reply = data.result ?? 'No response received.';
    thinkingEl.textContent = reply;
    conversation.push({ role: 'model', text: reply });
  } catch (err) {
    thinkingEl.textContent = `Error: ${err.message}`;
    thinkingEl.classList.add('error');
  } finally {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
