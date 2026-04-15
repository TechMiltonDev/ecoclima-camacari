const { Users } = require('../models/index');

/**
 * Controller de Cadastro
 * Responsável por validar, criar o usuário e retornar sucesso
 */
const cadastroController = async (req, res) => {
  try {
    let { nome, email, senha } = req.body;

    // 1. Validação básica (campos vazios)
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ message: 'Todos os campos são obrigatórios.' });
    }

    senha = String(senha);

    // 2. Verificar se o e-mail já existe
    // Note: Usando o método que criamos anteriormente no model
    const userExistente = await Users.buscarUsuarioPorEmail(email);

    if (userExistente) {
      return res.status(409).json({
        message: 'Este e-mail já está cadastrado. Tente fazer login.',
      });
    }

    // 3. Registrar o usuário
    const idUser = await Users.registrarUsuario(nome, email, senha);

    // 4. Resposta de sucesso
    return res.status(201).json({
      sucesso: true,
      message: 'Usuário criado com sucesso!',
      user: {
        id: idUser,
        nome: nome,
      },
    });
  } catch (error) {
    console.error('❌ Erro no processo de cadastro:', error);
    return res
      .status(500)
      .json({ message: 'Erro interno no servidor ao criar conta.' });
  }
};

// 🟢 CORREÇÃO: Exportando o nome correto da função
module.exports = cadastroController;
