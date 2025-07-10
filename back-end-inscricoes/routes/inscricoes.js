// backend-inscricoes/routes/inscricoes.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!db) {
      return res.status(500).send('Serviço de banco de dados não inicializado.');
    }
    next();
  });

  // GET all inscricoes (potentially with filters, e.g., by idCliente or idAtividade)
  router.get('/', async (req, res) => {
    try {
      const inscricoesRef = db.collection('INSCRIÇÃO');
      let query = inscricoesRef;

      // Adicionar filtros opcionais (ex: ?idCliente=ID_DO_CLIENTE)
      if (req.query.idCliente) {
        query = query.where('idCliente', '==', req.query.idCliente);
      }
      if (req.query.idAtividade) {
        query = query.where('idAtividade', '==', req.query.idAtividade);
      }
      // Você pode adicionar mais filtros aqui se necessário, como por statusInscricao

      const snapshot = await query.get();
      const inscricoes = [];
      snapshot.forEach(doc => {
        inscricoes.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(inscricoes);
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
      res.status(500).send('Erro ao buscar inscrições.');
    }
  });

  // GET inscricao by ID
  router.get('/:id', async (req, res) => {
    try {
      const inscricaoId = req.params.id;
      const inscricaoDoc = await db.collection('INSCRIÇÃO').doc(inscricaoId).get();

      if (!inscricaoDoc.exists) {
        return res.status(404).send('Inscrição não encontrada.');
      }

      res.status(200).json({ id: inscricaoDoc.id, ...inscricaoDoc.data() });
    } catch (error) {
      console.error('Erro ao buscar inscrição por ID:', error);
      res.status(500).send('Erro ao buscar inscrição.');
    }
  });

  // POST create new inscricao
  router.post('/', async (req, res) => {
    try {
      const novaInscricao = req.body;
      // Validação básica: verificar se idCliente e idAtividade foram fornecidos
      if (!novaInscricao.idCliente || !novaInscricao.idAtividade) {
        return res.status(400).send('idCliente e idAtividade são obrigatórios para uma nova inscrição.');
      }

      novaInscricao.dataInscricao = new Date(); // Adicionar dataInscricao
      novaInscricao.statusInscricao = novaInscricao.statusInscricao || 'pendente'; // Status padrão

      const docRef = await db.collection('INSCRIÇÃO').add(novaInscricao);
      res.status(201).json({ id: docRef.id, ...novaInscricao });
    } catch (error) {
      console.error('Erro ao criar inscrição:', error);
      res.status(500).send('Erro ao criar inscrição.');
    }
  });

  // PUT update inscricao
  router.put('/:id', async (req, res) => {
    try {
      const inscricaoId = req.params.id;
      const dadosAtualizados = req.body;
      delete dadosAtualizados.dataInscricao; // Não atualizar data de inscrição manualmente
      await db.collection('INSCRIÇÃO').doc(inscricaoId).update(dadosAtualizados);
      res.status(200).send('Inscrição atualizada com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar inscrição:', error);
      res.status(500).send('Erro ao atualizar inscrição.');
    }
  });

  // DELETE inscricao
  router.delete('/:id', async (req, res) => {
    try {
      const inscricaoId = req.params.id;
      await db.collection('INSCRIÇÃO').doc(inscricaoId).delete();
      res.status(200).send('Inscrição deletada com sucesso.');
    } catch (error) {
      console.error('Erro ao deletar inscrição:', error);
      res.status(500).send('Erro ao deletar inscrição.');
    }
  });

  return router;
};