// front-end-inscricoes/src/pages/ClientInscricoes.tsx
import React, { useState, useEffect} from 'react';
import type { ChangeEvent } from 'react';
import type { Atividade, Inscricao } from '../types/index.d'; // Ainda precisamos de Atividade para o "join" do nome
import { Link as ReactRouterLink } from 'react-router-dom';

function ClientInscricoes() {
  const [atividadesDisponiveis, setAtividadesDisponiveis] = useState<Atividade[]>([]); // Ainda precisamos para o nome da atividade
  const [minhasInscricoes, setMinhasInscricoes] = useState<Inscricao[]>([]);
  const [filteredInscricoes, setFilteredInscricoes] = useState<Inscricao[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isLoadingAtividades, setIsLoadingAtividades] = useState<boolean>(true); // Ainda precisamos para fetch
  const [isLoadingInscricoes, setIsLoadingInscricoes] = useState<boolean>(true);
  const [errorAtividades, setErrorAtividades] = useState<string | null>(null); // Ainda precisamos para fetch
  const [errorInscricoes, setErrorInscricoes] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null); // Renomeei para 'message' geral

  const ID_CLIENTE_FIXO = 'ID_DO_CLIENTE_CADASTRADO_AQUI'; // <--- Não esqueça de atualizar este ID!

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Função para buscar atividades disponíveis (ainda necessária para pegar o nome da atividade)
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
      setErrorAtividades('Não foi possível carregar os dados das atividades.'); // Erro mais genérico
    } finally {
      setIsLoadingAtividades(false);
    }
  };

  // Função para buscar as inscrições do cliente logado
  const fetchMinhasInscricoes = async () => {
    if (!ID_CLIENTE_FIXO || ID_CLIENTE_FIXO === 'ID_DO_CLIENTE_CADASTRADO_AQUI') {
      setMinhasInscricoes([]);
      setFilteredInscricoes([]);
      setIsLoadingInscricoes(false);
      return;
    }

    setIsLoadingInscricoes(true);
    setErrorInscricoes(null);
    try {
      const response = await fetch(`${apiBaseUrl}/inscricoes?idCliente=${ID_CLIENTE_FIXO}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar minhas inscrições: ${response.status} ${response.statusText}`);
      }
      const data: Inscricao[] = await response.json();

      // Lógica de "join" no Frontend: Mapeia as inscrições para adicionar o nome da atividade
      const inscricoesComNomeAtividade: Inscricao[] = data.map(inscricao => {
        const atividadeCorrespondente = atividadesDisponiveis.find(ativ => ativ.id === inscricao.idAtividade);
        return {
          ...inscricao,
          nomeAtividade: atividadeCorrespondente ? atividadeCorrespondente.nomeAtividade : 'Atividade Desconhecida'
        };
      });

      setMinhasInscricoes(inscricoesComNomeAtividade);
      setFilteredInscricoes(inscricoesComNomeAtividade);
    } catch (err) {
      console.error('Erro ao buscar minhas inscrições:', err);
      setErrorInscricoes('Não foi possível carregar suas inscrições.');
    } finally {
      setIsLoadingInscricoes(false);
    }
  };

  // Carregar atividades e depois as inscrições (para o join)
  useEffect(() => {
    fetchAtividades();
  }, []);

  useEffect(() => {
    if (!isLoadingAtividades) { // Só busca inscrições depois que as atividades carregarem (ou falharem)
      fetchMinhasInscricoes();
    }
  }, [atividadesDisponiveis, ID_CLIENTE_FIXO, isLoadingAtividades]); // Depende das atividades e do ID do cliente

  // Lógica de filtragem
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredInscricoes(minhasInscricoes);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const result = minhasInscricoes.filter(inscricao =>
        inscricao.nomeAtividade && inscricao.nomeAtividade.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredInscricoes(result);
    }
  }, [searchTerm, minhasInscricoes]);

  // Manipulador para o campo de busca
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // A função handleRealizarInscricao e o botão de inscrição foram REMOVIDOS daqui.
  // O cliente não vai mais se inscrever DESSA TELA.

  return (
    <div className="card-container">
      <h1 className="page-title">Inscrições Realizadas</h1> {/* Título ajustado */}

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="searchInscricoes" className="form-label" style={{ marginBottom: '0' }}>Buscar por Atividade:</label>
        <input
          type="text"
          id="searchInscricoes"
          className="form-input"
          placeholder="Nome da atividade"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: 'auto', flexGrow: 1, maxWidth: '300px' }}
        />
      </div>

      {isLoadingInscricoes && <p style={{ textAlign: 'center' }}>Carregando suas inscrições...</p>}
      {errorInscricoes && <p style={{ color: 'red', textAlign: 'center' }}>{errorInscricoes}</p>}
      {!isLoadingInscricoes && !errorInscricoes && filteredInscricoes.length === 0 && (
        <p style={{ textAlign: 'center' }}>
          {searchTerm ? `Nenhuma inscrição encontrada para "${searchTerm}".` : 'Ainda não possui inscrições em atividades.'}
        </p>
      )}

      {!isLoadingInscricoes && !errorInscricoes && filteredInscricoes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Atividade</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Data da Inscrição</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInscricoes.map((inscricao) => (
              <tr key={inscricao.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{inscricao.nomeAtividade}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{new Date(inscricao.dataInscricao).toLocaleDateString()}</td>
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