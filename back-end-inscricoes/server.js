const express = require('express');
const cors = require('cors');
const db = require('./firebaseService'); // Importa a instância do Firestore

// Importar os arquivos de rota
const clientesRoutes = require('./routes/clientes');
const atividadesRoutes = require('./routes/atividades');
const responsaveisRoutes = require('./routes/responsaveis');
const inscricoesRoutes = require('./routes/inscricoes');
const cepRoutes = require('./routes/cep');

const app = express();
const PORT = process.env.PORT || 3001; // Porta para o seu backend. O frontend geralmente roda em 5173 ou 3000

// Middlewares
app.use(cors()); // Habilita CORS para permitir requisições do frontend
app.use(express.json()); // Permite que o Express leia JSON no corpo das requisições

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('Backend do Sistema de Inscrições do SESC está funcionando!');
});

// Exemplo de rota para listar Clientes
/*
app.get('/clientes', async (req, res) => {
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
*/

// Usar as rotas específicas para cada recurso
app.use('/clientes', clientesRoutes(db)); // Passa a instância do Firestore para as rotas
app.use('/atividades', atividadesRoutes(db));
app.use('/responsaveis', responsaveisRoutes(db));
app.use('/inscricoes', inscricoesRoutes(db));
app.use('/cep', cepRoutes());

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});