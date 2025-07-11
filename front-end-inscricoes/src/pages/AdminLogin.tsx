// front-end-inscricoes/src/pages/AdminLogin.tsx
import { useState  } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionamento

function AdminLogin() {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate(); // Hook para navegação programática
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSenhaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim() || !senha.trim()) {
      setError('Por favor, preencha email e senha.');
      setIsLoading(false);
      return;
    }

    try {
      // Em um sistema real, você faria uma requisição para uma rota de autenticação.
      // Aqui, vamos simular a busca do perfil pelo email para verificar a senha.
      // ATENÇÃO: Isso não é seguro para produção, pois a senha é comparada no frontend.

      const response = await fetch(`${apiBaseUrl}/perfis`); // Busca todos os perfis
      if (!response.ok) {
        throw new Error('Falha ao carregar perfis para autenticação.');
      }
      const perfis = await response.json();

      // Encontra o perfil que corresponde ao email e senha fornecidos
      const perfilAutenticado = perfis.find(
        (perfil: any) => perfil.email === email && perfil.senha === senha // Simulação insegura
      );

      if (perfilAutenticado) {
        // Autenticação "bem-sucedida" simulada
        // Em um sistema real, você salvaria um token de sessão (JWT)
        // e redirecionaria para o dashboard.
        console.log('Login bem-sucedido (simulado)! Perfil:', perfilAutenticado.nomePerfil);
        // Redireciona para o dashboard admin ou para a rota padrão de admin
        navigate('/admin'); 
      } else {
        setError('Email ou senha inválidos.');
      }

    } catch (err: any) {
      console.error('Erro durante o login:', err);
      setError(err.message || 'Erro ao tentar fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-portal-container"> {/* Usar o estilo da home para centralizar */}
      <div className="card-container" style={{ maxWidth: '400px', padding: '30px', margin: 'auto' }}>
        <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Login Administrativo</h1>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
            Use suas credenciais de perfil administrativo.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="emailLogin" className="form-label">Email:</label>
              <input
                type="email"
                id="emailLogin"
                className="form-input"
                value={email}
                onChange={handleEmailChange}
                placeholder="email@dominio.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="senhaLogin" className="form-label">Senha:</label>
              <input
                type="password"
                id="senhaLogin"
                className="form-input"
                value={senha}
                onChange={handleSenhaChange}
                placeholder="Sua senha"
                required
              />
            </div>

            {error && (
              <div className="message-box message-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="form-button"
              style={{ backgroundColor: '#319795', color: 'white', marginTop: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar na Área Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;