// front-end-inscricoes/src/pages/AdminResponsaveis.tsx
import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Responsavel } from '../types/index.d'; // Importar a interface Responsavel

function AdminResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [formData, setFormData] = useState<Omit<Responsavel, 'id' | 'dataCriacao'>>({ // Form para adicionar/editar
    nomeResponsavel: '',
    matricula: '',
  });
  const [editingResponsavelId, setEditingResponsavelId] = useState<string | null>(null); // ID do responsável em edição

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false); // Para o botão de salvar
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Funções de Fetch ---
  const fetchResponsaveis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/responsaveis`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data: Responsavel[] = await response.json();
      setResponsaveis(data);
    } catch (err) {
      console.error('Erro ao buscar responsáveis:', err);
      setError('Não foi possível carregar os responsáveis.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar responsáveis ao montar
  useEffect(() => {
    fetchResponsaveis();
  }, []);

  // --- Funções de Formulário (Adicionar/Editar) ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setMessage(null);

    try {
      const method = editingResponsavelId ? 'PUT' : 'POST';
      const url = editingResponsavelId ? `${apiBaseUrl}/responsaveis/${editingResponsavelId}` : `${apiBaseUrl}/responsaveis`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}: Falha na operação.`);
      }

      setMessage({ type: 'success', text: `Responsável ${editingResponsavelId ? 'atualizado' : 'cadastrado'} com sucesso!` });
      setFormData({ nomeResponsavel: '', matricula: '' }); // Limpa/reseta form
      setEditingResponsavelId(null); // Sai do modo de edição
      fetchResponsaveis(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao salvar responsável:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar responsável. Tente novamente.' });
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleEditClick = (responsavel: Responsavel) => {
    setEditingResponsavelId(responsavel.id);
    // Preenche o formulário com os dados do responsável para edição
    setFormData({
      nomeResponsavel: responsavel.nomeResponsavel,
      matricula: responsavel.matricula,
    });
    setMessage(null); // Limpa mensagens anteriores
  };

  const handleCancelEdit = () => {
    setEditingResponsavelId(null);
    setFormData({ nomeResponsavel: '', matricula: '' }); // Limpa/reseta form
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este responsável?')) {
      return;
    }
    setIsLoading(true); // Exibe loading geral enquanto deleta
    setMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/responsaveis/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Responsável excluído com sucesso!' });
      fetchResponsaveis(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao excluir responsável:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao excluir responsável. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderização ---
  return (
    <div className="card-container">
      <h1 className="page-title">Gerenciamento de Responsáveis</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Formulário de Cadastro/Edição */}
      <div className="card-container" style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          {editingResponsavelId ? 'Editar Responsável' : 'Novo Responsável'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="nomeResponsavel" className="form-label">Nome do Responsável</label>
              <input
                type="text"
                id="nomeResponsavel"
                name="nomeResponsavel"
                value={formData.nomeResponsavel}
                onChange={handleInputChange}
                placeholder="Nome completo do responsável"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="matricula" className="form-label">Matrícula</label>
              <input
                type="text"
                id="matricula"
                name="matricula"
                value={formData.matricula}
                onChange={handleInputChange}
                placeholder="Matrícula do responsável"
                required
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={isLoadingForm}
                className="form-button"
                style={{ backgroundColor: '#319795', color: 'white', flexGrow: 1 }}
              >
                {isLoadingForm ? 'Salvando...' : (editingResponsavelId ? 'Atualizar Responsável' : 'Cadastrar Responsável')}
              </button>
              {editingResponsavelId && (
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

      {/* Lista de Responsáveis */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '2rem', textAlign: 'left' }}>Responsáveis Cadastrados</h2>
      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando responsáveis...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : responsaveis.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Nenhum responsável cadastrado. Utilize o formulário acima para adicionar.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Matrícula</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {responsaveis.map((responsavel) => (
              <tr key={responsavel.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{responsavel.nomeResponsavel}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{responsavel.matricula}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleEditClick(responsavel)}
                    className="form-button"
                    style={{ backgroundColor: '#3182CE', color: 'white', marginRight: '8px', padding: '6px 12px', fontSize: '0.9rem' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(responsavel.id)}
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

export default AdminResponsaveis;