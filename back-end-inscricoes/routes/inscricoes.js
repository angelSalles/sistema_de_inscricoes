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

  // GET all inscricoes (potentially with filters)
  // Esta rota busca a lista de inscrições, aplicando filtros opcionais e formatando a data.
  router.get('/', async (req, res) => {
    try {
      const inscricoesRef = db.collection('INSCRIÇÃO');
      let query = inscricoesRef;

      // Filtros opcionais: idCliente ou idAtividade
      if (req.query.idCliente) {
        query = query.where('idCliente', '==', req.query.idCliente);
      }
      if (req.query.idAtividade) {
        query = query.where('idAtividade', '==', req.query.idAtividade);
      }

      const snapshot = await query.get();
      const inscricoes = [];
      snapshot.forEach(doc => {
        const data = doc.data(); // data.dataInscricao aqui é um objeto Timestamp do Firebase

        inscricoes.push({
          id: doc.id,
          ...data,
          // --- CORREÇÃO: Converter dataInscricao para string ISO 8601 ---
          // Garante que o frontend receba um formato de data válido.
          dataInscricao: data.dataInscricao && typeof data.dataInscricao.toDate === 'function'
                           ? data.dataInscricao.toDate().toISOString()
                           : null
          // --- FIM DA CORREÇÃO ---
        });
      });
      res.status(200).json(inscricoes);
    } catch (error) {
      console.error('Erro ao buscar inscrições (GET /):', error);
      res.status(500).send('Erro ao buscar inscrições.');
    }
  });

  // GET inscricao by ID
  // Esta rota busca uma única inscrição pelo ID, e também formata a data.
  // IMPORTANTE: Foi corrigido para /:id e adicionada a formatação da data.
  router.get('/:id', async (req, res) => { // <--- Rota corrigida para /:id
    try {
      const inscricaoId = req.params.id; // <--- Pega o ID dos parâmetros da rota
      const inscricaoDoc = await db.collection('INSCRIÇÃO').doc(inscricaoId).get();

      if (!inscricaoDoc.exists) {
        return res.status(404).send('Inscrição não encontrada.');
      }

      const data = inscricaoDoc.data();
      const formattedInscricao = {
        id: inscricaoDoc.id,
        ...data,
        // --- NOVO: Converter dataInscricao para string ISO 8601 também para uma única busca ---
        dataInscricao: data.dataInscricao && typeof data.dataInscricao.toDate === 'function'
                         ? data.dataInscricao.toDate().toISOString()
                         : null
        // --- FIM NOVO ---
      };

      res.status(200).json(formattedInscricao);
    } catch (error) {
      console.error('Erro ao buscar inscrição por ID (GET /:id):', error);
      res.status(500).send('Erro ao buscar inscrição.');
    }
  });

  // POST create new inscricao
  router.post('/', async (req, res) => {
    try {
      const novaInscricao = req.body;

      // Validação: idCliente e idAtividade são obrigatórios
      if (!novaInscricao.idCliente || !novaInscricao.idAtividade) {
        return res.status(400).send('idCliente e idAtividade são obrigatórios para uma nova inscrição.');
      }

      // VALIDAÇÃO DE UNICIDADE: Verifica se já existe uma inscrição para este cliente e esta atividade
      const existingInscricoes = await db.collection('INSCRIÇÃO')
        .where('idCliente', '==', novaInscricao.idCliente)
        .where('idAtividade', '==', novaInscricao.idAtividade)
        .limit(1)
        .get();

      if (!existingInscricoes.empty) {
        return res.status(409).send('Este cliente já possui uma inscrição para esta atividade.'); // 409 Conflict
      }

      novaInscricao.dataInscricao = new Date(); // Adicionar dataInscricao (isso será salvo como Timestamp no Firebase)
      novaInscricao.statusInscricao = novaInscricao.statusInscricao || 'pendente'; // Status padrão

      const docRef = await db.collection('INSCRIÇÃO').add(novaInscricao);
      res.status(201).json({ id: docRef.id, ...novaInscricao, dataInscricao: novaInscricao.dataInscricao.toISOString() }); // Retorna a data formatada
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