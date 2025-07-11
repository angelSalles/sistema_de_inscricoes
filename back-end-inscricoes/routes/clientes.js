// backend-inscricoes/routes/clientes.js
const express = require('express');

// Exporta uma função que recebe 'db' como argumento
module.exports = (db) => {
  const router = express.Router();

  // Middleware para verificar se 'db' está disponível
  router.use((req, res, next) => {
    if (!db) {
      return res.status(500).send('Serviço de banco de dados não inicializado.');
    }
    next();
  });

  // Rota GET para listar todos os clientes
  router.get('/', async (req, res) => {
    try {
      const clientesRef = db.collection('CLIENTE');
      const snapshot = await clientesRef.get();
      const clientes = [];
      snapshot.forEach(doc => {
        clientes.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(clientes);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      res.status(500).send('Erro ao buscar clientes.');
    }
  });

  // Rota GET para buscar um cliente por ID
  router.get('/:id', async (req, res) => {
    try {
      const clienteId = req.params.id;
      const clienteDoc = await db.collection('CLIENTE').doc(clienteId).get();

      if (!clienteDoc.exists) {
        return res.status(404).send('Cliente não encontrado.');
      }

      res.status(200).json({ id: clienteDoc.id, ...clienteDoc.data() });
    } catch (error) {
      console.error('Erro ao buscar cliente por ID:', error);
      res.status(500).send('Erro ao buscar cliente.');
    }
  });

  // Rota POST para criar um novo cliente
  router.post('/', async (req, res) => {
    try {
      const novoCliente = req.body;
      // Adicionar dataCriacao automaticamente
      novoCliente.dataCriacao = new Date();

      const docRef = await db.collection('CLIENTE').add(novoCliente);
      res.status(201).json({ id: docRef.id, ...novoCliente });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).send('Erro ao criar cliente.');
    }
  });

  // Rota PUT para atualizar um cliente existente
  router.put('/:id', async (req, res) => {
    try {
      const clienteId = req.params.id;
      const dadosAtualizados = req.body;

      // Opcional: Remover dataCriacao se ela não deve ser atualizada manualmente
      delete dadosAtualizados.dataCriacao;

      await db.collection('CLIENTE').doc(clienteId).update(dadosAtualizados);
      res.status(200).json({ message: 'Cliente atualizado com sucesso.', id: clienteId });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).send('Erro ao atualizar cliente.');
    }
  });

  // Rota DELETE para deletar um cliente
  router.delete('/:id', async (req, res) => {
    try {
      const clienteId = req.params.id;
      await db.collection('CLIENTE').doc(clienteId).delete();
      res.status(200).send('Cliente deletado com sucesso.');
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      res.status(500).send('Erro ao deletar cliente.');
    }
  });

  return router;
};