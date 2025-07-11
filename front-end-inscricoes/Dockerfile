# Fase 1: Build do aplicativo React
FROM node:24-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Construir a aplicação React para produção
# Certifique-se de que o .env do frontend esteja configurado para produção, se necessário,
# ou que as variáveis de ambiente sejam passadas durante o docker-compose build.
RUN npm run build

# Fase 2: Servir a aplicação com Nginx
FROM nginx:stable-alpine as production-stage

# Copia os arquivos de build do React da fase anterior para o Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copia uma configuração customizada do Nginx (vamos criá-la em breve)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta padrão do Nginx
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]