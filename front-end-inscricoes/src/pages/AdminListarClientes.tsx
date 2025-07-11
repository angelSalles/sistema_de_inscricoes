// front-end-inscricoes/src/pages/AdminListarClientes.tsx
import { useState, useEffect } from 'react';
import type { Cliente, ClienteFormData } from '../types/index.d'; // Importar Cliente e ClienteFormData
import type { ChangeEvent, FormEvent } from 'react';

function AdminListarClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState<Omit<ClienteFormData, 'cep'> & { id?: string }>({ // Form para edição, ID opcional
    nomeCliente: '',
    dataNascimento: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [editingClienteId, setEditingClienteId] = useState<string | null>(null); // ID do cliente em edição

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false); // Para o botão de salvar
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Funções de Fetch ---
  const fetchClientes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/clientes`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data: Cliente[] = await response.json();
      setClientes(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Não foi possível carregar os clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar clientes ao montar
  useEffect(() => {
    fetchClientes();
  }, []);

  // --- Funções de Formulário (Editar) ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setMessage(null);

    if (!editingClienteId) {
      setMessage({ type: 'error', text: 'Nenhum cliente selecionado para edição.' });
      setIsLoadingForm(false);
      return;
    }

    try {
      const url = `${apiBaseUrl}/clientes/${editingClienteId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // FormData já contém os campos corretos
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}: Falha ao atualizar cliente.`);
      }

      setMessage({ type: 'success', text: 'Cliente atualizado com sucesso!' });
      setEditingClienteId(null); // Sai do modo de edição
      // Limpa o formulário, mas o essencial é que saímos do modo de edição
      setFormData({
        nomeCliente: '', dataNascimento: '', logradouro: '', numero: '',
        bairro: '', cidade: '', estado: ''
      });
      fetchClientes(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar cliente. Tente novamente.' });
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleEditClick = (cliente: Cliente) => {
    setEditingClienteId(cliente.id);
    // Preenche o formulário com os dados do cliente para edição
    setFormData({
      nomeCliente: cliente.nomeCliente,
      dataNascimento: cliente.dataNascimento,
      logradouro: cliente.logradouro,
      numero: cliente.numero,
      bairro: cliente.bairro,
      cidade: cliente.cidade,
      estado: cliente.estado,
    });
    setMessage(null); // Limpa mensagens anteriores
  };

  const handleCancelEdit = () => {
    setEditingClienteId(null);
    setFormData({
      nomeCliente: '', dataNascimento: '', logradouro: '', numero: '',
      bairro: '', cidade: '', estado: ''
    }); // Limpa/reseta form
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente? Esta ação é irreversível e removerá todas as inscrições relacionadas a ele!')) {
      return;
    }
    setIsLoading(true); // Exibe loading geral enquanto deleta
    setMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/clientes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Cliente excluído com sucesso!' });
      fetchClientes(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao excluir cliente:', err);
      setMessage({ type: 'error', text: err.message || 'Erro ao excluir cliente. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderização ---
  return (
    <div className="card-container">
      <h1 className="page-title">Gerenciamento de Clientes</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Formulário de Edição (exibido apenas se um cliente estiver em edição) */}
      {editingClienteId && (
        <div className="card-container" style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Editar Cliente: {formData.nomeCliente}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="nomeCliente" className="form-label">Nome Completo</label>
                <input
                  type="text"
                  id="nomeCliente"
                  name="nomeCliente"
                  value={formData.nomeCliente}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="logradouro" className="form-label">Logradouro</label>
                <input
                  type="text"
                  id="logradouro"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleInputChange}
                  placeholder="Rua, Avenida, etc."
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="numero" className="form-label">Número</label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  placeholder="Nome do Bairro"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cidade" className="form-label">Cidade</label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  placeholder="Nome da Cidade"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado" className="form-label">Estado</label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  placeholder="UF"
                  maxLength={2}
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
                  {isLoadingForm ? 'Atualizando...' : 'Atualizar Cliente'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isLoadingForm}
                  className="form-button"
                  style={{ backgroundColor: '#A0AEC0', color: 'white' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Clientes */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '2rem', textAlign: 'left' }}>Clientes Cadastrados</h2>
      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Carregando clientes...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : clientes.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Nenhum cliente cadastrado ainda.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Data Nasc.</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>CEP</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Cidade/Estado</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{cliente.nomeCliente}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{cliente.dataNascimento}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{cliente.cep}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{`${cliente.cidade}/${cliente.estado}`}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleEditClick(cliente)}
                    className="form-button"
                    style={{ backgroundColor: '#3182CE', color: 'white', marginRight: '8px', padding: '6px 12px', fontSize: '0.9rem' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
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

export default AdminListarClientes;