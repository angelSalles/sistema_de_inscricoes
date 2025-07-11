// front-end-inscricoes/src/pages/AdminDashboards.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, FormEvent} from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { Cliente, Atividade, Inscricao } from '../types/index.d';

// Registrar os componentes do Chart.js que vamos usar
ChartJS.register(ArcElement, Tooltip, Legend);

function AdminDashboards() {
  const [totalClientes, setTotalClientes] = useState<number>(0);
  const [totalAtividades, setTotalAtividades] = useState<number>(0);
  const [inscricoesPorStatus, setInscricoesPorStatus] = useState<{ [key: string]: number }>({});
  const [inscricoesPorUnidade, setInscricoesPorUnidade] = useState<{ [key: string]: number }>({});
  const [inscricoesPorAtividade, setInscricoesPorAtividade] = useState<{ [key: string]: number }>({});

  const [allInscricoesData, setAllInscricoesData] = useState<Inscricao[]>([]);
  const [allAtividadesData, setAllAtividadesData] = useState<Atividade[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para a funcionalidade de IA
  const [perguntaIA, setPerguntaIA] = useState<string>('');
  const [respostaIA, setRespostaIA] = useState<string>('');
  const [isLoadingIA, setIsLoadingIA] = useState<boolean>(false);
  const [errorIA, setErrorIA] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const clientesResponse = await fetch(`${apiBaseUrl}/clientes`);
      const clientesData: Cliente[] = await clientesResponse.json();
      setTotalClientes(clientesData.length);

      const atividadesResponse = await fetch(`${apiBaseUrl}/atividades`);
      const atividadesData: Atividade[] = await atividadesResponse.json();
      setTotalAtividades(atividadesData.length);
      setAllAtividadesData(atividadesData);

      const inscricoesResponse = await fetch(`${apiBaseUrl}/inscricoes`);
      const inscricoesData: Inscricao[] = await inscricoesResponse.json();
      setAllInscricoesData(inscricoesData);

    } catch (err: any) {
      console.error('Erro ao buscar dados para o dashboard:', err);
      setError(err.message || 'Não foi possível carregar os dados para o dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Processar os dados APENAS quando allInscricoesData e allAtividadesData estiverem carregados
  useEffect(() => {
    if (!isLoading && allInscricoesData.length > 0 && allAtividadesData.length > 0) {
        const statusCounts: { [key: string]: number } = {
            'pendente': 0,
            'confirmada': 0,
            'cancelada': 0,
        };
        const unidadeCounts: { [key: string]: number } = {};
        const atividadeCounts: { [key: string]: number } = {};

        allInscricoesData.forEach(inscricao => {
            // Contagem por Status
            if (inscricao.statusInscricao in statusCounts) {
                statusCounts[inscricao.statusInscricao]++;
            }

            const atividadeCorrespondente = allAtividadesData.find(ativ => ativ.id === inscricao.idAtividade);
            
            // Contagem por Unidade
            if (atividadeCorrespondente && atividadeCorrespondente.unidade) {
                const unidade = atividadeCorrespondente.unidade;
                unidadeCounts[unidade] = (unidadeCounts[unidade] || 0) + 1;
            }

            // Contagem por Atividade
            if (atividadeCorrespondente && atividadeCorrespondente.nomeAtividade) {
                const nomeAtividade = atividadeCorrespondente.nomeAtividade;
                atividadeCounts[nomeAtividade] = (atividadeCounts[nomeAtividade] || 0) + 1;
            }
        });

        // Atualiza estados com verificação de referência
        setInscricoesPorStatus((prev: { [key: string]: number }) => {
            if (JSON.stringify(prev) === JSON.stringify(statusCounts)) {
                return prev; // Retorna a referência anterior se não houver mudança de valor
            }
            return statusCounts;
        });
        setInscricoesPorUnidade((prev: { [key: string]: number }) => {
            if (JSON.stringify(prev) === JSON.stringify(unidadeCounts)) {
                return prev;
            }
            return unidadeCounts;
        });
        setInscricoesPorAtividade((prev: { [key: string]: number }) => {
            if (JSON.stringify(prev) === JSON.stringify(atividadeCounts)) {
                return prev;
            }
            return atividadeCounts;
        });

    } else if (!isLoading && (allInscricoesData.length === 0 || allAtividadesData.length === 0)) {
        // Se não há dados, garante que as contagens sejam zeradas
        setInscricoesPorStatus({ 'pendente': 0, 'confirmada': 0, 'cancelada': 0 });
        setInscricoesPorUnidade({});
        setInscricoesPorAtividade({});
    }
  }, [isLoading, allInscricoesData, allAtividadesData]);

  // Dados para o Gráfico de Pizza: Inscrições por Atividade
  const pieChartDataAtividade = useMemo(() => ({
    labels: Object.keys(inscricoesPorAtividade),
    datasets: [
      {
        label: 'Inscrições por Atividade',
        data: Object.values(inscricoesPorAtividade),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900', '#C9CBCE', '#A7C7E7', '#F7CAC9', '#92A8D1' // Mais cores para atividades
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900', '#C9CBCE', '#A7C7E7', '#F7CAC9', '#92A8D1'
        ],
        borderWidth: 1,
      },
    ],
  }), [inscricoesPorAtividade]);

  // Dados para o Gráfico de Pizza: Inscrições por Unidade
  const pieChartDataUnidade = useMemo(() => ({
    labels: Object.keys(inscricoesPorUnidade),
    datasets: [
      {
        label: 'Inscrições por Unidade SESC',
        data: Object.values(inscricoesPorUnidade),
        backgroundColor: [
          '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900', '#C9CBCE', '#A7C7E7' // Cores para unidades
        ],
        hoverBackgroundColor: [
          '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900', '#C9CBCE', '#A7C7E7'
        ],
        borderWidth: 1,
      },
    ],
  }), [inscricoesPorUnidade]);

  // --- Funções para a funcionalidade de IA ---
  const handlePerguntaIAChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPerguntaIA(e.target.value);
  };

  const handleSubmitIA = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingIA(true);
    setRespostaIA('');
    setErrorIA(null);

    if (!perguntaIA.trim()) {
      setErrorIA('Por favor, digite uma pergunta para a IA.');
      setIsLoadingIA(false);
      return;
    }

    // --- Concatena os dados dos gráficos/indicadores na pergunta para a IA ---
    let dadosDoDashboardParaIA = ``;

    if (totalClientes > 0) {
      dadosDoDashboardParaIA += `Total de Clientes: ${totalClientes}.\n`;
    }
    if (totalAtividades > 0) {
      dadosDoDashboardParaIA += `Total de Atividades: ${totalAtividades}.\n`;
    }

    // Inscrições por Status
    const statusLabels = Object.keys(inscricoesPorStatus);
    if (statusLabels.length > 0) {
      dadosDoDashboardParaIA += `Inscrições por Status: `;
      statusLabels.forEach(status => {
        dadosDoDashboardParaIA += `${status}: ${inscricoesPorStatus[status]}; `;
      });
      dadosDoDashboardParaIA += `.\n`;
    }

    // Inscrições por Atividade
    const atividadeLabels = Object.keys(inscricoesPorAtividade);
    if (atividadeLabels.length > 0) {
      dadosDoDashboardParaIA += `Inscrições por Atividade: `;
      atividadeLabels.forEach(atividadeNome => {
        dadosDoDashboardParaIA += `${atividadeNome}: ${inscricoesPorAtividade[atividadeNome]}; `;
      });
      dadosDoDashboardParaIA += `.\n`;
    }

    // Inscrições por Unidade
    const unidadeLabels = Object.keys(inscricoesPorUnidade);
    if (unidadeLabels.length > 0) {
      dadosDoDashboardParaIA += `Inscrições por Unidade: `;
      unidadeLabels.forEach(unidadeNome => {
        dadosDoDashboardParaIA += `${unidadeNome}: ${inscricoesPorUnidade[unidadeNome]}; `;
      });
      dadosDoDashboardParaIA += `.\n`;
    }

    // Constrói a pergunta final para a IA
    const perguntaCompletaParaIA = `Dados atuais do sistema:\n${dadosDoDashboardParaIA}\nMinha pergunta é: ${perguntaIA}`;
    // --- Fim da concatenação ---

    try {
      const response = await fetch(`${apiBaseUrl}/gpt/perguntaGPT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pergunta: perguntaCompletaParaIA }), // Envia a pergunta completa
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}: Falha ao gerar resposta da IA.`);
      }

      setRespostaIA(result.resposta);

    } catch (err: any) {
      console.error('Erro ao chamar API de IA no dashboard:', err);
      setErrorIA(err.message || 'Não foi possível obter resposta da IA. Verifique o backend ou sua conexão.');
    } finally {
      setIsLoadingIA(false);
    }
  };

  // Renderização
  return (
    <div className="card-container">
      <h1 className="page-title">Painel de BI - Dashboards</h1>

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando dados do dashboard...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Cards de Métricas Simples (Indicadores) */}
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center', minWidth: '180px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#666', marginBottom: '10px' }}>Total de Clientes</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#319795' }}>{totalClientes}</p>
            </div>
            <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center', minWidth: '180px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#666', marginBottom: '10px' }}>Total de Atividades</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3182CE' }}>{totalAtividades}</p>
            </div>
            {/* Indicadores para total de inscrições por status */}
            <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center', minWidth: '180px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#666', marginBottom: '10px' }}>Inscrições Pendentes</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'rgba(255, 206, 86, 1)' }}>{inscricoesPorStatus['pendente'] || 0}</p>
            </div>
            <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center', minWidth: '180px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#666', marginBottom: '10px' }}>Inscrições Confirmadas</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'rgba(75, 192, 192, 1)' }}>{inscricoesPorStatus['confirmada'] || 0}</p>
            </div>
            <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center', minWidth: '180px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#666', marginBottom: '10px' }}>Inscrições Canceladas</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'rgba(255, 99, 132, 1)' }}>{inscricoesPorStatus['cancelada'] || 0}</p>
            </div>
          </div>

          {/* Gráficos de Pizza */}
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
            {/* Gráfico de Pizza: Inscrições por Atividade */}
            <div style={{ width: '350px', height: '350px', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Inscrições por Atividade</h3>
              <div style={{ flexGrow: 1, position: 'relative', width: '100%' }}> {/* Contêiner flexível para o gráfico */}
                <Pie key={JSON.stringify(pieChartDataAtividade.datasets[0].data)} data={pieChartDataAtividade} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
              {/* Legenda Customizada */}
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem' }}>
                {pieChartDataAtividade.labels.map((label, index) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', marginRight: '15px', marginBottom: '5px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: pieChartDataAtividade.datasets[0].backgroundColor[index], marginRight: '5px', borderRadius: '3px' }}></span>
                    {label} ({pieChartDataAtividade.datasets[0].data[index]})
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Pizza: Inscrições por Unidade SESC */}
            <div style={{ width: '350px', height: '350px', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Inscrições por Unidade SESC</h3>
              <div style={{ flexGrow: 1, position: 'relative', width: '100%' }}> {/* Contêiner flexível para o gráfico */}
                <Pie key={JSON.stringify(pieChartDataUnidade.datasets[0].data)} data={pieChartDataUnidade} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
              {/* Legenda Customizada */}
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem' }}>
                {pieChartDataUnidade.labels.map((label, index) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', marginRight: '15px', marginBottom: '5px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: pieChartDataUnidade.datasets[0].backgroundColor[index], marginRight: '5px', borderRadius: '3px' }}></span>
                    {label} ({pieChartDataUnidade.datasets[0].data[index]})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seção de Geração de Conteúdo por IA */}
          <div className="card-container" style={{ textAlign: 'left', marginTop: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Pergunte à IA (ChatGPT) sobre os dados</h2>
              <form onSubmit={handleSubmitIA} style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                      <label htmlFor="perguntaIA" className="form-label">Sua Pergunta:</label>
                      <textarea
                          id="perguntaIA"
                          className="form-input"
                          rows={3}
                          placeholder="Ex: Qual o total de inscrições confirmadas? Qual a unidade com mais atividades?"
                          value={perguntaIA}
                          onChange={handlePerguntaIAChange}
                          required
                      ></textarea>
                  </div>
                  <button
                      type="submit"
                      className="form-button"
                      style={{ backgroundColor: '#3182CE', color: 'white' }}
                      disabled={isLoadingIA}
                  >
                      {isLoadingIA ? 'Gerando Resposta...' : 'Obter Resposta da IA'}
                  </button>
              </form>

              {errorIA && (
                  <div className="message-box message-error">
                      {errorIA}
                  </div>
              )}

              {respostaIA && (
                  <div className="card-container" style={{ textAlign: 'left', marginTop: '1rem', whiteSpace: 'pre-wrap', backgroundColor: '#e6fffa', border: '1px solid #b2f5ea' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#005662' }}>Resposta Gerada por IA (ChatGPT):</p>
                      <p>{respostaIA}</p>
                  </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboards;