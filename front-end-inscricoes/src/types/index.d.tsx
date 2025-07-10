// front-end-inscricoes/src/types/index.d.ts

// Interface para os dados do formulário de Cliente
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

export interface Inscricao {
  id: string;
  idCliente: string;
  idAtividade: string;
  dataInscricao: Date | string;
  statusInscricao: 'pendente' | 'confirmada' | 'cancelada';
  nomeAtividade?: string;
}

// Interface para a resposta da API de CEP
export interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  cidade: string; // ViaCEP usa 'localidade' para cidade
  estado: string;         // ViaCEP usa 'uf' para estado
  erro?: boolean; // Adicionado para indicar erro na resposta do ViaCEP
}

// Interface para os dados de endereço que vamos usar no formulário (simplificado)
export interface EnderecoData {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Você pode adicionar mais interfaces aqui conforme o projeto cresce (Atividade, Responsavel, Inscricao, etc.)

export interface Atividade {
  id: string; // ID gerado pelo Firebase para a atividade
  nomeAtividade: string;
  descricao: string;
  unidade: string;
  idResponsavel: string; // ID do responsável pela atividade
  dataCriacao: Date | string; // Data de criação da atividade
}