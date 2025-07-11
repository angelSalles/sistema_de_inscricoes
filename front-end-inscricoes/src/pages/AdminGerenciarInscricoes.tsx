// front-end-inscricoes/src/pages/AdminGerenciarInscricoes.tsx
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { Atividade, Cliente, Inscricao } from '../types/index.d';
// Link as ReactRouterLink não é necessário aqui para esta página

function AdminGerenciarInscricoes() {
  const [atividadesDisponiveis, setAtividadesDisponiveis] = useState<Atividade[]>([]);
  const [clientesCadastrados, setClientesCadastrados] = useState<Cliente[]>([]);
  const [todasInscricoes, setTodasInscricoes] = useState<Inscricao[]>([]);
  const [filteredInscricoes, setFilteredInscricoes] = useState<Inscricao[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Termo de busca
  const [filterStatus, setFilterStatus] = useState<string>(''); // Novo estado para filtro de status

  const [isLoadingAtividades, setIsLoadingAtividades] = useState<boolean>(true);
  const [isLoadingClientes, setIsLoadingClientes] = useState<boolean>(true);
  const [isLoadingInscricoes, setIsLoadingInscricoes] = useState<boolean>(true);
  const [errorAtividades, setErrorAtividades] = useState<string | null>(null);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [errorInscricoes, setErrorInscricoes] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Funções de Fetch ---
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

  const fetchTodasInscricoes = async () => {
    setIsLoadingInscricoes(true);
    setErrorInscricoes(null);
    try {
      const response = await fetch(`${apiBaseUrl}/inscricoes`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar inscrições: ${response.status} ${response.statusText}`);
      }
      const data: Inscricao[] = await response.json();

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
    } catch (err) {
      console.error('Erro ao buscar todas as inscrições:', err);
      setErrorInscricoes('Não foi possível carregar as inscrições.');
    } finally {
      setIsLoadingInscricoes(false);
    }
  };

  // Carregar bases de dados (atividades, clientes) ao montar
  useEffect(() => {
    fetchAtividades();
    fetchClientes();
  }, []);

  // Carregar inscrições somente depois que atividades e clientes forem carregados
  useEffect(() => {
    if (!isLoadingAtividades && !isLoadingClientes) {
      fetchTodasInscricoes();
    }
  }, [atividadesDisponiveis, clientesCadastrados, isLoadingAtividades, isLoadingClientes]);

  // Lógica de filtragem: Dispara o filtro quando o termo de busca, status ou a lista original muda
  useEffect(() => {
    let currentFiltered = todasInscricoes;

    // 1. Filtrar por status
    if (filterStatus && filterStatus !== 'todos') {
      currentFiltered = currentFiltered.filter(inscricao => inscricao.statusInscricao === filterStatus);
    }

    // 2. Filtrar por termo de busca geral
    if (searchTerm !== '') {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(inscricao => {
        const matchesCliente = inscricao.nomeCliente && inscricao.nomeCliente.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesAtividade = inscricao.nomeAtividade && inscricao.nomeAtividade.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesStatus = inscricao.statusInscricao && inscricao.statusInscricao.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesUnidade = inscricao.unidadeAtividade && inscricao.unidadeAtividade.toLowerCase().includes(lowerCaseSearchTerm);

        const dataInscricaoStr = inscricao.dataInscricao ? new Date(inscricao.dataInscricao).toLocaleDateString().toLowerCase() : '';
        const matchesData = dataInscricaoStr.includes(lowerCaseSearchTerm);

        return matchesCliente || matchesAtividade || matchesStatus || matchesUnidade || matchesData;
      });
    }
    setFilteredInscricoes(currentFiltered);
  }, [searchTerm, filterStatus, todasInscricoes]); // Dependências do useEffect

  // Manipuladores de busca e filtro de status
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  // --- Futuras Funções de Ação (Atualizar Status, etc.) ---
  const handleUpdateStatus = async (inscricaoId: string, newStatus: string) => {
    if (!window.confirm(`Tem certeza que deseja mudar o status desta inscrição para "${newStatus}"?`)) {
      return;
    }
    setMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/inscricoes/${inscricaoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusInscricao: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: Falha ao atualizar status.`);
      }
      setMessage({ type: 'success', text: `Status da inscrição ${inscricaoId} atualizado para "${newStatus}"!` });
      fetchTodasInscricoes(); // Recarrega todas as inscrições para refletir a mudança
    } catch (err: any) {
      console.error('Erro ao atualizar status da inscrição:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar status da inscrição.' });
    }
  };


  return (
    <div className="card-container">
      <h1 className="page-title">Gerenciamento de Inscrições</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Área de Filtros e Busca */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
        <div style={{ flex: '1 1 250px' }}> {/* Para o campo de busca */}
          <label htmlFor="searchInscricoes" className="form-label">Buscar (Todos os Campos):</label>
          <input
            type="text"
            id="searchInscricoes"
            className="form-input"
            placeholder="Ex: João, Natação, Pendente, 10/07/2025"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div style={{ flex: '1 1 150px' }}> {/* Para o filtro de status */}
          <label htmlFor="filterStatus" className="form-label">Filtrar por Status:</label>
          <select
            id="filterStatus"
            className="form-input"
            value={filterStatus}
            onChange={handleStatusFilterChange}
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
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
          {searchTerm || filterStatus !== 'todos' ? `Nenhuma inscrição encontrada com os filtros aplicados.` : 'Ainda não há inscrições no sistema.'}
        </p>
      ) : (
        // Tabela de Inscrições
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Atividade</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Unidade</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Data Inscrição</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Ações</th> {/* Nova coluna para ações */}
            </tr>
          </thead>
          <tbody>
            {filteredInscricoes.map((inscricao) => (
              <tr key={inscricao.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.nomeCliente}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.nomeAtividade}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.unidadeAtividade}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {inscricao.dataInscricao ? new Date(inscricao.dataInscricao).toLocaleDateString() : 'Data Indisponível'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.statusInscricao}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {/* Botões de Ação para Status */}
                  <select
                    className="form-input"
                    value={inscricao.statusInscricao}
                    onChange={(e) => handleUpdateStatus(inscricao.id, e.target.value)}
                    style={{ width: 'auto', padding: '6px', fontSize: '0.9rem' }}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminGerenciarInscricoes;