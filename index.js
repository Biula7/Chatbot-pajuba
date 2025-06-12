// index.js (O SERVIDOR)

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Serve os arquivos da pasta 'public'
app.use(express.static('public'));

// Endpoint da API para o chat
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const botReply = response.text();
        res.json({ reply: botReply });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar mensagem.' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});