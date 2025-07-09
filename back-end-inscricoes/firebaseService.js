const admin = require('firebase-admin');
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  console.error('Erro: FIREBASE_SERVICE_ACCOUNT_PATH não definido no .env');
  process.exit(1); // Encerra o processo se a variável não estiver definida
}

// Carrega o conteúdo do arquivo JSON
let serviceAccount;
try {
  // Use require para carregar o JSON diretamente
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error(`Erro ao carregar o arquivo de credenciais do Firebase em ${serviceAccountPath}:`, error);
  process.exit(1);
}

// Inicializa o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Obtém a instância do Cloud Firestore
const db = admin.firestore();

module.exports = db;