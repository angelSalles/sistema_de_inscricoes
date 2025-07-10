// front-end-inscricoes/src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, Link as ReactRouterLink, Routes, Route } from 'react-router-dom'; // Importe Routes e Route
import '../App.css';

// Importar páginas que existirão na área administrativa
import Clientes from '../pages/AdminListarClientes'; // Gerenciamento de Inscrições é similar a clientes/atividades
import Atividades from '../pages/AdminAtividades';
import Responsaveis from '../pages/AdminResponsaveis';

// Novas páginas placeholder para a área administrativa
import AdminPerfis from '../pages/AdminPerfis'; // Cadastro de Perfis Administrativos
import AdminGerenciarInscricoes from '../pages/AdminGerenciarInscricoes'; // Gerenciamento de Inscrições (pode ser o mesmo que Clientes.tsx inicialmente)
import AdminDashboards from '../pages/AdminDashboards'; // Painéis de BI
import AdminAvaliacoes from '../pages/AdminAvaliacoes'; // Gestão das Avaliações

function AdminLayout() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <h1 className="navbar-title">
          <ReactRouterLink to="/admin">Admin SESC</ReactRouterLink>
        </h1>
        <div className="navbar-links">
          <ReactRouterLink to="/admin/atividades" className="nav-link">Atividades</ReactRouterLink>
          <ReactRouterLink to="/admin/responsaveis" className="nav-link">Responsáveis</ReactRouterLink>
          <ReactRouterLink to="/admin/perfis-administrativos" className="nav-link">Perfis Admin</ReactRouterLink>
          <ReactRouterLink to="/admin/gerenciar-inscricoes" className="nav-link">Gerenciar Inscrições</ReactRouterLink>
          <ReactRouterLink to="/admin/dashboards" className="nav-link">Dashboards (BI)</ReactRouterLink>
          <ReactRouterLink to="/admin/avaliacoes" className="nav-link">Avaliações</ReactRouterLink>
          <ReactRouterLink to="/" className="nav-link">Sair</ReactRouterLink>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          {/* Rotas aninhadas para a área administrativa */}
          <Route path="/" element={<p>Bem-vindo à Área Administrativa!</p>} /> {/* Rota padrão para /admin */}
          <Route path="atividades" element={<Atividades />} />
          <Route path="responsaveis" element={<Responsaveis />} />
          <Route path="perfis-administrativos" element={<AdminPerfis />} />
          <Route path="gerenciar-inscricoes" element={<AdminGerenciarInscricoes />} />
          <Route path="dashboards" element={<AdminDashboards />} />
          <Route path="avaliacoes" element={<AdminAvaliacoes />} />
          {/* ... outras rotas admin como edição/detalhes */}
        </Routes>
      </main>

      <footer className="footer">
        &copy; {new Date().getFullYear()} SESC Inscrições - Área Administrativa.
      </footer>
    </div>
  );
}

export default AdminLayout;