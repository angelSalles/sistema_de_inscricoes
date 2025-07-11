# Sistema de Inscrições de Atividades SESC

Este projeto é uma aplicação full-stack (CRUD - Create, Read, Update, Delete) para o gerenciamento de inscrições em atividades oferecidas pelo SESC.

## 🎯 Objetivo do Projeto

O objetivo principal é fornecer uma plataforma para o SESC gerenciar suas atividades, responsáveis, clientes e inscrições. A aplicação é dividida em uma Área Administrativa (para gestão interna) e uma Área do Cliente (para interação dos usuários).

## 🚀 Tecnologias Utilizadas

### Backend
* **Node.js**: Ambiente de execução JavaScript.
* **Express.js**: Framework web para Node.js, utilizado para construir a API REST.
* **Firebase Admin SDK**: Kit de desenvolvimento para interagir com os serviços Firebase no servidor.
* **dotenv**: Para gerenciar variáveis de ambiente.
* **cors**: Middleware para habilitar o Cross-Origin Resource Sharing.
* **node-fetch**: Para fazer requisições HTTP (usado na integração com ViaCEP).
* **openai**: Biblioteca para interação com a API da OpenAI (ChatGPT/Gemini).

### Frontend
* **React**: Biblioteca JavaScript para construção de interfaces de usuário.
* **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
* **Vite**: Ferramenta de build frontend rápida.
* **React Router DOM**: Para roteamento na aplicação SPA (Single Page Application).
* **Chart.js / react-chartjs-2**: Para visualização de dados em gráficos (Dashboard).

### Banco de Dados
* **Google Firebase - Cloud Firestore**: Banco de dados NoSQL baseado em documentos.

## 🗄️ Estrutura do Projeto

O projeto é organizado em duas pastas principais na raiz do repositório:

* `back-end-inscricoes/`: Contém o código do servidor Node.js (API REST).
* `front-end-inscricoes/`: Contém o código da aplicação React (interface do usuário).

## 🛠️ Configuração do Ambiente

Certifique-se de ter o [Node.js](https://nodejs.org/en/) (versão LTS recomendada) e o npm (que vem com o Node.js) instalados em sua máquina.

### 1. Configuração do Projeto Firebase

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Clique em "Adicionar projeto" ou "Criar um projeto" e siga as instruções.
3.  Após criar o projeto, no menu lateral esquerdo, vá em **Build > Firestore Database** e clique em "Criar banco de dados". Para desenvolvimento, selecione "Iniciar no modo de teste". Escolha a localização mais próxima de você.
4.  No menu lateral esquerdo, vá em **Configurações do Projeto (ícone de engrenagem) > Contas de Serviço**.
5.  Clique em **"Gerar nova chave privada"** e confirme em "Gerar chave". Um arquivo JSON será baixado para o seu computador.
    **Mova este arquivo JSON para a pasta `back-end-inscricoes/` do seu projeto.**
    É recomendável renomeá-lo para algo mais simples, como `firebase-adminsdk.json` ou `serviceAccountKey.json`.
    **Mantenha este arquivo SEGURO e NUNCA o exponha em repositórios públicos (ele já é ignorado pelo `.gitignore` global).**

### 2. Configuração do Backend

1.  Navegue até a pasta `back-end-inscricoes` no seu terminal:
    ```bash
    cd back-end-inscricoes
    ```
2.  Crie um arquivo de variáveis de ambiente chamado `.env` na pasta `back-end-inscricoes/` (se ainda não existir).
3.  Adicione as seguintes variáveis ao arquivo `.env`, substituindo `[NOME_DO_SEU_ARQUIVO_DE_CHAVE].json` pelo nome real do arquivo JSON que você baixou do Firebase e moveu para esta pasta:
    ```dotenv
    # back-end-inscricoes/.env
    # Caminho para sua chave de serviço Firebase.
    # Use barras / no caminho, mesmo no Windows.
    # Exemplo (WSL/Linux): FIREBASE_SERVICE_ACCOUNT_PATH=/mnt/c/projetos/sesc/sistema_de_inscricoes/back-end-inscricoes/firebase-adminsdk.json
    # (Se o arquivo estiver na mesma pasta que o .env e server.js, use './nome-do-arquivo.json')
    FIREBASE_SERVICE_ACCOUNT_PATH=./[NOME_DO_SEU_ARQUIVO_DE_CHAVE].json

    # Token para a API da OpenAI (ChatGPT/Gemini)
    # Obtenha em [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
    TOKEN_OPENAI=sua_chave_de_api_da_openai_aqui
    ```
    **Lembre-se de substituir `sua_chave_de_api_da_openai_aqui` pelo seu token real.**
4.  Instale as dependências do backend:
    ```bash
    npm install
    ```

### 3. Configuração do Frontend

1.  **Copie seu logo (`logo-sesc.jpeg`)** (ou qualquer imagem que deseje usar como logo) para a pasta `front-end-inscricoes/src/assets/`.
2.  Navegue até a pasta `front-end-inscricoes` no seu terminal (em uma nova janela ou aba, para que o backend possa continuar rodando):
    ```bash
    cd front-end-inscricoes
    ```
3.  Crie um arquivo de variáveis de ambiente chamado `.env` na pasta `front-end-inscricoes/` (se ainda não existir).
4.  Adicione a URL base do seu servidor backend a este arquivo:
    ```dotenv
    # front-end-inscricoes/.env
    VITE_API_BASE_URL=http://localhost:3001
    ```
5.  Instale as dependências do frontend:
    ```bash
    npm install
    ```

## 🚀 Como Executar a Aplicação

Siga estes passos para iniciar o backend e o frontend:

1.  **Iniciar o Backend:**
    Abra seu terminal, navegue até `back-end-inscricoes/` e execute:
    ```bash
    npm start
    ```
    Você deverá ver a mensagem `Servidor backend rodando em http://localhost:3001`.

2.  **Iniciar o Frontend:**
    Abra **OUTRO** terminal (mantenha o backend rodando no primeiro), navegue até `front-end-inscricoes/` e execute:
    ```bash
    npm run dev
    ```
    O Vite iniciará o servidor de desenvolvimento e indicará um endereço, geralmente `http://localhost:5173`.

3.  **Acessar a Aplicação:**
    Abra seu navegador e vá para o endereço indicado pelo Vite (ex: `http://localhost:5173`).

## ✨ Funcionalidades Principais

### Área do Cliente

* **Página Inicial (Home):** Atua como um portal, direcionando o usuário para a Área Administrativa ou Área do Cliente. Não possui cabeçalho/rodapé.
* **Cadastro de Cliente e Inscrição em Atividade:** Permite que o cliente preencha seus dados pessoais (com busca de endereço por CEP) e se inscreva em uma atividade disponível, tudo em um único formulário.
* **Minhas Inscrições:** Lista todas as inscrições feitas no sistema, exibindo o cliente, atividade, unidade, data e status. Possui um campo de busca que filtra por qualquer campo visível na tabela.
* **Registrar Avaliação:** Formulário para o cliente enviar críticas, sugestões ou elogios sobre o portal ou atividades.
* **Histórico de Avaliações:** Exibe todas as avaliações registradas (um feed de comentários), incluindo o nome do cliente, atividade (se houver) e a resposta da IA.

### Área Administrativa

* **Gerenciamento de Clientes:** CRUD completo (visualizar, editar, excluir) de todos os clientes cadastrados.
* **Gerenciamento de Atividades:** CRUD completo (visualizar, cadastrar, editar, excluir) das atividades oferecidas.
* **Gerenciamento de Responsáveis:** CRUD completo (visualizar, cadastrar, editar, excluir) dos responsáveis pelas atividades.
* **Gerenciamento de Inscrições:** Visualização de todas as inscrições, com filtros (por texto em qualquer campo visível, por status) e a capacidade de atualizar o status da inscrição.
* **Cadastro de Perfis Administrativos:** Permite cadastrar e gerenciar perfis de acesso para administradores (com e-mail e senha simulados, **não seguro para produção**).
* **Painel de BI - Dashboards:** Exibe métricas e gráficos de pizza interativos sobre o total de clientes, atividades, e a distribuição de inscrições por status, atividade e unidade.
* **Gerador de Conteúdo por IA (integrado ao Dashboard):** Permite enviar perguntas à IA (ChatGPT/Gemini) sobre os dados do dashboard, e a IA responde de forma contextualizada.
* **Gestão de Avaliações:** Visualização de todas as avaliações enviadas, com a opção de gerar uma resposta automática via IA e salvar essa resposta.

## 🐛 Tratamento de Erros e Casos Extremos

* As requisições para o backend possuem tratamento de erros (`try/catch`) e exibem mensagens claras no frontend.
* Formulários incluem validações básicas (campos obrigatórios).
* Listagens exibem mensagens quando os dados estão carregando, quando há erros ou quando não há registros.
* Validação de unicidade para inscrições (um cliente não pode se inscrever duas vezes na mesma atividade).

## ⚠️ Observações de Segurança (Importante para Produção)

* **Senhas de Perfis Administrativos:** Atualmente, as senhas de perfis administrativos são salvas em texto puro no Cloud Firestore para fins de demonstração do desafio. **Em um ambiente de produção real, NUNCA faça isso.** Você deve usar o Firebase Authentication ou um sistema de autenticação robusto que inclua hashing de senhas.
* **Regras de Segurança do Firestore:** Para produção, as regras de segurança do seu Cloud Firestore devem ser configuradas para restringir o acesso direto do cliente e garantir que apenas o backend (com Firebase Admin SDK) ou usuários autenticados com regras específicas possam ler/escrever dados.