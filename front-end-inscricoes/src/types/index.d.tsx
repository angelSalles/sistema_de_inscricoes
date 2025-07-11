// front-end-inscricoes/src/types/index.d.ts

// Interfaces para Dados do Cliente
export interface ClienteFormData {
  nomeCliente: string;
  dataNascimento: string; // Formato string YYYY-MM-DD para input date
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Interface para os dados completos do Cliente recebidos do backend/Firebase
// Inclui o ID e a data de criação.
export interface Cliente extends ClienteFormData {
  id: string; // ID gerado pelo Firebase
  dataCriacao: Date | string; // Firebase armazena Timestamp, pode vir como Date ou string
}

// Interfaces para Dados de Atividades
export interface Atividade {
  id: string; // ID gerado pelo Firebase para a atividade
  nomeAtividade: string;
  descricao: string;
  unidade: string; // Campo 'unidade' conforme retornado pelo backend
  idResponsavel: string; // ID do responsável pela atividade
  dataCriacao: Date | string; // Data de criação da atividade
}


export interface Inscricao {
  id: string;
  idCliente: string;
  idAtividade: string;
  dataInscricao: Date | string; // Garanta que esta propriedade exista
  statusInscricao: 'pendente' | 'confirmada' | 'cancelada';
  nomeAtividade?: string;
  nomeCliente?: string;
  unidadeAtividade?: string; // Garanta que esta propriedade exista
}

// Interfaces para Serviços Externos (CEP)
export interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  erro?: boolean;
}

// Interface para os dados de endereço que vamos usar no formulário (simplificado)
// OBS: Essa interface pode ser redundante se ViaCepResponse já atende ao que você precisa diretamente.
// Manter por enquanto, mas pode ser removida se não houver uso específico.
export interface EnderecoData {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Responsavel {
  id: string; // ID gerado pelo Firebase para o responsável
  nomeResponsavel: string;
  matricula: string;
  dataCriacao: Date | string;
}

export interface Avaliacao {
  id: string; // ID gerado pelo Firebase
  idCliente: string;
  idAtividade?: string; // Opcional, pode ser relacionada a uma atividade ou ao portal geral
  tipoAvaliacao: 'critica' | 'sugestao' | 'elogio'; // Tipos específicos de avaliação
  textoAvaliacao: string;
  dataCriacao: Date | string;
  respostaIA?: string; // Resposta gerada pela IA
  dataRespostaIA?: Date | string; // Data em que a resposta da IA foi gerada
  // Propriedades para exibição no frontend (preenchidas com "join" no frontend/backend)
  nomeCliente?: string; // Nome do cliente que enviou a avaliação
  nomeAtividade?: string; // Nome da atividade, se aplicável
}

export interface PerfilAdmin {
  id: string; // ID gerado pelo Firebase
  nomePerfil: string;
  descricao?: string; // Opcional
  permissoes: string[]; // Array de strings, ex: ["clientes:visualizar", "atividades:gerenciar"]
  email: string; // <--- NOVO: Email do usuário administrativo
  senha: string; // <--- NOVO: Senha do usuário (ATENÇÃO: Apenas para simulação, não seguro para produção!)
  dataCriacao: Date | string;
}