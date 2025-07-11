// front-end-inscricoes/src/pages/ClientCadastro.tsx
import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ClienteFormData, ViaCepResponse, Atividade } from '../types/index.d';

function ClientCadastro() {
  const [formData, setFormData] = useState<ClienteFormData>({
    nomeCliente: '',
    dataNascimento: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [atividadesDisponiveis, setAtividadesDisponiveis] = useState<Atividade[]>([]);
  const [selectedAtividadeId, setSelectedAtividadeId] = useState<string>('');

  const [isLoadingCep, setIsLoadingCep] = useState<boolean>(false);
  const [isLoadingAtividades, setIsLoadingAtividades] = useState<boolean>(true);
  const [isLoadingSave, setIsLoadingSave] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Função para buscar atividades disponíveis
  const fetchAtividades = async () => {
  setIsLoadingAtividades(true);
  try {
    const response = await fetch(`${apiBaseUrl}/atividades`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar atividades: ${response.statusText}`);
    }
    const data: Atividade[] = await response.json();

    console.log('--- Depuração de Atividades ---'); // <--- NOVO CONSOLE.LOG
    console.log('Dados de atividades recebidos do backend:', data); // <--- NOVO CONSOLE.LOG
    if (data.length > 1) {
        console.log('Primeira atividade recebida:', data[1]); // <--- NOVO CONSOLE.LOG
        console.log('Nome da primeira atividade (data[0].nomeAtividade):', data[1].nomeAtividade); // <--- NOVO CONSOLE.LOG
    }
    console.log('--- Fim Depuração de Atividades ---'); // <--- NOVO CONSOLE.LOG

    setAtividadesDisponiveis(data);
    if (data.length > 0) {
      setSelectedAtividadeId(data[0].id);
    } else {
      setSelectedAtividadeId('');
    }
  } catch (error) {
    console.error('Erro ao carregar atividades disponíveis:', error);
    setMessage({ type: 'error', text: 'Não foi possível carregar as atividades disponíveis.' });
    setSelectedAtividadeId('');
  } finally {
    setIsLoadingAtividades(false);
  }
};

  // Carregar atividades ao montar o componente
  useEffect(() => {
    fetchAtividades();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { // Adicionar HTMLSelectElement
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAtividadeChange = (e: ChangeEvent<HTMLSelectElement>) => { // Novo manipulador para o select
    setSelectedAtividadeId(e.target.value);
  };

  const handleBlurCep = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      setMessage({ type: 'error', text: 'Por favor, digite um CEP válido com 8 dígitos.' });
      return;
    }

    setIsLoadingCep(true);
    setMessage(null);
    try {
      const requestUrl = `${apiBaseUrl}/cep/${cep}`;
      const response = await fetch(requestUrl);
      const data: ViaCepResponse = await response.json();

      if (response.ok && !data.erro) {
        setFormData((prevData) => ({
          ...prevData,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.cidade,
          estado: data.estado,
        }));
        setMessage({ type: 'success', text: 'Endereço preenchido automaticamente.' });
      } else {
        setMessage({ type: 'warning', text: data.erro ? 'CEP não encontrado.' : 'Não foi possível encontrar o endereço para este CEP.' });
        setFormData((prevData) => ({
          ...prevData,
          logradouro: '',
          bairro: '',
          cidade: '',
          estado: '',
        }));
      }
    } catch (error) {
      console.error('Erro ao conectar com a API de CEP:', error);
      setMessage({ type: 'error', text: 'Erro de conexão ao buscar CEP. Verifique o backend ou sua conexão de rede.' });
    } finally {
      setIsLoadingCep(false);
    }
  };

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  setIsLoadingSave(true);
  setMessage(null);

  if (!selectedAtividadeId) {
    setMessage({ type: 'error', text: 'Por favor, selecione uma atividade para inscrição.' });
    setIsLoadingSave(false);
    return;
  }

  let clienteId: string | null = null;

  try {
    // 1. Cadastrar o Cliente
    const clienteResponse = await fetch(`${apiBaseUrl}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const clienteResult = await clienteResponse.json();

    if (!clienteResponse.ok) {
      throw new Error(clienteResult.error || 'Ocorreu um erro ao cadastrar o cliente. (Erro no Cliente)');
    }
    clienteId = clienteResult.id;

    // 2. Realizar a Inscrição na Atividade
    const inscricaoResponse = await fetch(`${apiBaseUrl}/inscricoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idCliente: clienteId,
        idAtividade: selectedAtividadeId,
      }),
    });

    // --- NOVO: Tratamento de erro mais específico para a inscrição ---
    if (!inscricaoResponse.ok) {
      const inscricaoErrorData = await inscricaoResponse.text(); // Lê como texto para capturar mensagens de erro simples
      // Tenta fazer parse como JSON se for um JSON, caso contrário usa o texto
      let errorMessage = inscricaoErrorData;
      try {
        const parsedError = JSON.parse(inscricaoErrorData);
        errorMessage = parsedError.error || parsedError.message || inscricaoErrorData;
      } catch (jsonError) {
        // Não é um JSON, usa o texto puro
      }
      throw new Error(errorMessage || `Ocorreu um erro ao realizar a inscrição. Status: ${inscricaoResponse.status}`);
    }
    // --- FIM DO NOVO TRATAMENTO ---

    const inscricaoResult = await inscricaoResponse.json(); // Só faz o parse se for OK

    // Se ambos foram bem-sucedidos
    setMessage({ type: 'success', text: `Cliente e inscrição cadastrados com sucesso! ID do Cliente: ${clienteId}, ID da Inscrição: ${inscricaoResult.id}` });
  } catch (error: any) {
    console.error('Erro no processo de cadastro/inscrição:', error);
    // Exibe a mensagem de erro detalhada vinda do backend ou uma genérica
    setMessage({ type: 'error', text: error.message || 'Erro de rede ou no servidor durante o cadastro e inscrição.' });
  } finally {
    setIsLoadingSave(false);
  }
};

  return (
    <div className="card-container" style={{ maxWidth: '600px', margin: 'auto', marginTop: '32px' }}>
      <h2 className="page-title">Cadastro de Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {message && (
            <div className={`message-box message-${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Campos do Cliente (já existentes) */}
          <div className="form-group">
            <label htmlFor="nomeCliente" className="form-label">Nome Completo</label>
            <input
              type="text"
              id="nomeCliente"
              name="nomeCliente"
              value={formData.nomeCliente}
              onChange={handleChange}
              placeholder="Nome do Cliente"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataNascimento" className="form-label">Data de Nascimento</label>
            <input
              type="date"
              id="dataNascimento"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cep" className="form-label">CEP</label>
            <input
              type="text"
              id="cep"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              onBlur={handleBlurCep}
              placeholder="Ex: 69000-000"
              maxLength={9}
              disabled={isLoadingCep}
              className="form-input"
            />
            {isLoadingCep && <p style={{ fontSize: '0.8em', color: '#555', marginTop: '4px' }}>Buscando CEP...</p>}
          </div>

          <div className="form-group">
            <label htmlFor="logradouro" className="form-label">Logradouro</label>
            <input
              type="text"
              id="logradouro"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              placeholder="Rua, Avenida, etc."
              required
              readOnly
              className="form-input"
              style={{ backgroundColor: formData.logradouro ? '#f0f0f0' : 'white' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="numero" className="form-label">Número</label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Número da residência"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bairro" className="form-label">Bairro</label>
            <input
              type="text"
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              placeholder="Nome do Bairro"
              required
              readOnly
              className="form-input"
              style={{ backgroundColor: formData.bairro ? '#f0f0f0' : 'white' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cidade" className="form-label">Cidade</label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Nome da Cidade"
              required
              readOnly
              className="form-input"
              style={{ backgroundColor: formData.cidade ? '#f0f0f0' : 'white' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado" className="form-label">Estado</label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              placeholder="UF"
              maxLength={2}
              required
              readOnly
              className="form-input"
              style={{ backgroundColor: formData.estado ? '#f0f0f0' : 'white' }}
            />
          </div>

          {/* Seleção de Atividade para Inscrição */}
          <div className="form-group">
            <label htmlFor="atividade" className="form-label">Selecionar Atividade para Inscrição</label>
            {isLoadingAtividades ? (
              <p>Carregando atividades...</p>
            ) : atividadesDisponiveis.length === 0 ? (
              <p style={{ color: 'orange', fontWeight: 'bold' }}>Nenhuma atividade disponível no momento.</p>
            ) : (
              <select
                id="atividade"
                name="atividade"
                value={selectedAtividadeId}
                onChange={handleAtividadeChange}
                required
                className="form-input" // Reutiliza o estilo do input
              >
                {atividadesDisponiveis.map((atividade) => (
                  <option key={atividade.id} value={atividade.id}>
                    {atividade.nomeAtividade} - {atividade.unidade}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoadingSave || isLoadingAtividades || atividadesDisponiveis.length === 0} // Desabilita se não houver atividades
            className="form-button"
            style={{ backgroundColor: '#319795', color: 'white' }}
          >
            {isLoadingSave ? 'Cadastrando e Inscrevendo...' : 'Cadastrar Cliente e Inscrever'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClientCadastro;