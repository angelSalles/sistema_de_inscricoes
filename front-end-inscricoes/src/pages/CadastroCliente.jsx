// front-end-inscricoes/src/pages/CadastroCliente.jsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  Input,
  Button,
  Stack,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';

function CadastroCliente() {
  const toast = useToast(); // Hook do Chakra UI para mostrar notificações
  const [formData, setFormData] = useState({
    nomeCliente: '',
    dataNascimento: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  // Função para lidar com a mudança nos inputs do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Função para buscar endereço pelo CEP
  const handleBlurCep = async () => {
    const cep = formData.cep.replace(/\D/g, ''); // Remove não-dígitos
    if (cep.length !== 8) {
      toast({
        title: 'CEP Inválido',
        description: 'Por favor, digite um CEP válido com 8 dígitos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cep/${cep}`);
      const data = await response.json();

      if (response.ok) {
        setFormData((prevData) => ({
          ...prevData,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
        }));
        toast({
          title: 'CEP Encontrado',
          description: 'Endereço preenchido automaticamente.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Erro ao buscar CEP',
          description: data.error || 'Não foi possível encontrar o endereço para este CEP.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        // Limpa os campos de endereço se o CEP não for encontrado
        setFormData((prevData) => ({
          ...prevData,
          logradouro: '',
          bairro: '',
          cidade: '',
          estado: '',
        }));
      }
    } catch (error) {
      console.error('Erro ao conectar com a API de CEP:', error);
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar-se ao serviço de busca de CEP.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Função para enviar o formulário e cadastrar o cliente
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita o recarregamento da página

    setIsLoadingSave(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Cliente cadastrado!',
          description: `ID: ${data.id}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Limpa o formulário após o sucesso
        setFormData({
          nomeCliente: '',
          dataNascimento: '',
          cep: '',
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
        });
      } else {
        toast({
          title: 'Erro ao cadastrar cliente',
          description: data.error || 'Ocorreu um erro ao salvar os dados.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao enviar dados do cliente:', error);
      toast({
        title: 'Erro de Rede',
        description: 'Não foi possível conectar-se ao servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingSave(false);
    }
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" maxWidth="600px" mx="auto" mt={8}>
      <Heading mb={6} textAlign="center">Cadastro de Cliente</Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl id="nomeCliente" isRequired>
            <FormLabel>Nome Completo</FormLabel>
            <Input
              name="nomeCliente"
              value={formData.nomeCliente}
              onChange={handleChange}
              placeholder="Nome do Cliente"
            />
          </FormControl>

          <FormControl id="dataNascimento" isRequired>
            <FormLabel>Data de Nascimento</FormLabel>
            <Input
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl id="cep" isRequired>
            <FormLabel>CEP</FormLabel>
            <Input
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              onBlur={handleBlurCep} // Chama a função de busca quando o campo perde o foco
              placeholder="Ex: 69000-000"
              maxLength={9} // 8 dígitos + 1 hífen
              isLoading={isLoadingCep} // Mostra um spinner enquanto busca o CEP
            />
          </FormControl>

          <FormControl id="logradouro" isRequired>
            <FormLabel>Logradouro</FormLabel>
            <Input
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              placeholder="Rua, Avenida, etc."
              isReadOnly // Opcional: Impedir edição manual se preenchido por CEP
            />
          </FormControl>

          <FormControl id="numero" isRequired>
            <FormLabel>Número</FormLabel>
            <Input
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Número da residência"
            />
          </FormControl>

          <FormControl id="bairro" isRequired>
            <FormLabel>Bairro</FormLabel>
            <Input
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              placeholder="Nome do Bairro"
              isReadOnly
            />
          </FormControl>

          <FormControl id="cidade" isRequired>
            <FormLabel>Cidade</FormLabel>
            <Input
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Nome da Cidade"
              isReadOnly
            />
          </FormControl>

          <FormControl id="estado" isRequired>
            <FormLabel>Estado</FormLabel>
            <Input
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              placeholder="UF"
              maxLength={2}
              isReadOnly
            />
          </FormControl>

          <Button
            mt={4}
            colorScheme="teal"
            type="submit"
            isLoading={isLoadingSave}
            loadingText="Salvando..."
          >
            Cadastrar Cliente
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

export default CadastroCliente;