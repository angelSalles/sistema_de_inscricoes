// front-end-inscricoes/src/pages/Home.tsx
import { Link as ReactRouterLink } from 'react-router-dom';
import logoSesc from '../assets/logo-sesc.jpeg';

function Home() {
  return (
    // Container da Home sem header/footer
    <div className="home-portal-container"> {/* Nova classe para o container principal da Home */}
      {/* Logo (mantido como placeholder) */}
      <div className="home-logo-placeholder">
        <img src={logoSesc} alt="Logo SESC" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '100%' }} /> {/* <--- NOVO CÓDIGO */}
      </div>

      {/* Título de Boas-Vindas */}
      <h1 className="home-title">
        Bem-vindo ao <span className="home-title-highlight">Sistema SESC Inscrições</span>
      </h1>

      {/* Subtítulo Descritivo */}
      <p className="home-subtitle">
        Escolha sua área de acesso para continuar.
      </p>

      {/* Botões de Ação para as áreas */}
      <div className="home-buttons-container">
        {/* Link para a Área Administrativa */}
        <ReactRouterLink to="/admin-login" className="home-button primary">
          Área Administrativa
        </ReactRouterLink>

        {/* Link para a Área do Cliente */}
        <ReactRouterLink to="/cliente" className="home-button secondary"> {/* Exemplo: Direciona para o cadastro do cliente */}
          Área do Cliente
        </ReactRouterLink>
      </div>
    </div>
  );
}

export default Home;