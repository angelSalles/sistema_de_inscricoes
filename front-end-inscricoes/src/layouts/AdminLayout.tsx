// front-end-inscricoes/src/layouts/AdminLayout.tsx
import { Link as ReactRouterLink, Routes, Route, useNavigate } from 'react-router-dom';
import '../App.css';

// Importar páginas administrativas
import AdminAtividades from '../pages/AdminAtividades';
import AdminAvaliacoes from '../pages/AdminAvaliacoes';
import AdminDashboards from '../pages/AdminDashboards';
import AdminGerenciarInscricoes from '../pages/AdminGerenciarInscricoes';
import AdminListarClientes from '../pages/AdminListarClientes';
import AdminPerfis from '../pages/AdminPerfis';
import AdminResponsaveis from '../pages/AdminResponsaveis';
import AdminLogin from '../pages/AdminLogin';
// AdminGeradorIA foi integrado ao Dashboard e removido como página separada

function AdminLayout() {
  const navigate = useNavigate(); // Hook para navegação programática

  const handleLogout = () => { // Função para fazer logout
    localStorage.removeItem('isAdminLoggedIn'); // Remove a flag de autenticação simulada
    navigate('/'); // Redireciona para a Home
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1 className="navbar-title">
          <ReactRouterLink to="/admin">Admin SESC</ReactRouterLink>
        </h1>
        <div className="navbar-links">
          {/* Links para os módulos administrativos */}
          <ReactRouterLink to="/admin/listar-clientes" className="nav-link">Clientes</ReactRouterLink>
          <ReactRouterLink to="/admin/atividades" className="nav-link">Atividades</ReactRouterLink>
          <ReactRouterLink to="/admin/responsaveis" className="nav-link">Responsáveis</ReactRouterLink>
          <ReactRouterLink to="/admin/perfis-administrativos" className="nav-link">Perfis Admin</ReactRouterLink>
          <ReactRouterLink to="/admin/gerenciar-inscricoes" className="nav-link">Gerenciar Inscrições</ReactRouterLink>
          <ReactRouterLink to="/admin/dashboards" className="nav-link">Dashboards (BI)</ReactRouterLink>
          <ReactRouterLink to="/admin/avaliacoes" className="nav-link">Avaliações</ReactRouterLink>
          
          {/* Botão de Sair (Logout) */}
          <button 
            onClick={handleLogout} 
            className="nav-link" 
            style={{ background: 'none', border: 'none', color: '#404040', cursor: 'pointer', fontSize: '1rem', marginLeft: '1rem' }}
          >
            Sair
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          {/* Rota padrão para /admin se nenhuma sub-rota for especificada */}
          <Route path="/" element={<p style={{ textAlign: 'center' }}>Bem-vindo à Área Administrativa! Por favor, selecione uma opção no menu acima.</p>} />
          
          {/* Rotas aninhadas para os módulos administrativos */}
          <Route path="admin-login" element={<AdminLogin />} />
          <Route path="listar-clientes" element={<AdminListarClientes />} />
          <Route path="atividades" element={<AdminAtividades />} />
          <Route path="responsaveis" element={<AdminResponsaveis />} />
          <Route path="perfis-administrativos" element={<AdminPerfis />} />
          <Route path="gerenciar-inscricoes" element={<AdminGerenciarInscricoes />} />
          <Route path="dashboards" element={<AdminDashboards />} />
          <Route path="avaliacoes" element={<AdminAvaliacoes />} />
        </Routes>
      </main>

      <footer className="footer">
        &copy; {new Date().getFullYear()} SESC Inscrições - Área Administrativa.
      </footer>
    </div>
  );
}

export default AdminLayout;