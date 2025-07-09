// front-end-inscricoes/src/App.jsx
import { Box, Flex, Link, Button, Heading } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Link as ReactRouterLink } from 'react-router-dom';

// Componentes que vamos criar (apenas placeholders por enquanto)
import Clientes from './pages/Clientes';
import Atividades from './pages/Atividades';
import Responsaveis from './pages/Responsaveis';
import Inscricoes from './pages/Inscricoes';
import Home from './pages/Home';
import CadastroCliente from './pages/CadastroCliente'; 

function App() {
  return (
    <Router>
      <Flex direction="column" minH="100vh">
        {/* Barra de Navegação (Navbar) */}
        <Flex
          as="nav"
          bg="teal.500"
          color="white"
          p={4}
          justify="space-between"
          align="center"
        >
          <Heading as="h1" size="md">
            <Link as={ReactRouterLink} to="/">SESC Inscrições</Link>
          </Heading>
          <Flex>
            <Link as={ReactRouterLink} to="/" mr={4}>Início</Link>
            <Link as={ReactRouterLink} to="/clientes" mr={4}>Clientes</Link>
            <Link as={ReactRouterLink} to="/atividades" mr={4}>Atividades</Link>
            <Link as={ReactRouterLink} to="/responsaveis" mr={4}>Responsáveis</Link>
            <Link as={ReactRouterLink} to="/inscricoes" mr={4}>Inscrições</Link>
            <Link as={ReactRouterLink} to="/cadastro-cliente">Cadastrar Cliente</Link> {/* Adicionar link para cadastro de cliente */}
          </Flex>
        </Flex>

        {/* Conteúdo Principal */}
        <Box flex="1" p={4}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/atividades" element={<Atividades />} />
            <Route path="/responsaveis" element={<Responsaveis />} />
            <Route path="/inscricoes" element={<Inscricoes />} />
            <Route path="/cadastro-cliente" element={<CadastroCliente />} /> {/* Rota para o cadastro de cliente */}
            {/* Futuramente: Rotas para editar, ver detalhes, etc. */}
          </Routes>
        </Box>

        {/* Rodapé (Opcional) */}
        <Box as="footer" bg="gray.700" color="white" p={4} textAlign="center">
          &copy; {new Date().getFullYear()} SESC Inscrições. Todos os direitos reservados.
        </Box>
      </Flex>
    </Router>
  );
}

export default App;