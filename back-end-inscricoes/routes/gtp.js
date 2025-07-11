// backend-inscricoes/routes/gpt.js
const express = require("express");
const OpenAI = require('openai'); // Certifique-se de que 'openai' está instalado: npm install openai
require('dotenv').config(); // Certifique-se de que 'dotenv' está instalado: npm install dotenv

const TOKEN_OPENAI = process.env.TOKEN_OPENAI; // Sua variável de ambiente para o token da OpenAI

module.exports = (db) => {
  const router = express.Router();

  // Rota POST para enviar uma pergunta à IA
  router.post('/perguntaGPT', async (req, res) => {
    try {
      const { pergunta } = req.body; // <--- Acesse a pergunta diretamente de req.body

      if (!pergunta || typeof pergunta !== 'string' || pergunta.trim() === '') {
        return res.status(400).json({ error: 'O campo "pergunta" é obrigatório e deve ser uma string não vazia no corpo da requisição.' });
      }

      // Verificação do token da API
      if (!TOKEN_OPENAI) {
        console.error("TOKEN_OPENAI não está definido no arquivo .env do backend.");
        return res.status(500).json({ error: "Erro de configuração: Token da API de IA não encontrado." });
      }

      console.log(`[BACKEND GPT] Pergunta recebida: "${pergunta}"`);

      const openai = new OpenAI({
        apiKey: TOKEN_OPENAI,
      });

      const completion = await openai.chat.completions.create({ // Use await diretamente aqui
        model: "gpt-4o-mini",
        // store: true, // <--- REMOVA ESTA LINHA: 'store' não é um parâmetro válido para completions.create
        messages: [
          { 
            "role": "user", 
            "content": "Responda de forma direta, concisa e sem explicações adicionais. Apenas a informação essencial, como se fosse uma resposta para um relatório técnico. " + pergunta 
          },
        ],
      });

      // Acessa a resposta da IA de forma mais segura
      const iaResposta = completion.choices[0]?.message?.content;

      if (!iaResposta) {
        console.warn("[BACKEND GPT] A API da OpenAI não retornou uma resposta de conteúdo.");
        return res.status(500).json({ error: "A API de IA não conseguiu gerar uma resposta." });
      }

      // --- CORREÇÃO AQUI: Garante que a resposta de sucesso seja JSON ---
      res.status(200).json({ resposta: iaResposta, geradoPor: 'ChatGPT' });
      // --- FIM CORREÇÃO ---

    } catch (error) { // Capture o erro como 'any' para acessar a propriedade 'message'
      console.error('Erro ao chamar API de IA no backend:', error);
      // --- CORREÇÃO AQUI: Garante que a resposta de erro seja JSON ---
      res.status(500).json({ error: error.message || 'Erro interno ao processar a requisição de IA.' });
      // --- FIM CORREÇÃO ---
    }
  });

  return router;
};