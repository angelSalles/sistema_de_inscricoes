// backend-inscricoes/routes/responsaveis.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!db) {
      return res.status(500).send('Serviço de banco de dados não inicializado.');
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
      console.error('Erro ao buscar responsáveis:', error);
      res.status(500).send('Erro ao buscar responsáveis.');
    }
  });

  // GET responsavel by ID
  router.get('/:id', async (req, res) => {
    try {
      const responsavelId = req.params.id;
      const responsavelDoc = await db.collection('RESPONSAVEL').doc(responsavelId).get();

      if (!responsavelDoc.exists) {
        return res.status(404).send('Responsável não encontrado.');
      }

      res.status(200).json({ id: responsavelDoc.id, ...responsavelDoc.data() });
    } catch (error) {
      console.error('Erro ao buscar responsável por ID:', error);
      res.status(500).send('Erro ao buscar responsável.');
    }
  });

  // POST create new responsavel
  router.post('/', async (req, res) => {
    try {
      const novoResponsavel = req.body;
      novoResponsavel.dataCriacao = new Date(); // Adicionar dataCriacao
      const docRef = await db.collection('RESPONSAVEL').add(novoResponsavel);
      res.status(201).json({ id: docRef.id, ...novoResponsavel });
    } catch (error) {
      console.error('Erro ao criar responsável:', error);
      res.status(500).send('Erro ao criar responsável.');
    }
  });

  // PUT update responsavel
  router.put('/:id', async (req, res) => {
    try {
      const responsavelId = req.params.id;
      const dadosAtualizados = req.body;
      delete dadosAtualizados.dataCriacao; // Não atualizar data de criação manualmente
      await db.collection('RESPONSAVEL').doc(responsavelId).update(dadosAtualizados);
      res.status(200).send('Responsável atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar responsável:', error);
      res.status(500).send('Erro ao atualizar responsável.');
    }
  });

  // DELETE responsavel
  router.delete('/:id', async (req, res) => {
    try {
      const responsavelId = req.params.id;
      await db.collection('RESPONSAVEL').doc(responsavelId).delete();
      res.status(200).send('Responsável deletado com sucesso.');
    } catch (error) {
      console.error('Erro ao deletar responsável:', error);
      res.status(500).send('Erro ao deletar responsável.');
    }
  });

  return router;
};