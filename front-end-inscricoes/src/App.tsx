// front-end-inscricoes/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';

// Importar a página Home (que será a landing page sem header/footer)
import Home from './pages/Home';

// Importar os novos componentes de Layout para as áreas
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';

// Importar o CSS principal (ainda para estilos gerais e de componentes de formulário/card)
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para a página inicial (landing page sem layout) */}
        <Route path="/" element={<Home />} />

        {/* Rotas da Área Administrativa */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Rotas da Área do Cliente */}
        <Route path="/cliente/*" element={<ClientLayout />} />

        {/* Você pode adicionar uma rota 404 aqui no futuro */}
      </Routes>
    </Router>
  );
}

export default App;