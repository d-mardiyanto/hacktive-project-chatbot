// Conversation history sent to /api/chat
const conversation = [];

// UI Elements
const chatToggle = document.getElementById('chat-toggle');
const chatBox = document.getElementById('chat-box');
const chatClose = document.getElementById('chat-close');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const typingIndicator = document.getElementById('typing-indicator');
const suggestionButtons = document.querySelectorAll('.suggestion-btn');

// State
let isChatOpen = false;

// Chat Logic
function toggleChat() {
  isChatOpen = !isChatOpen;
  chatBox.classList.toggle('translate-y-full', !isChatOpen);
  chatBox.classList.toggle('opacity-0', !isChatOpen);
  chatBox.classList.toggle('pointer-events-none', !isChatOpen);
}

function addMessage(text, isUser = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;
  
  const inner = document.createElement('div');
  inner.className = `max-w-[80%] px-4 py-2 ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`;
  inner.textContent = text;
  
  msgDiv.appendChild(inner);
  chatMessages.appendChild(msgDiv);
  
  // Auto scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSendMessage(text) {
  const message = text.trim();
  if (!message) return;

  addMessage(message, true);
  conversation.push({ role: 'user', text: message });
  chatInput.value = '';

  // Show typing indicator
  typingIndicator.classList.remove('hidden');
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');

    const aiText = data.result || "I'm drawing a blank! Can you say that again?";
    typingIndicator.classList.add('hidden');
    addMessage(aiText, false);
    conversation.push({ role: 'model', text: aiText });
  } catch (error) {
    console.error('Chat Error:', error);
    typingIndicator.classList.add('hidden');
    addMessage('Oops! Something went wrong in my circuits. Try again?');
  }
}

// Event Listeners
chatToggle.addEventListener('click', toggleChat);
chatClose.addEventListener('click', toggleChat);

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleSendMessage(chatInput.value);
});

suggestionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    handleSendMessage(btn.textContent);
  });
});

// Scroll Animations
function handleReveal() {
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(el => {
    const windowHeight = window.innerHeight;
    const revealTop = el.getBoundingClientRect().top;
    const revealPoint = 150;
    
    if (revealTop < windowHeight - revealPoint) {
      el.classList.add('active');
    }
  });
}

window.addEventListener('scroll', handleReveal);
window.addEventListener('load', handleReveal);

// Mascot Floating Animation (handled by CSS, but can add JS interactive bits here if needed)
console.log("ChibiAI Initialized 🤖✨");
