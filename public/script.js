// public/script.js (Lógica do Frontend)

document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Função para adicionar uma mensagem na tela
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Função para obter a resposta do BOT (agora via API)
    async function getBotResponse(userText) {
        try {
            // Envia a mensagem do usuário para o nosso servidor backend
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText }),
            });

            if (!response.ok) {
                throw new Error('Falha na comunicação com o servidor.');
            }

            const data = await response.json();
            return data.reply; // Retorna a resposta que veio da IA

        } catch (error) {
            console.error('Erro:', error);
            return 'Desculpe, estou com problemas para me conectar. Tente novamente mais tarde.';
        }
    }

    // Função principal para lidar com o envio de mensagens
    async function handleSendMessage() {
        const messageText = userInput.value.trim();

        if (messageText !== '') {
            addMessage(messageText, 'user');
            userInput.value = '';

            // Adiciona uma mensagem de "digitando..." para o usuário
            addMessage('Digitando...', 'bot-typing'); // Classe temporária

            const botResponse = await getBotResponse(messageText);
            
            // Remove a mensagem "digitando..."
            const typingMessage = document.querySelector('.bot-typing');
            if (typingMessage) {
                typingMessage.remove();
            }

            // Adiciona a resposta final do bot
            addMessage(botResponse, 'bot');
        }
    }

    // Event listeners
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Mensagem de boas-vindas
    addMessage('Olá! Sou um assistente virtual conectado à IA Gemini. Como posso ajudar?', 'bot');
});