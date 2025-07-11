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
        // Retorna apenas os campos desejados, ignorando descricao e permissoes se existirem em docs antigos
        const data = doc.data();
        perfis.push({
          id: doc.id,
          nomePerfil: data.nomePerfil,
          email: data.email,
          senha: data.senha, // Atenção: em produção, nunca retorne a senha assim!
          dataCriacao: data.dataCriacao && typeof data.dataCriacao.toDate === 'function' ? data.dataCriacao.toDate().toISOString() : null
        });
      });
      res.status(200).json(perfis);
    } catch (error) {
      console.error('Erro ao buscar perfis (GET /):', error);
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

      const data = perfilDoc.data();
      // Retorna apenas os campos desejados, ignorando descricao e permissoes
      const formattedPerfil = {
        id: perfilDoc.id,
        nomePerfil: data.nomePerfil,
        email: data.email,
        senha: data.senha, // Atenção: em produção, nunca retorne a senha assim!
        dataCriacao: data.dataCriacao && typeof data.dataCriacao.toDate === 'function' ? data.dataCriacao.toDate().toISOString() : null
      };

      res.status(200).json(formattedPerfil);
    } catch (error) {
      console.error('Erro ao buscar perfil por ID (GET /:id):', error);
      res.status(500).json({ error: 'Erro ao buscar perfil.' });
    }
  });

  // POST create new perfil
  router.post('/', async (req, res) => {
    try {
      const { nomePerfil, email, senha } = req.body; // Desestrutura apenas os campos desejados

      if (!nomePerfil || !email || !senha) {
        return res.status(400).json({ error: 'Nome do perfil, email e senha são obrigatórios.' });
      }

      // Constrói o objeto a ser salvo com apenas os campos permitidos
      const novoPerfilData = {
        nomePerfil: nomePerfil,
        email: email,
        senha: senha, // ATENÇÃO: Em produção, hash da senha seria feito aqui antes de salvar!
        dataCriacao: new Date()
      };

      const docRef = await db.collection('PERFIL_ADMIN').add(novoPerfilData); // Salva o objeto construído
      res.status(201).json({ message: 'Perfil cadastrado com sucesso!', id: docRef.id, ...novoPerfilData });

    } catch (error) {
      console.error('Erro ao criar perfil (POST /):', error);
      res.status(500).json({ error: 'Erro ao criar perfil.' });
    }
  });

  // PUT update perfil
  router.put('/:id', async (req, res) => {
    try {
      const perfilId = req.params.id;
      const { nomePerfil, email, senha } = req.body; // Desestrutura apenas os campos que podem ser atualizados

      const perfilRef = db.collection('PERFIL_ADMIN').doc(perfilId);
      const doc = await perfilRef.get();
      if (!doc.exists) {
        console.warn('AVISO: Perfil não encontrado para atualização com ID:', perfilId);
        return res.status(404).json({ error: 'Perfil não encontrado para atualização.' });
      }

      // Constrói o objeto de atualização com apenas os campos permitidos
      const updates = {};
      if (nomePerfil !== undefined) updates.nomePerfil = nomePerfil;
      if (email !== undefined) updates.email = email;
      // Senha só é atualizada se for fornecida (não vazia)
      if (senha !== undefined && senha !== '') updates.senha = senha; // ATENÇÃO: Em produção, hash da senha aqui!
      // dataCriacao não é atualizada

      if (Object.keys(updates).length === 0) {
          return res.status(400).json({ message: 'Nenhum dado válido fornecido para atualização.' });
      }

      await perfilRef.update(updates); // Atualiza apenas os campos fornecidos
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