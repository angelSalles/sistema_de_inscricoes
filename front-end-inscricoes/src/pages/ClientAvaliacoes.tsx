// front-end-inscricoes/src/pages/ClientAvaliacoes.tsx
import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent  } from 'react';
import type { Cliente, Atividade, Avaliacao } from '../types/index.d'; // Importar interfaces

function ClientAvaliacoes() {
  const [clientes, setClientes] = useState<Cliente[]>([]); // Para dropdown de clientes
  const [atividades, setAtividades] = useState<Atividade[]>([]); // Para dropdown de atividades
  const [formData, setFormData] = useState<Omit<Avaliacao, 'id' | 'dataCriacao' | 'respostaIA' | 'dataRespostaIA' | 'nomeCliente' | 'nomeAtividade'>>({
    idCliente: '',
    idAtividade: '', // Opcional, mas útil para o formulário
    tipoAvaliacao: 'elogio', // Valor padrão
    textoAvaliacao: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true); // Para carregar clientes/atividades
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false); // Para o envio do formulário
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Funções de Fetch ---
  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [clientesRes, atividadesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/clientes`),
        fetch(`${apiBaseUrl}/atividades`),
      ]);

      const clientesData: Cliente[] = await clientesRes.json();
      const atividadesData: Atividade[] = await atividadesRes.json();

      setClientes(clientesData);
      setAtividades(atividadesData);

      // Pré-selecionar o primeiro cliente e atividade se existirem
      if (clientesData.length > 0) {
        setFormData(prev => ({ ...prev, idCliente: clientesData[0].id }));
      }
      if (atividadesData.length > 0) {
        setFormData(prev => ({ ...prev, idAtividade: atividadesData[0].id }));
      }

    } catch (err: any) {
      console.error('Erro ao buscar dados iniciais para avaliações:', err);
      setError('Não foi possível carregar clientes e atividades.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- Funções de Formulário ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setMessage(null);

    // Validações adicionais
    if (clientes.length === 0 || !formData.idCliente) {
        setMessage({ type: 'error', text: 'Nenhum cliente disponível para enviar avaliação.' });
        setIsLoadingForm(false);
        return;
    }
    if (!formData.tipoAvaliacao || !formData.textoAvaliacao.trim()) {
        setMessage({ type: 'error', text: 'Por favor, selecione um tipo de avaliação e digite seu comentário.' });
        setIsLoadingForm(false);
        return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}: Falha ao enviar avaliação.`);
      }

      setMessage({ type: 'success', text: 'Avaliação enviada com sucesso! Agradecemos seu feedback.' });
      // Limpa o formulário após o sucesso
      setFormData({
        idCliente: clientes[0]?.id || '', // Reset para o primeiro cliente ou vazio
        idAtividade: atividades[0]?.id || '', // Reset para a primeira atividade ou vazio
        tipoAvaliacao: 'elogio',
        textoAvaliacao: '',
      });

    } catch (err: any) {
      console.error('Erro ao enviar avaliação:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao enviar avaliação. Tente novamente.' });
    } finally {
      setIsLoadingForm(false);
    }
  };

  // --- Renderização ---
  return (
    <div className="card-container">
      <h1 className="page-title">Registrar Avaliação</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando dados para o formulário de avaliação...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Seleção de Cliente */}
            <div className="form-group">
              <label htmlFor="idCliente" className="form-label">Seu Nome (Cliente)</label>
              {clientes.length === 0 ? (
                <p style={{ color: 'orange', fontWeight: 'bold' }}>Nenhum cliente cadastrado. Cadastre um cliente primeiro para enviar avaliações.</p>
              ) : (
                <select
                  id="idCliente"
                  name="idCliente"
                  value={formData.idCliente}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  {clientes.map(cli => (
                    <option key={cli.id} value={cli.id}>
                      {cli.nomeCliente}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Seleção de Atividade (Opcional) */}
            <div className="form-group">
              <label htmlFor="idAtividade" className="form-label">Atividade Avaliada (Opcional)</label>
              <select
                id="idAtividade"
                name="idAtividade"
                value={formData.idAtividade}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">-- Selecione (Opcional) --</option>
                {atividades.length === 0 ? (
                  <option value="" disabled>Nenhuma atividade cadastrada</option>
                ) : (
                  atividades.map(ativ => (
                    <option key={ativ.id} value={ativ.id}>
                      {ativ.nomeAtividade} - {ativ.unidade}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Seleção do Tipo de Avaliação */}
            <div className="form-group">
              <label htmlFor="tipoAvaliacao" className="form-label">Tipo de Avaliação</label>
              <select
                id="tipoAvaliacao"
                name="tipoAvaliacao"
                value={formData.tipoAvaliacao}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="elogio">Elogio</option>
                <option value="sugestao">Sugestão</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            {/* Comentário/Texto da Avaliação */}
            <div className="form-group">
              <label htmlFor="textoAvaliacao" className="form-label">Seu Comentário</label>
              <textarea
                id="textoAvaliacao"
                name="textoAvaliacao"
                value={formData.textoAvaliacao}
                onChange={handleInputChange}
                placeholder="Deixe seu elogio, sugestão ou crítica aqui."
                required
                className="form-input"
                rows={4}
              ></textarea>
            </div>

            <button
              type="submit"
              className="form-button"
              style={{ backgroundColor: '#319795', color: 'white' }}
              disabled={isLoadingForm || clientes.length === 0} // Desabilita se estiver enviando ou sem clientes
            >
              {isLoadingForm ? 'Enviando Avaliação...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ClientAvaliacoes;