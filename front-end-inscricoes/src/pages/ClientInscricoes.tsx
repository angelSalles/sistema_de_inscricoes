// front-end-inscricoes/src/pages/ClientInscricoes.tsx
import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { Atividade, Cliente, Inscricao } from '../types/index.d';
import { Link as ReactRouterLink } from 'react-router-dom';

function ClientInscricoes() {
  const [atividadesDisponiveis, setAtividadesDisponiveis] = useState<Atividade[]>([]);
  const [clientesCadastrados, setClientesCadastrados] = useState<Cliente[]>([]);
  const [todasInscricoes, setTodasInscricoes] = useState<Inscricao[]>([]); // Inscrições sem filtro de cliente
  const [filteredInscricoes, setFilteredInscricoes] = useState<Inscricao[]>([]); // Inscrições filtradas pela busca
  const [searchTerm, setSearchTerm] = useState<string>(''); // Termo de busca do usuário

  const [isLoadingAtividades, setIsLoadingAtividades] = useState<boolean>(true);
  const [isLoadingClientes, setIsLoadingClientes] = useState<boolean>(true);
  const [isLoadingInscricoes, setIsLoadingInscricoes] = useState<boolean>(true);
  const [errorAtividades, setErrorAtividades] = useState<string | null>(null);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [errorInscricoes, setErrorInscricoes] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Função para buscar atividades disponíveis
  const fetchAtividades = async () => {
    setIsLoadingAtividades(true);
    setErrorAtividades(null);
    try {
      const response = await fetch(`${apiBaseUrl}/atividades`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar atividades: ${response.status} ${response.statusText}`);
      }
      const data: Atividade[] = await response.json();
      setAtividadesDisponiveis(data);
    } catch (err) {
      console.error('Erro ao buscar atividades para join:', err);
      setErrorAtividades('Não foi possível carregar os dados das atividades.');
    } finally {
      setIsLoadingAtividades(false);
    }
  };

  // Função para buscar todos os clientes (para pegar o nome)
  const fetchClientes = async () => {
    setIsLoadingClientes(true);
    setErrorClientes(null);
    try {
      const response = await fetch(`${apiBaseUrl}/clientes`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar clientes: ${response.status} ${response.statusText}`);
      }
      const data: Cliente[] = await response.json();
      setClientesCadastrados(data);
    } catch (err) {
      console.error('Erro ao buscar clientes para join:', err);
      setErrorClientes('Não foi possível carregar os dados dos clientes.');
    } finally {
      setIsLoadingClientes(false);
    }
  };

  // Função para buscar TODAS as inscrições
  const fetchTodasInscricoes = async () => {
    setIsLoadingInscricoes(true);
    setErrorInscricoes(null);
    try {
      // Requisição para buscar todas as inscrições (sem filtro por idCliente)
      const response = await fetch(`${apiBaseUrl}/inscricoes`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar inscrições: ${response.status} ${response.statusText}`);
      }
      const data: Inscricao[] = await response.json();

      // Lógica de "join" no Frontend: Mapeia as inscrições para adicionar nome da atividade, nome do cliente e unidade da atividade
      const inscricoesComDetalhes: Inscricao[] = data.map(inscricao => {
        const atividadeCorrespondente = atividadesDisponiveis.find(ativ => ativ.id === inscricao.idAtividade);
        const clienteCorrespondente = clientesCadastrados.find(cli => cli.id === inscricao.idCliente);

        return {
          ...inscricao,
          nomeAtividade: atividadeCorrespondente ? atividadeCorrespondente.nomeAtividade : 'Atividade Desconhecida',
          nomeCliente: clienteCorrespondente ? clienteCorrespondente.nomeCliente : 'Cliente Desconhecido',
          unidadeAtividade: atividadeCorrespondente ? atividadeCorrespondente.unidade : 'Unidade Não Informada'
        };
      });

      setTodasInscricoes(inscricoesComDetalhes);
      setFilteredInscricoes(inscricoesComDetalhes); // Inicialmente, as inscrições filtradas são todas as obtidas
    } catch (err) {
      console.error('Erro ao buscar todas as inscrições:', err);
      setErrorInscricoes('Não foi possível carregar as inscrições.');
    } finally {
      setIsLoadingInscricoes(false);
    }
  };

  // Efeito para carregar as bases de dados (atividades, clientes) ao montar o componente
  useEffect(() => {
    fetchAtividades();
    fetchClientes();
  }, []);

  // Efeito para carregar as inscrições somente depois que as atividades e clientes forem carregados
  // (pois eles são necessários para o "join" dos nomes e unidade)
  useEffect(() => {
    if (!isLoadingAtividades && !isLoadingClientes) { // Só busca inscrições depois que atividades e clientes carregarem
      fetchTodasInscricoes();
    }
  }, [atividadesDisponiveis, clientesCadastrados, isLoadingAtividades, isLoadingClientes]); // Depende das bases de dados

  // Lógica de filtragem: Dispara o filtro quando o termo de busca ou a lista original muda
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredInscricoes(todasInscricoes);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const result = todasInscricoes.filter(inscricao => {
        // Verifica se o termo de busca está presente em QUALQUER UM dos campos da tabela
        const matchesCliente = inscricao.nomeCliente && inscricao.nomeCliente.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesAtividade = inscricao.nomeAtividade && inscricao.nomeAtividade.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesStatus = inscricao.statusInscricao && inscricao.statusInscricao.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesUnidade = inscricao.unidadeAtividade && inscricao.unidadeAtividade.toLowerCase().includes(lowerCaseSearchTerm); // Inclui busca por unidade

        // Para a data, vamos formatá-la como string antes de buscar
        const dataInscricaoStr = inscricao.dataInscricao ? new Date(inscricao.dataInscricao).toLocaleDateString().toLowerCase() : '';
        const matchesData = dataInscricaoStr.includes(lowerCaseSearchTerm);

        return matchesCliente || matchesAtividade || matchesStatus || matchesUnidade || matchesData; // Atualiza a condição de retorno
      });
      setFilteredInscricoes(result);
    }
  }, [searchTerm, todasInscricoes]);

  // Manipulador para o campo de busca
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="card-container">
      <h1 className="page-title">Lista de Todas as Inscrições</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Área de Busca */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="searchInscricoes" className="form-label" style={{ marginBottom: '0' }}>Buscar (Cliente, Atividade, Unidade, Data, Status):</label> {/* Atualiza o label */}
        <input
          type="text"
          id="searchInscricoes"
          className="form-input"
          placeholder="Buscar por qualquer campo da inscrição"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: 'auto', flexGrow: 1, maxWidth: '300px' }}
        />
      </div>

      {/* Mensagens de Carregamento/Erro para Inscrições */}
      {isLoadingInscricoes || isLoadingAtividades || isLoadingClientes ? (
        <p style={{ textAlign: 'center' }}>Carregando todas as inscrições e dados...</p>
      ) : errorInscricoes || errorAtividades || errorClientes ? (
        <p style={{ color: 'red', textAlign: 'center' }}>
          Erro ao carregar dados: {errorInscricoes || errorAtividades || errorClientes}
        </p>
      ) : filteredInscricoes.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          {searchTerm ? `Nenhuma inscrição encontrada para "${searchTerm}".` : 'Ainda não há inscrições no sistema.'}
        </p>
      ) : (
        // Tabela de Inscrições
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Atividade</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Unidade</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Data da Inscrição</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInscricoes.map((inscricao) => (
              <tr key={inscricao.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.nomeCliente}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.nomeAtividade}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.unidadeAtividade}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {/* Exibe a data de inscrição, com tratamento para "Invalid Date" */}
                  {inscricao.dataInscricao ? new Date(inscricao.dataInscricao).toLocaleDateString() : 'Data Indisponível'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.statusInscricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClientInscricoes;