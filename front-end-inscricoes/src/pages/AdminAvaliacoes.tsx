// front-end-inscricoes/src/pages/AdminAvaliacoes.tsx
import React, { useState, useEffect} from 'react';
import type { Avaliacao, Cliente, Atividade } from '../types/index.d'; // Importe as interfaces necessárias

function AdminAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true); // Para carregar todas as avaliações e dados
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<string | null>(null); // Avaliação selecionada para responder
  const [isLoadingRespostaIA, setIsLoadingRespostaIA] = useState<boolean>(false);
  const [respostaIAInput, setRespostaIAInput] = useState<string>(''); // Para o campo de pergunta/resposta manual

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Funções de Fetch ---
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Clientes e Atividades primeiro para o "join"
      const [clientesRes, atividadesRes, avaliacoesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/clientes`),
        fetch(`${apiBaseUrl}/atividades`),
        fetch(`${apiBaseUrl}/avaliacoes`),
      ]);

      if (!clientesRes.ok) throw new Error(`Erro ${clientesRes.status}: Falha ao carregar clientes.`);
      if (!atividadesRes.ok) throw new Error(`Erro ${atividadesRes.status}: Falha ao carregar atividades.`);
      if (!avaliacoesRes.ok) throw new Error(`Erro ${avaliacoesRes.status}: Falha ao carregar avaliações.`);

      const clientesData: Cliente[] = await clientesRes.json();
      const atividadesData: Atividade[] = await atividadesRes.json();
      const avaliacoesData: Avaliacao[] = await avaliacoesRes.json(); // Dados brutos de avaliação

      // Realiza o "join" no frontend para adicionar nomes de cliente e atividade
      const avaliacoesComDetalhes = avaliacoesData.map(avaliacao => {
        const cliente = clientesData.find(c => c.id === avaliacao.idCliente);
        // A condição avaliacao.idAtividade verifica se a avaliação está ligada a uma atividade.
        const atividade = avaliacao.idAtividade ? atividadesData.find(a => a.id === avaliacao.idAtividade) : undefined;
        return {
          ...avaliacao,
          nomeCliente: cliente ? cliente.nomeCliente : 'Cliente Desconhecido',
          nomeAtividade: atividade ? atividade.nomeAtividade : 'N/A' // 'N/A' se não tiver idAtividade
        };
      });
      setAvaliacoes(avaliacoesComDetalhes);

    } catch (err: any) {
      console.error('Erro ao buscar dados para gestão de avaliações:', err);
      setError(err.message || 'Não foi possível carregar os dados para gestão de avaliações.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar todos os dados ao montar
  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Funções de Resposta IA ---
  const handleResponderIA = async (avaliacao: Avaliacao) => {
    setSelectedAvaliacaoId(avaliacao.id);
    setIsLoadingRespostaIA(true);
    setMessage(null);
    setRespostaIAInput(''); // Limpa o campo de resposta anterior

    try {
      // Constrói a pergunta para a IA, incluindo o contexto da avaliação
      const perguntaParaIA = `A seguinte avaliação foi recebida do cliente "${avaliacao.nomeCliente || 'Desconhecido'}" ` +
                             `referente à atividade "${avaliacao.nomeAtividade || 'Portal/Geral'}" (Tipo: ${avaliacao.tipoAvaliacao}):\n\n` +
                             `"${avaliacao.textoAvaliacao}"\n\n` +
                             `Por favor, crie uma resposta cordial e profissional, adequada ao tipo de avaliação (crítica, sugestão, elogio), com no máximo 3 frases.`;
          
      const response = await fetch(`${apiBaseUrl}/gpt/perguntaGPT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pergunta: perguntaParaIA }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}: Falha ao gerar resposta da IA.`);
      }

      const respostaGerada = result.resposta;
      setRespostaIAInput(respostaGerada); // Exibe a resposta no campo

    } catch (err: any) {
      console.error('Erro ao gerar resposta IA para avaliação:', err);
      setMessage({ type: 'error', text: err.message || 'Não foi possível gerar resposta da IA para esta avaliação.' });
    } finally {
      setIsLoadingRespostaIA(false);
    }
  };

  // Função para Salvar a Resposta da IA (ou Resposta Manual)
  const handleSalvarResposta = async (avaliacaoId: string, resposta: string) => {
    if (!resposta.trim()) {
        setMessage({ type: 'warning', text: 'A resposta não pode estar vazia.' });
        return;
    }
    setMessage(null);
    try {
        const response = await fetch(`${apiBaseUrl}/avaliacoes/${avaliacaoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ respostaIA: resposta }), // Atualiza o campo respostaIA no Firebase
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status}: Falha ao salvar resposta.`);
        }
        setMessage({ type: 'success', text: 'Resposta salva com sucesso!' });
        setSelectedAvaliacaoId(null); // Sai do modo de resposta
        setRespostaIAInput(''); // Limpa o campo
        fetchAllData(); // Recarrega todas as avaliações para exibir a resposta salva
    } catch (err: any) {
        console.error('Erro ao salvar resposta da avaliação:', err);
        setMessage({ type: 'error', text: err.message || 'Erro ao salvar resposta. Tente novamente.' });
    }
  };

  const handleDeleteAvaliacao = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      return;
    }
    setMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/avaliacoes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Erro ao excluir: ${response.statusText}`);
      }
      setMessage({ type: 'success', text: 'Avaliação excluída com sucesso!' });
      fetchAllData(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao excluir avaliação:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao excluir avaliação. Tente novamente.' });
    }
  };


  // --- Renderização ---
  return (
    <div className="card-container">
      <h1 className="page-title">Gestão de Avaliações</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando avaliações...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : avaliacoes.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Nenhuma avaliação registrada ainda.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Atividade</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Comentário</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Data Criação</th> {/* Nome mais claro */}
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Resposta IA</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.map((avaliacao) => (
              <React.Fragment key={avaliacao.id}>
                <tr>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{avaliacao.nomeCliente}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{avaliacao.nomeAtividade}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{avaliacao.tipoAvaliacao}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{avaliacao.textoAvaliacao}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {avaliacao.dataCriacao ? new Date(avaliacao.dataCriacao).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {avaliacao.respostaIA || '-'}
                    {avaliacao.respostaIA && avaliacao.dataRespostaIA && 
                      <span style={{ display: 'block', fontSize: '0.75em', color: '#666', marginTop: '5px' }}>
                        ({new Date(avaliacao.dataRespostaIA).toLocaleDateString()})
                      </span>
                    }
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => setSelectedAvaliacaoId(avaliacao.id)} // Ativa o modo de resposta
                      className="form-button"
                      style={{ backgroundColor: '#3182CE', color: 'white', marginRight: '8px', padding: '6px 12px', fontSize: '0.9rem' }}
                      disabled={isLoadingRespostaIA && selectedAvaliacaoId === avaliacao.id}
                    >
                      {isLoadingRespostaIA && selectedAvaliacaoId === avaliacao.id ? 'Gerando...' : 'Responder'}
                    </button>
                    <button
                      onClick={() => handleDeleteAvaliacao(avaliacao.id)}
                      className="form-button"
                      style={{ backgroundColor: '#E53E3E', color: 'white', padding: '6px 12px', fontSize: '0.9rem' }}
                      disabled={isLoadingRespostaIA && selectedAvaliacaoId === avaliacao.id}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
                {selectedAvaliacaoId === avaliacao.id && ( // Formulário de resposta aparece abaixo da linha
                  <tr>
                    <td colSpan={7} style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label htmlFor={`respostaIA-${avaliacao.id}`} className="form-label">Resposta da IA/Manual:</label>
                        <textarea
                          id={`respostaIA-${avaliacao.id}`}
                          className="form-input"
                          rows={3}
                          value={respostaIAInput}
                          onChange={(e) => setRespostaIAInput(e.target.value)}
                          placeholder="Edite a resposta da IA ou digite uma manualmente."
                        ></textarea>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => handleResponderIA(avaliacao)} // Gera a resposta IA no campo
                                className="form-button"
                                style={{ backgroundColor: '#805AD5', color: 'white', padding: '6px 12px', fontSize: '0.9rem' }}
                                disabled={isLoadingRespostaIA}
                            >
                                Gerar Resposta IA
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSalvarResposta(avaliacao.id, respostaIAInput)} // Salva a resposta no Firebase
                                className="form-button"
                                style={{ backgroundColor: '#38A169', color: 'white', padding: '6px 12px', fontSize: '0.9rem' }}
                                disabled={isLoadingRespostaIA || !respostaIAInput.trim()}
                            >
                                Salvar Resposta
                            </button>
                            <button
                                type="button"
                                onClick={() => { setSelectedAvaliacaoId(null); setRespostaIAInput(''); }} // Cancela
                                className="form-button"
                                style={{ backgroundColor: '#718096', color: 'white', padding: '6px 12px', fontSize: '0.9rem' }}
                            >
                                Cancelar
                            </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminAvaliacoes;