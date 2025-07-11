// backend-inscricoes/routes/responsaveis.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!db) {
      // Garante que o erro de DB não inicializado também seja JSON
      return res.status(500).json({ error: 'Serviço de banco de dados não inicializado.' });
    }
    next();
  });

  // GET all responsaveis
  router.get('/', async (req, res) => {
    try {
      const responsaveisRef = db.collection('RESPONSAVEL');
      const snapshot = await responsaveisRef.get();
      const responsaveis = [];
      snapshot.forEach(doc => {
        responsaveis.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(responsaveis);
    } catch (error) {
      console.error('Erro ao buscar responsáveis (GET /):', error);
      res.status(500).json({ error: 'Erro ao buscar responsáveis.' });
    }
  });

  // GET responsavel by ID
  router.get('/:id', async (req, res) => {
    try {
      const responsavelId = req.params.id;
      const responsavelDoc = await db.collection('RESPONSAVEL').doc(responsavelId).get();

      if (!responsavelDoc.exists) {
        return res.status(404).json({ error: 'Responsável não encontrado.' });
      }

      res.status(200).json({ id: responsavelDoc.id, ...responsavelDoc.data() });
    } catch (error) {
      console.error('Erro ao buscar responsável por ID (GET /:id):', error);
      res.status(500).json({ error: 'Erro ao buscar responsável.' });
    }
  });

  // POST create new responsavel
  router.post('/', async (req, res) => {
    try {
      const novoResponsavel = req.body;
      // Validação básica
      if (!novoResponsavel.nomeResponsavel || !novoResponsavel.matricula) {
          return res.status(400).json({ error: 'Nome do responsável e matrícula são obrigatórios.' });
      }

      novoResponsavel.dataCriacao = new Date(); // Adicionar dataCriacao
      const docRef = await db.collection('RESPONSAVEL').add(novoResponsavel);

      // --- CORREÇÃO AQUI: Garante resposta JSON ---
      res.status(201).json({ 
        message: 'Responsável cadastrado com sucesso!', 
        id: docRef.id, 
        ...novoResponsavel 
      });
      // --- FIM CORREÇÃO ---

    } catch (error) {
      console.error('Erro ao criar responsável (POST /):', error);
      res.status(500).json({ error: 'Erro ao criar responsável.' });
    }
  });

  // PUT update responsavel
  router.put('/:id', async (req, res) => {
    try {
      const responsavelId = req.params.id;
      const dadosAtualizados = req.body;
      delete dadosAtualizados.dataCriacao; // Não atualizar data de criação manualmente

      // Opcional: Verifica se o documento existe antes de tentar atualizar
      const responsavelRef = db.collection('RESPONSAVEL').doc(responsavelId);
      const doc = await responsavelRef.get();
      if (!doc.exists) {
          console.warn('AVISO: Responsável não encontrado para atualização com ID:', responsavelId);
          return res.status(404).json({ error: 'Responsável não encontrado para atualização.' });
      }

      await responsavelRef.update(dadosAtualizados);

      // --- CORREÇÃO AQUI: Garante resposta JSON ---
      res.status(200).json({ message: 'Responsável atualizado com sucesso.', id: responsavelId });
      // --- FIM CORREÇÃO ---

    } catch (error) {
      console.error('Erro ao atualizar responsável (PUT /:id):', error);
      res.status(500).json({ error: 'Erro ao atualizar responsável.' });
    }
  });

  // DELETE responsavel
  router.delete('/:id', async (req, res) => {
    try {
      const responsavelId = req.params.id;
      await db.collection('RESPONSAVEL').doc(responsavelId).delete();

      // --- CORREÇÃO AQUI: Garante resposta JSON ---
      res.status(200).json({ message: 'Responsável deletado com sucesso.', id: responsavelId });
      // --- FIM CORREÇÃO ---

    } catch (error) {
      console.error('Erro ao deletar responsável (DELETE /:id):', error);
      res.status(500).json({ error: 'Erro ao deletar responsável.' });
    }
  });

  return router;
};