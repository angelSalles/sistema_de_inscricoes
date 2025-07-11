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

## 🐳 Configuração e Execução com Docker Compose

A forma recomendada de configurar e executar esta aplicação é utilizando o Docker Compose, que orquestrará tanto o backend quanto o frontend em contêineres Docker isolados.

### Pré-requisitos

* **Docker Desktop**: Certifique-se de ter o [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando em sua máquina (Windows, macOS ou Linux).
    * No Windows, ative a **Integração WSL 2** nas configurações do Docker Desktop para que você possa executar comandos `docker` e `docker compose` diretamente do seu terminal WSL.

### 1. Configuração do Projeto Firebase

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Crie um novo projeto Firebase.
3.  No menu lateral esquerdo, vá em **Build > Firestore Database** e clique em "Criar banco de dados". Para desenvolvimento, selecione "Iniciar no modo de teste". Escolha a localização mais próxima de você.
4.  No menu lateral esquerdo, vá em **Configurações do Projeto (ícone de engrenagem) > Contas de Serviço**.
5.  Clique em **"Gerar nova chave privada"** e confirme em "Gerar chave". Um arquivo JSON será baixado para o seu computador.
    **Mova este arquivo JSON para a pasta `back-end-inscricoes/` do seu projeto.**
    É recomendável renomeá-lo para algo mais simples, como `firebase-adminsdk.json` ou `serviceAccountKey.json`.
    **Mantenha este arquivo SEGURO e NUNCA o exponha em repositórios públicos.**

### 2. Configuração de Variáveis de Ambiente

#### 2.1. Backend (`back-end-inscricoes/.env`)

1.  Navegue até a pasta `back-end-inscricoes/`.
2.  Crie um arquivo `.env` (se ainda não existir).
3.  Adicione as seguintes variáveis, substituindo os placeholders pelos seus valores reais:
    ```dotenv
    # back-end-inscricoes/.env
    # Caminho para sua chave de serviço Firebase DENTRO DO CONTÊINER DOCKER.
    # O volume mapeia o arquivo do HOST para /app/nome_do_arquivo.json no contêiner.
    FIREBASE_SERVICE_ACCOUNT_PATH=/app/[NOME_DO_SEU_ARQUIVO_DE_CHAVE].json 

    # Token para a API da OpenAI (ChatGPT/Gemini)
    # Obtenha em [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
    TOKEN_OPENAI=sua_chave_de_api_da_openai_aqui
    ```
    **Substitua `[NOME_DO_SEU_ARQUIVO_DE_CHAVE].json` pelo nome exato do arquivo JSON.**

#### 2.2. Frontend (`front-end-inscricoes/.env`)

1.  Navegue até a pasta `front-end-inscricoes/`.
2.  Crie um arquivo `.env` (se ainda não existir).
3.  Adicione a URL base do seu servidor backend. Como ambos os serviços estarão no Docker e você os acessará via `localhost`, a URL é a mesma porta mapeada:
    ```dotenv
    # front-end-inscricoes/.env
    # URL do backend acessível pelo navegador do seu host
    VITE_API_BASE_URL=http://localhost:3001
    ```

### 3. Instalação de Dependências (Localmente - apenas para inicialização e IDE)

Embora o Docker instale as dependências para a build, é útil ter as dependências instaladas localmente para ferramentas de desenvolvimento (linters, IntelliSense do VS Code).

1.  **Para o Backend:**
    ```bash
    cd back-end-inscricoes
    npm install
    ```
2.  **Para o Frontend:**
    ```bash
    cd front-end-inscricoes
    npm install
    ```

## 🚀 Como Executar a Aplicação com Docker Compose

1.  **Navegue até a pasta raiz do projeto** (`sistema_de_inscricoes/`):
    ```bash
    cd /mnt/c/projetos/sesc/sistema_de_inscricoes # Ou o caminho equivalente no seu sistema
    ```

2.  **Construir as Imagens Docker:**
    Execute este comando para construir as imagens do backend e do frontend. Faça isso sempre que houver mudanças nos `Dockerfiles` ou nas dependências dos `package.json`.
    ```bash
    docker compose build
    ```

3.  **Iniciar os Contêineres:**
    Este comando irá criar e iniciar os contêineres do backend e do frontend, e configurá-los para se comunicar.
    ```bash
    docker compose up
    ```
    Você verá os logs de ambos os serviços no terminal.

4.  **Acessar a Aplicação:**
    Abra seu navegador e vá para `http://localhost`.
    * O frontend estará acessível na porta 80 (padrão HTTP).
    * O backend estará acessível na porta 3001 (internamente e externamente via `localhost:3001`).

5.  **Parar a Aplicação:**
    Para parar os contêineres, pressione `Ctrl+C` no terminal onde o `docker compose up` está rodando.

6.  **Parar e Remover Contêineres e Redes (para um início limpo):**
    ```bash
    docker compose down
    ```

## ✨ Funcionalidades Principais

### Área do Cliente

* **Página Inicial (Home):** Ponto de entrada que direciona o usuário para a Área Administrativa ou Área do Cliente.
* **Cadastro de Cliente e Inscrição em Atividade:** Permite que o cliente preencha seus dados pessoais (com busca de endereço por CEP) e se inscreva em uma atividade disponível, tudo em um único formulário.
* **Minhas Inscrições:** Lista todas as inscrições feitas no sistema, exibindo o cliente, atividade, unidade, data e status. Possui um campo de busca que filtra por qualquer campo visível na tabela.
* **Registrar Avaliação:** Formulário para o cliente enviar críticas, sugestões ou elogios sobre o portal ou atividades.
* **Histórico de Avaliações:** Exibe todas as avaliações registradas (um feed de comentários), incluindo o nome do cliente, atividade (se houver) e a resposta da IA.

### Área Administrativa

* **Acesso:** Crie no Firebase as credenciais de acesso do perfil admin, ou entre diretamente em http://localhost/admin/perfis-administrativos para criar seu perfil, com os seguintes campos: dataCriacao 11 de julho de 2025 às 08:26:30 UTC-4 (timestamp); email "admin@sesc.com" (string); nomePerfil "Admin" (string); senha "1234" (string)
* **Gerenciamento de Clientes:** CRUD completo (visualizar, editar, excluir) de todos os clientes cadastrados.
* **Gerenciamento de Atividades:** CRUD completo (visualizar, cadastrar, editar, excluir) das atividades oferecidas.
* **Gerenciamento de Responsáveis:** CRUD completo (visualizar, cadastrar, editar, excluir) dos responsáveis pelas atividades.
* **Gerenciamento de Inscrições:** Visualização de todas as inscrições, com filtros (por texto em qualquer campo visível, por status) e a capacidade de atualizar o status da inscrição.
* **Cadastro de Perfis Administrativos:** Permite cadastrar e gerenciar perfis de acesso para administradores (com e-mail e senha simulados, **não seguro para produção**).
* **Painel de BI - Dashboards:** Exibe métricas e gráficos de pizza interativos sobre o total de clientes, atividades, e a distribuição de inscrições por status, atividade e unidade. Inclui uma funcionalidade de IA para obter insights sobre os dados.
* **Gestão de Avaliações:** Visualização de todas as avaliações enviadas, com a opção de gerar uma resposta automática via IA e salvar essa resposta.

## 🐛 Tratamento de Erros e Validações

* As requisições para o backend possuem tratamento de erros (`try/catch`) e exibem mensagens claras no frontend.
* Formulários incluem validações básicas (campos obrigatórios).
* Listagens exibem mensagens claras quando os dados estão carregando, quando há erros ou quando não há registros.
* Validação de unicidade para inscrições (um cliente não pode se inscrever duas vezes na mesma atividade).
* As respostas da API são padronizadas em formato JSON.

## ⚠️ Observações de Segurança (Importante para Produção)

* **Senhas de Perfis Administrativos:** Atualmente, as senhas de perfis administrativos são salvas em texto puro no Cloud Firestore para fins de demonstração do desafio. **Em um ambiente de produção real, NUNCA faça isso.** Você deve usar o Firebase Authentication ou um sistema de autenticação robusto que inclua hashing de senhas e autenticação (e.g., JWT).
* **Regras de Segurança do Firestore:** Para produção, as regras de segurança do seu Cloud Firestore devem ser configuradas para restringir o acesso direto do cliente e garantir que apenas o backend (com Firebase Admin SDK) ou usuários autenticados com regras específicas possam ler/escrever dados.
* **Token da OpenAI:** O `TOKEN_OPENAI` é uma chave sensível. Garanta que seu `.env` esteja no `.gitignore` e que a chave não seja exposta em repositórios públicos ou builds de cliente.