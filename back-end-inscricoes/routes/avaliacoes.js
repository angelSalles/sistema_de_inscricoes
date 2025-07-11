// backend-inscricoes/routes/avaliacoes.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!db) {
      return res.status(500).json({ error: 'Serviço de banco de dados não inicializado.' });
    }
    next();
  });

  // GET all avaliacoes
  router.get('/', async (req, res) => {
    try {
      const avaliacoesRef = db.collection('AVALIACAO');
      const snapshot = await avaliacoesRef.get();
      const avaliacoes = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        avaliacoes.push({
            id: doc.id,
            ...data,
            // Formata Timestamps para string ISO 8601 antes de enviar ao frontend
            dataCriacao: data.dataCriacao && typeof data.dataCriacao.toDate === 'function' ? data.dataCriacao.toDate().toISOString() : null,
            dataRespostaIA: data.dataRespostaIA && typeof data.dataRespostaIA.toDate === 'function' ? data.dataRespostaIA.toDate().toISOString() : null
        });
      });
      res.status(200).json(avaliacoes);
    } catch (error) {
      console.error('Erro ao buscar avaliações (GET /):', error);
      res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
  });

  // GET avaliacao by ID
  router.get('/:id', async (req, res) => {
    try {
      const avaliacaoId = req.params.id;
      const avaliacaoDoc = await db.collection('AVALIACAO').doc(avaliacaoId).get();

      if (!avaliacaoDoc.exists) {
        return res.status(404).json({ error: 'Avaliação não encontrada.' });
      }
      const data = avaliacaoDoc.data();
      const formattedAvaliacao = {
          id: avaliacaoDoc.id,
          ...data,
          dataCriacao: data.dataCriacao && typeof data.dataCriacao.toDate === 'function' ? data.dataCriacao.toDate().toISOString() : null,
          dataRespostaIA: data.dataRespostaIA && typeof data.dataRespostaIA.toDate === 'function' ? data.dataRespostaIA.toDate().toISOString() : null
      };
      res.status(200).json(formattedAvaliacao);
    } catch (error) {
      console.error('Erro ao buscar avaliação por ID (GET /:id):', error);
      res.status(500).json({ error: 'Erro ao buscar avaliação.' });
    }
  });

  // POST create new avaliacao
  router.post('/', async (req, res) => {
    try {
      const novaAvaliacao = req.body;
      // Validações básicas
      if (!novaAvaliacao.idCliente || !novaAvaliacao.tipoAvaliacao || !novaAvaliacao.textoAvaliacao) {
        return res.status(400).json({ error: 'Cliente, tipo e texto da avaliação são obrigatórios.' });
      }
      novaAvaliacao.dataCriacao = new Date(); // Adiciona a data de criação no backend

      const docRef = await db.collection('AVALIACAO').add(novaAvaliacao);
      res.status(201).json({ message: 'Avaliação criada com sucesso!', id: docRef.id, ...novaAvaliacao });
    } catch (error) {
      console.error('Erro ao criar avaliação (POST /):', error);
      res.status(500).json({ error: 'Erro ao criar avaliação.' });
    }
  });

  // PUT update avaliacao (usado para adicionar resposta IA, por exemplo)
  router.put('/:id', async (req, res) => {
    try {
      const avaliacaoId = req.params.id;
      const dadosAtualizados = req.body;

      // Opcional: Verifica se o documento existe antes de tentar atualizar
      const avaliacaoRef = db.collection('AVALIACAO').doc(avaliacaoId);
      const doc = await avaliacaoRef.get();
      if (!doc.exists) {
          console.warn('AVISO: Avaliação não encontrada para atualização com ID:', avaliacaoId);
          return res.status(404).json({ error: 'Avaliação não encontrada para atualização.' });
      }

      // dataCriacao não deve ser atualizada manualmente
      delete dadosAtualizados.dataCriacao;
      
      // Se a resposta da IA está sendo enviada, adiciona/atualiza a data da resposta
      if (dadosAtualizados.respostaIA !== undefined) {
          dadosAtualizados.dataRespostaIA = new Date();
      } else {
          // Se respostaIA for removida ou não estiver presente, garante que dataRespostaIA também seja removida ou não setada
          delete dadosAtualizados.dataRespostaIA; 
      }

      await avaliacaoRef.update(dadosAtualizados);
      res.status(200).json({ message: 'Avaliação atualizada com sucesso.', id: avaliacaoId });
    } catch (error) {
      console.error('Erro ao atualizar avaliação (PUT /:id):', error);
      res.status(500).json({ error: 'Erro ao atualizar avaliação.' });
    }
  });

  // DELETE avaliacao
  router.delete('/:id', async (req, res) => {
    try {
      const avaliacaoId = req.params.id;
      await db.collection('AVALIACAO').doc(avaliacaoId).delete();
      res.status(200).json({ message: 'Avaliação deletada com sucesso.', id: avaliacaoId });
    } catch (error) {
      console.error('Erro ao deletar avaliação (DELETE /:id):', error);
      res.status(500).json({ error: 'Erro ao deletar avaliação.' });
    }
  });

  return router;
};