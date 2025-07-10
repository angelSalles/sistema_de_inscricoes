// backend-inscricoes/routes/atividades.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!db) {
      return res.status(500).send('Serviço de banco de dados não inicializado.');
    }
    next();
  });

  // GET all atividades
  router.get('/', async (req, res) => {
    try {
      const atividadesRef = db.collection('ATIVIDADE');
      const snapshot = await atividadesRef.get();
      const atividades = [];
      snapshot.forEach(doc => {
        atividades.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(atividades);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      res.status(500).send('Erro ao buscar atividades.');
    }
  });

  // GET atividade by ID
  router.get('/:id', async (req, res) => {
    try {
      const atividadeId = req.params.id;
      const atividadeDoc = await db.collection('ATIVIDADE').doc(atividadeId).get();

      if (!atividadeDoc.exists) {
        return res.status(404).send('Atividade não encontrada.');
      }

      res.status(200).json({ id: atividadeDoc.id, ...atividadeDoc.data() });
    } catch (error) {
      console.error('Erro ao buscar atividade por ID:', error);
      res.status(500).send('Erro ao buscar atividade.');
    }
  });

  // POST create new atividade
  router.post('/', async (req, res) => {
    try {
      const novaAtividade = req.body;
      novaAtividade.dataCriacao = new Date(); // Adicionar dataCriacao
      const docRef = await db.collection('ATIVIDADE').add(novaAtividade);
      res.status(201).json({ id: docRef.id, ...novaAtividade });
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      res.status(500).send('Erro ao criar atividade.');
    }
  });

  // PUT update atividade
  router.put('/:id', async (req, res) => {
    try {
      const atividadeId = req.params.id;
      const dadosAtualizados = req.body;
      delete dadosAtualizados.dataCriacao; // Não atualizar data de criação manualmente
      await db.collection('ATIVIDADE').doc(atividadeId).update(dadosAtualizados);
      res.status(200).send('Atividade atualizada com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      res.status(500).send('Erro ao atualizar atividade.');
    }
  });

  // DELETE atividade
  router.delete('/:id', async (req, res) => {
    try {
      const atividadeId = req.params.id;
      await db.collection('ATIVIDADE').doc(atividadeId).delete();
      res.status(200).send('Atividade deletada com sucesso.');
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      res.status(500).send('Erro ao deletar atividade.');
    }
  });

  return router;
};