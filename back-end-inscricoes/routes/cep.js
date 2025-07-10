// backend-inscricoes/routes/cep.js
const express = require('express');
const fetch = require('node-fetch'); // Importa o node-fetch

module.exports = () => { // Não precisamos do 'db' aqui, pois não interagimos com o Firebase
  const router = express.Router();

  // Rota GET para buscar endereço por CEP
  // Ex: /cep/69000000
  router.get('/:cep', async (req, res) => {
    const cep = req.params.cep.replace(/\D/g, ''); // Remove caracteres não numéricos do CEP

    if (cep.length !== 8) {
      return res.status(400).json({ error: 'CEP inválido. Deve conter 8 dígitos numéricos.' });
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        return res.status(404).json({ error: 'CEP não encontrado.' });
      }

      // Retorna apenas os campos relevantes para o frontend
      const endereco = {
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade, // ViaCEP usa 'localidade' para cidade
        estado: data.uf,         // ViaCEP usa 'uf' para estado
        // O número e o complemento não são retornados pela API de CEP
        // Eles precisarão ser preenchidos manualmente pelo usuário
      };

      res.status(200).json(endereco);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      res.status(500).json({ error: 'Erro interno ao buscar CEP.' });
    }
  });

  return router;
};