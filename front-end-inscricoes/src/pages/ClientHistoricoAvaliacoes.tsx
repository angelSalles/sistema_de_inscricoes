// front-end-inscricoes/src/pages/ClientHistoricoAvaliacoes.tsx
import React, { useState, useEffect } from 'react';
import type { Avaliacao, Cliente, Atividade } from '../types/index.d';

function ClientHistoricoAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null); 

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Função para buscar TODOS os dados necessários (clientes, atividades, avaliações) ---
  const fetchAllDataForFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [clientesRes, atividadesRes, avaliacoesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/clientes`),
        fetch(`${apiBaseUrl}/atividades`),
        fetch(`${apiBaseUrl}/avaliacoes`), // Buscar todas as avaliações
      ]);

      if (!clientesRes.ok) throw new Error(`Erro ${clientesRes.status}: Falha ao carregar clientes.`);
      if (!atividadesRes.ok) throw new Error(`Erro ${atividadesRes.status}: Falha ao carregar atividades.`);
      if (!avaliacoesRes.ok) throw new Error(`Erro ${avaliacoesRes.status}: Falha ao carregar avaliações.`);

      const clientesData: Cliente[] = await clientesRes.json();
      const atividadesData: Atividade[] = await atividadesRes.json();
      const avaliacoesData: Avaliacao[] = await avaliacoesRes.json();

      setClientes(clientesData);
      setAtividades(atividadesData);

      // Realiza o "join" no frontend para adicionar nomes de cliente e atividade às avaliações
      const avaliacoesComDetalhes = avaliacoesData.map(avaliacao => {
        const cliente = clientesData.find(c => c.id === avaliacao.idCliente);
        const atividade = avaliacao.idAtividade ? atividadesData.find(a => a.id === avaliacao.idAtividade) : undefined;
        return {
          ...avaliacao,
          nomeCliente: cliente ? cliente.nomeCliente : 'Cliente Desconhecido',
          nomeAtividade: atividade ? atividade.nomeAtividade : 'N/A'
        };
      });
      setAvaliacoes(avaliacoesComDetalhes);

    } catch (err: any) {
      console.error('Erro ao buscar dados para o feed de avaliações:', err);
      setError(err.message || 'Não foi possível carregar o histórico de avaliações.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    fetchAllDataForFeed();
  }, []);

  // --- Renderização ---
  return (
    <div className="card-container">
      <h1 className="page-title">Histórico de Avaliações</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando seu histórico de avaliações...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : avaliacoes.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Nenhuma avaliação registrada ainda.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Cliente</th> {/* Manter Cliente para ver quem fez o comentário */}
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Atividade</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Comentário</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Data Criação</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Resposta do SESC</th> {/* <--- NOVA COLUNA */}
            </tr>
          </thead>
          <tbody>
            {avaliacoes.map((avaliacao) => (
              <tr key={avaliacao.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{avaliacao.nomeCliente}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{avaliacao.nomeAtividade}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{avaliacao.tipoAvaliacao}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{avaliacao.textoAvaliacao}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {avaliacao.dataCriacao ? new Date(avaliacao.dataCriacao).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}> {/* <--- NOVA CÉLULA */}
                  {avaliacao.respostaIA || '-'}
                  {avaliacao.respostaIA && avaliacao.dataRespostaIA && 
                    <span style={{ display: 'block', fontSize: '0.75em', color: '#666', marginTop: '5px' }}>
                      ({new Date(avaliacao.dataRespostaIA).toLocaleDateString()})
                    </span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClientHistoricoAvaliacoes;