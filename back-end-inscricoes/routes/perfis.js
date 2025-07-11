// backend-inscricoes/routes/perfis.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!db) {
      return res.status(500).json({ error: 'Serviço de banco de dados não inicializado.' });
    }
    next();
  });

  // GET all perfis
  router.get('/', async (req, res) => {
    try {
      const perfisRef = db.collection('PERFIL_ADMIN');
      const snapshot = await perfisRef.get();
      const perfis = [];
      snapshot.forEach(doc => {
        perfis.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(perfis);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      res.status(500).json({ error: 'Erro ao buscar perfis.' });
    }
  });

  // GET perfil by ID
  router.get('/:id', async (req, res) => {
    try {
      const perfilId = req.params.id;
      const perfilDoc = await db.collection('PERFIL_ADMIN').doc(perfilId).get();

      if (!perfilDoc.exists) {
        return res.status(404).json({ error: 'Perfil não encontrado.' });
      }

      res.status(200).json({ id: perfilDoc.id, ...perfilDoc.data() });
    } catch (error) {
      console.error('Erro ao buscar perfil por ID:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil.' });
    }
  });

  // POST create new perfil
  router.post('/', async (req, res) => {
    try {
      const novoPerfil = req.body;
      // Validação básica (email e senha agora são obrigatórios para um novo perfil de login)
      if (!novoPerfil.nomePerfil || !novoPerfil.email || !novoPerfil.senha) {
        return res.status(400).json({ error: 'Nome do perfil, email e senha são obrigatórios.' });
      }

      novoPerfil.dataCriacao = new Date();
      novoPerfil.permissoes = Array.isArray(novoPerfil.permissoes) ? novoPerfil.permissoes : [];

      const docRef = await db.collection('PERFIL_ADMIN').add(novoPerfil);
      res.status(201).json({ message: 'Perfil cadastrado com sucesso!', id: docRef.id, ...novoPerfil });

    } catch (error) {
      console.error('Erro ao criar perfil (POST /):', error);
      res.status(500).json({ error: 'Erro ao criar perfil.' });
    }
  });

  // PUT update perfil
  router.put('/:id', async (req, res) => {
    try {
      const perfilId = req.params.id;
      const dadosAtualizados = req.body;
      delete dadosAtualizados.dataCriacao; 

      const perfilRef = db.collection('PERFIL_ADMIN').doc(perfilId);
      const doc = await perfilRef.get();
      if (!doc.exists) {
          console.warn('AVISO: Perfil não encontrado para atualização com ID:', perfilId);
          return res.status(404).json({ error: 'Perfil não encontrado para atualização.' });
      }

      // Permissões ainda precisam ser um array
      if (dadosAtualizados.permissoes && !Array.isArray(dadosAtualizados.permissoes)) {
          dadosAtualizados.permissoes = [];
      }
      // Email e senha também podem ser atualizados
      // ATENÇÃO: Em produção, senhas seriam tratadas com hashing aqui.

      await perfilRef.update(dadosAtualizados);
      res.status(200).json({ message: 'Perfil atualizado com sucesso.', id: perfilId });

    } catch (error) {
      console.error('Erro ao atualizar perfil (PUT /:id):', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
  });

  // DELETE perfil
  router.delete('/:id', async (req, res) => {
    try {
      const perfilId = req.params.id;
      await db.collection('PERFIL_ADMIN').doc(perfilId).delete();
      res.status(200).json({ message: 'Perfil deletado com sucesso.', id: perfilId });
    } catch (error) {
      console.error('Erro ao deletar perfil (DELETE /:id):', error);
      res.status(500).json({ error: 'Erro ao deletar perfil.' });
    }
  });

  return router;
};