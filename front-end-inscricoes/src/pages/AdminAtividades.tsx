// front-end-inscricoes/src/pages/AdminAtividades.tsx
import  { useState, useEffect  } from 'react';
import type { Atividade, Responsavel } from '../types/index.d'; 
import type { ChangeEvent, FormEvent } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';   

function AdminAtividades() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]); // Para popular o dropdown de responsáveis
  const [formData, setFormData] = useState<Omit<Atividade, 'id' | 'dataCriacao'>>({ // Form para adicionar/editar
    nomeAtividade: '',
    descricao: '',
    unidade: '',
    idResponsavel: '',
  });
  const [editingAtividadeId, setEditingAtividadeId] = useState<string | null>(null); // ID da atividade em edição

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false); // Para o botão de salvar
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Funções de Fetch ---
  const fetchAtividades = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/atividades`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data: Atividade[] = await response.json();
      setAtividades(data);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setError('Não foi possível carregar as atividades.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponsaveis = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/responsaveis`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar responsáveis: ${response.statusText}`);
      }
      const data: Responsavel[] = await response.json();
      setResponsaveis(data);
      // Se estiver adicionando uma nova atividade, selecione o primeiro responsável por padrão
      if (!editingAtividadeId && data.length > 0) {
        setFormData(prev => ({ ...prev, idResponsavel: data[0].id }));
      }
    } catch (err) {
      console.error('Erro ao carregar responsáveis:', err);
      setMessage({ type: 'error', text: 'Não foi possível carregar os responsáveis. Cadastre alguns primeiro.' });
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    fetchAtividades();
    fetchResponsaveis();
  }, []);

  // --- Funções de Formulário (Adicionar/Editar) ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setMessage(null);

    if (responsaveis.length === 0 && !formData.idResponsavel) {
      setMessage({ type: 'error', text: 'Não há responsáveis cadastrados. Por favor, cadastre um responsável primeiro.' });
      setIsLoadingForm(false);
      return;
    }
    if (!formData.idResponsavel) { // Garante que um responsável foi selecionado se houver opções
        setFormData(prev => ({ ...prev, idResponsavel: responsaveis[0]?.id || '' }));
        setMessage({ type: 'warning', text: 'Nenhum responsável selecionado. Usando o primeiro disponível.' });
        // Não retorna, deixa o submit seguir com o padrão
    }


    try {
      const method = editingAtividadeId ? 'PUT' : 'POST';
      const url = editingAtividadeId ? `${apiBaseUrl}/atividades/${editingAtividadeId}` : `${apiBaseUrl}/atividades`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}: Falha na operação.`);
      }

      setMessage({ type: 'success', text: `Atividade ${editingAtividadeId ? 'atualizada' : 'cadastrada'} com sucesso!` });
      setFormData({ nomeAtividade: '', descricao: '', unidade: '', idResponsavel: responsaveis[0]?.id || '' }); // Limpa/reseta form
      setEditingAtividadeId(null); // Sai do modo de edição
      fetchAtividades(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao salvar atividade:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar atividade. Tente novamente.' });
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleEditClick = (atividade: Atividade) => {
    setEditingAtividadeId(atividade.id);
    // Preenche o formulário com os dados da atividade para edição
    setFormData({
      nomeAtividade: atividade.nomeAtividade,
      descricao: atividade.descricao,
      unidade: atividade.unidade,
      idResponsavel: atividade.idResponsavel,
    });
    setMessage(null); // Limpa mensagens anteriores
  };

  const handleCancelEdit = () => {
    setEditingAtividadeId(null);
    setFormData({ nomeAtividade: '', descricao: '', unidade: '', idResponsavel: responsaveis[0]?.id || '' }); // Limpa/reseta form
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta atividade? Esta ação é irreversível e pode afetar inscrições relacionadas!')) {
      return;
    }
    setIsLoading(true); // Exibe loading geral enquanto deleta
    setMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/atividades/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Atividade excluída com sucesso!' });
      fetchAtividades(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao excluir atividade:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao excluir atividade. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderização ---
  return (
    <div className="card-container">
      <h1 className="page-title">Gerenciamento de Atividades</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Formulário de Cadastro/Edição */}
      <div className="card-container" style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          {editingAtividadeId ? 'Editar Atividade' : 'Nova Atividade'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="nomeAtividade" className="form-label">Nome da Atividade</label>
              <input
                type="text"
                id="nomeAtividade"
                name="nomeAtividade"
                value={formData.nomeAtividade}
                onChange={handleInputChange}
                placeholder="Ex: Natação Adulto, Yoga para Iniciantes"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao" className="form-label">Descrição</label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                placeholder="Descrição detalhada da atividade."
                required
                className="form-input"
                rows={3}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="unidade" className="form-label">Unidade SESC</label>
              <input
                type="text"
                id="unidade"
                name="unidade"
                value={formData.unidade}
                onChange={handleInputChange}
                placeholder="Ex: Sesc Centro, Sesc Pompéia"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="idResponsavel" className="form-label">Responsável pela Atividade</label>
              {responsaveis.length === 0 ? (
                <p style={{ color: 'orange', fontWeight: 'bold' }}>
                  Não há responsáveis cadastrados. <ReactRouterLink to="/admin/responsaveis" style={{ color: '#3182CE' }}>Cadastre um agora</ReactRouterLink>.
                </p>
              ) : (
                <select
                  id="idResponsavel"
                  name="idResponsavel"
                  value={formData.idResponsavel}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  {responsaveis.map(resp => (
                    <option key={resp.id} value={resp.id}>
                      {resp.nomeResponsavel} ({resp.matricula})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={isLoadingForm || responsaveis.length === 0}
                className="form-button"
                style={{ backgroundColor: '#319795', color: 'white', flexGrow: 1 }}
              >
                {isLoadingForm ? 'Salvando...' : (editingAtividadeId ? 'Atualizar Atividade' : 'Cadastrar Atividade')}
              </button>
              {editingAtividadeId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isLoadingForm}
                  className="form-button"
                  style={{ backgroundColor: '#A0AEC0', color: 'white' }}
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Lista de Atividades */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '2rem', textAlign: 'left' }}>Atividades Cadastradas</h2>
      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando atividades...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : atividades.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Nenhuma atividade cadastrada. Utilize o formulário acima para adicionar.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Unidade</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Responsável</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {atividades.map((atividade) => (
              <tr key={atividade.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{atividade.nomeAtividade}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{atividade.unidade}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {responsaveis.find(resp => resp.id === atividade.idResponsavel)?.nomeResponsavel || 'Não Atribuído'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleEditClick(atividade)}
                    className="form-button"
                    style={{ backgroundColor: '#3182CE', color: 'white', marginRight: '8px', padding: '6px 12px', fontSize: '0.9rem' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(atividade.id)}
                    className="form-button"
                    style={{ backgroundColor: '#E53E3E', color: 'white', padding: '6px 12px', fontSize: '0.9rem' }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminAtividades;