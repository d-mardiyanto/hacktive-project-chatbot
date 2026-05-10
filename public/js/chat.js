document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chat-toggle');
    const chatMinimize = document.getElementById('chat-minimize');
    const chatContainer = document.getElementById('chat-container');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    let conversation = [];

    const toggleChat = () => {
        chatContainer.classList.toggle('translate-y-full');
        chatContainer.classList.toggle('opacity-0');
        chatContainer.classList.toggle('pointer-events-none');
    };

    chatToggle.addEventListener('click', toggleChat);
    chatMinimize.addEventListener('click', toggleChat);

    const appendMessage = (role, text) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-2 ${role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`;

        const avatarSrc = role === 'user'
            ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
            : 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lumi&backgroundColor=b6e3f4';

        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-white rounded-full p-1 shadow-sm flex-shrink-0">
                <img src="${avatarSrc}" alt="${role}">
            </div>
            <div class="${role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white rounded-tl-none'} p-3 rounded-2xl shadow-sm text-sm max-w-[80%]">
                ${text}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTypingAnimation = () => {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex items-start space-x-2';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-white rounded-full p-1 shadow-sm flex-shrink-0">
                <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lumi&backgroundColor=b6e3f4" alt="Lumi">
            </div>
            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm flex space-x-1">
                <div class="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        appendMessage('user', text);
        chatInput.value = '';
        conversation.push({ role: 'user', text: text });

        const typingIndicator = showTypingAnimation();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation })
            });

            const data = await response.json();
            typingIndicator.remove();

            if (data.result) {
                appendMessage('model', data.result);
                conversation.push({ role: 'model', text: data.result });
            } else {
                throw new Error(data.message || 'Failed to get response');
            }
        } catch (error) {
            typingIndicator.remove();
            appendMessage('model', "Oops! I'm having a little trouble connecting right now. 🧊 Please try again later!");
            console.error('Chat error:', error);
        }
    };

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(chatInput.value);
    });

    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sendMessage(btn.textContent);
        });
    });
});
