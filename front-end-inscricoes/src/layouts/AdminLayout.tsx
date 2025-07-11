// front-end-inscricoes/src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, Link as ReactRouterLink, Routes, Route } from 'react-router-dom';
import '../App.css';

// Importar páginas administrativas
import AdminAtividades from '../pages/AdminAtividades';
import AdminAvaliacoes from '../pages/AdminAvaliacoes'; // <--- Importe este componente
import AdminDashboards from '../pages/AdminDashboards';
import AdminGerenciarInscricoes from '../pages/AdminGerenciarInscricoes';
import AdminListarClientes from '../pages/AdminListarClientes';
import AdminPerfis from '../pages/AdminPerfis';
import AdminResponsaveis from '../pages/AdminResponsaveis';

function AdminLayout() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <h1 className="navbar-title">
          <ReactRouterLink to="/admin">Admin SESC</ReactRouterLink>
        </h1>
        <div className="navbar-links">
          <ReactRouterLink to="/admin/listar-clientes" className="nav-link">Clientes</ReactRouterLink>
          <ReactRouterLink to="/admin/atividades" className="nav-link">Atividades</ReactRouterLink>
          <ReactRouterLink to="/admin/responsaveis" className="nav-link">Responsáveis</ReactRouterLink>
          <ReactRouterLink to="/admin/perfis-administrativos" className="nav-link">Perfis Admin</ReactRouterLink>
          <ReactRouterLink to="/admin/gerenciar-inscricoes" className="nav-link">Gerenciar Inscrições</ReactRouterLink>
          <ReactRouterLink to="/admin/dashboards" className="nav-link">Dashboards (BI)</ReactRouterLink>
          <ReactRouterLink to="/admin/avaliacoes" className="nav-link">Avaliações</ReactRouterLink> {/* <--- Link para Avaliações */}
          <ReactRouterLink to="/" className="nav-link">Sair</ReactRouterLink>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<p>Bem-vindo à Área Administrativa! Por favor, selecione uma opção no menu acima.</p>} />
          {/* Rotas aninhadas para a área administrativa */}
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