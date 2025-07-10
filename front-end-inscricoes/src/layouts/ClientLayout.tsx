// front-end-inscricoes/src/layouts/ClientLayout.tsx
import React from 'react';
import { Outlet, Link as ReactRouterLink, Routes, Route } from 'react-router-dom'; // Importe Routes e Route
import '../App.css';

// Importar páginas que existirão na área do cliente
import CadastroCliente from '../pages/ClientCadastro';
import ClientInscricoes from '../pages/ClientInscricoes'; // Nova página para "Minhas Inscrições"

function ClientLayout() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <h1 className="navbar-title">
          <ReactRouterLink to="/cliente/cadastro">Cliente SESC</ReactRouterLink>
        </h1>
        <div className="navbar-links">
          <ReactRouterLink to="/cliente/cadastro" className="nav-link">Cadastro de Cliente</ReactRouterLink>
          <ReactRouterLink to="/cliente/inscricoes" className="nav-link">Inscrições</ReactRouterLink>
          <ReactRouterLink to="/" className="nav-link">Sair</ReactRouterLink>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          {/* Rotas aninhadas para a área do cliente */}
          <Route path="/" element={<p>Bem-vindo à Área do Cliente!</p>} /> {/* Rota padrão para /cliente */}
          <Route path="cadastro" element={<CadastroCliente />} />
          <Route path="inscricoes" element={<ClientInscricoes />} />
          {/* ... outras rotas cliente como detalhes de inscrição */}
        </Routes>
      </main>

      <footer className="footer">
        &copy; {new Date().getFullYear()} SESC Inscrições - Área do Cliente.
      </footer>
    </div>
  );
}

export default ClientLayout;