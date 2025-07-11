# Usa uma imagem oficial do Node.js como base
FROM node:24-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos package.json e package-lock.json para instalar as dependências
COPY package*.json ./

# Instala as dependências do Node.js
RUN npm install --production

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta em que o backend estará rodando
EXPOSE 3001

# Comando para iniciar o servidor Node.js
CMD ["npm", "start"]