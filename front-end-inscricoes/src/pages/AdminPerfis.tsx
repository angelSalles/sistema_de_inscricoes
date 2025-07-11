// front-end-inscricoes/src/pages/AdminPerfis.tsx
import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { PerfilAdmin } from "../types/index.d";

function AdminPerfis() {
  const [perfis, setPerfis] = useState<PerfilAdmin[]>([]);
  // Tipagem do formData: a propriedade 'senha' é opcional no tipo do estado,
  // permitindo a manipulação e a omissão segura na requisição.
  const [formData, setFormData] = useState<
    Omit<PerfilAdmin, "id" | "dataCriacao"> & { senha?: string }
  >({
    nomePerfil: "",
    email: "",
    senha: "",
  });
  const [editingPerfilId, setEditingPerfilId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Funções de Fetch ---
  const fetchPerfis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/perfis`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data: PerfilAdmin[] = await response.json();
      setPerfis(data);
    } catch (err: any) {
      console.error("Erro ao buscar perfis:", err);
      setError("Não foi possível carregar os perfis administrativos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfis();
  }, []);

  // --- Funções de Formulário (Adicionar/Editar) ---
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setMessage(null);

    try {
      const method = editingPerfilId ? "PUT" : "POST";
      const url = editingPerfilId
        ? `${apiBaseUrl}/perfis/${editingPerfilId}`
        : `${apiBaseUrl}/perfis`;

      // Criação direta do objeto a ser enviado
      const dataToSend: Partial<Omit<PerfilAdmin, "id" | "dataCriacao">> = {
        nomePerfil: formData.nomePerfil,
        email: formData.email,
        ...(formData.senha && { senha: formData.senha }), // só adiciona se existir
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Erro ${response.status}: Falha na operação.`
        );
      }

      setMessage({
        type: "success",
        text: `Perfil ${
          editingPerfilId ? "atualizado" : "cadastrado"
        } com sucesso!`,
      });

      setFormData({
        nomePerfil: "",
        email: "",
        senha: "",
      });
      setEditingPerfilId(null);
      fetchPerfis();

      if (method === "POST") {
        localStorage.setItem("isAdminLoggedIn", "true");
      }
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err);
      setMessage({
        type: "error",
        text: err.message || "Erro ao salvar perfil. Tente novamente.",
      });
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleEditClick = (perfil: PerfilAdmin) => {
    setEditingPerfilId(perfil.id);
    // Preenche o formulário com os dados do perfil para edição
    setFormData({
      nomePerfil: perfil.nomePerfil,
      email: perfil.email,
      senha: "", // NUNCA preenche a senha ao editar por segurança
    });
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingPerfilId(null);
    setFormData({
      nomePerfil: "",
      email: "",
      senha: "",
    });
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este perfil administrativo?"
      )
    ) {
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/perfis/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir: ${response.statusText}`);
      }

      setMessage({ type: "success", text: "Perfil excluído com sucesso!" });
      fetchPerfis();
    } catch (err: any) {
      console.error("Erro ao excluir perfil:", err);
      setMessage({
        type: "error",
        text: err.message || "Erro ao excluir perfil. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderização ---
  return (
    <div className="card-container">
      <h1 className="page-title">Gerenciamento de Perfis Administrativos</h1>

      {message && (
        <div className={`message-box message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Formulário de Cadastro/Edição */}
      <div
        className="card-container"
        style={{ marginBottom: "2rem", textAlign: "left" }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          {editingPerfilId ? "Editar Perfil" : "Novo Perfil Administrativo"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="form-group">
              <label htmlFor="nomePerfil" className="form-label">
                Nome do Perfil
              </label>
              <input
                type="text"
                id="nomePerfil"
                name="nomePerfil"
                value={formData.nomePerfil}
                onChange={handleInputChange}
                placeholder="Ex: Administrador Geral"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@dominio.com"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha" className="form-label">
                Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                required={!editingPerfilId} // Obrigatório apenas no cadastro
                className="form-input"
              />
              {!editingPerfilId && ( // Dica de senha no cadastro
                <small
                  style={{
                    color: "#666",
                    fontSize: "0.85rem",
                    marginTop: "5px",
                    display: "block",
                  }}
                >
                  Mínimo 6 caracteres (apenas para simulação).
                </small>
              )}
              {editingPerfilId && ( // Dica de senha na edição
                <small
                  style={{
                    color: "#666",
                    fontSize: "0.85rem",
                    marginTop: "5px",
                    display: "block",
                  }}
                >
                  Deixe em branco para não alterar a senha.
                </small>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
              <button
                type="submit"
                disabled={isLoadingForm}
                className="form-button"
                style={{
                  backgroundColor: "#319795",
                  color: "white",
                  flexGrow: 1,
                }}
              >
                {isLoadingForm
                  ? "Salvando..."
                  : editingPerfilId
                  ? "Atualizar Perfil"
                  : "Cadastrar Perfil"}
              </button>
              {editingPerfilId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isLoadingForm}
                  className="form-button"
                  style={{ backgroundColor: "#A0AEC0", color: "white" }}
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Lista de Perfis Administrativos */}
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "1rem",
          marginTop: "2rem",
          textAlign: "left",
        }}
      >
        Perfis Cadastrados
      </h2>
      {isLoading ? (
        <p style={{ textAlign: "center" }}>Carregando perfis...</p>
      ) : error ? (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      ) : perfis.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          Nenhum perfil administrativo cadastrado. Utilize o formulário acima
          para adicionar.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Nome do Perfil
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Permissões
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {perfis.map((perfil) => (
              <tr key={perfil.id}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {perfil.nomePerfil}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {perfil.email}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleEditClick(perfil)}
                    className="form-button"
                    style={{
                      backgroundColor: "#3182CE",
                      color: "white",
                      marginRight: "8px",
                      padding: "6px 12px",
                      fontSize: "0.9rem",
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(perfil.id)}
                    className="form-button"
                    style={{
                      backgroundColor: "#E53E3E",
                      color: "white",
                      padding: "6px 12px",
                      fontSize: "0.9rem",
                    }}
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

export default AdminPerfis;
