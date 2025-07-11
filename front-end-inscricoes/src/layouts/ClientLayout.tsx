import { Link as ReactRouterLink, Routes, Route } from 'react-router-dom';
import '../App.css';

import ClientCadastro from '../pages/ClientCadastro';
import ClientInscricoes from '../pages/ClientInscricoes';
import ClientAvaliacoes from '../pages/ClientAvaliacoes'; 
import ClientHistoricoAvaliacoes from '../pages/ClientHistoricoAvaliacoes'; 

function ClientLayout() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <h1 className="navbar-title">
          <ReactRouterLink to="/cliente/cadastro">Cliente SESC</ReactRouterLink>
        </h1>
        <div className="navbar-links">
          <ReactRouterLink to="/cliente/cadastro" className="nav-link">Cadastrar Cliente</ReactRouterLink>
          <ReactRouterLink to="/cliente/inscricoes" className="nav-link">Inscrições</ReactRouterLink>
          <ReactRouterLink to="/cliente/avaliacoes" className="nav-link">Registrar Avaliação</ReactRouterLink> {/* <--- Link para o FORMULÁRIO */}
          <ReactRouterLink to="/cliente/historico-avaliacoes" className="nav-link">Histórico de Avaliações</ReactRouterLink> {/* <--- NOVO LINK PARA O HISTÓRICO */}
          <ReactRouterLink to="/" className="nav-link">Sair</ReactRouterLink>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<p>Bem-vindo à Área do Cliente! Por favor, selecione uma opção no menu acima.</p>} />
          <Route path="cadastro" element={<ClientCadastro />} />
          <Route path="inscricoes" element={<ClientInscricoes />} />
          <Route path="avaliacoes" element={<ClientAvaliacoes />} /> 
          <Route path="historico-avaliacoes" element={<ClientHistoricoAvaliacoes />} /> 
        </Routes>
      </main>

      <footer className="footer">
        &copy; {new Date().getFullYear()} SESC Inscrições - Área do Cliente.
      </footer>
    </div>
  );
}

export default ClientLayout;