// front-end-inscricoes/src/pages/Home.jsx
import { Box, Heading, Text } from '@chakra-ui/react';

function Home() {
  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Heading mb={4}>Bem-vindo ao Sistema de Inscrições do SESC!</Heading>
      <Text fontSize="lg">
        Utilize a navegação acima para gerenciar clientes, atividades, responsáveis e inscrições.
      </Text>
    </Box>
  );
}

export default Home;