const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Users } = require('../models/index');

/**
 * Controller de Login
 * Responsável por verificar credenciais e gerar o cookie de sessão
 */
const loginController = async (req, res) => {
  try {
    let { email, senha } = req.body;

    // 1. Validação básica (campos vazios)
    if (!email || !senha) {
      return res
        .status(400)
        .json({ message: 'Todos os campos são obrigatórios.' });
    }

    senha = String(senha);

    // 1. Busca o usuário no banco pelo email
    // O método dadosUsuario deve retornar o objeto do usuário com a senha hash
    const user = await Users.buscarUsuarioPorEmail(email);
    console.log('Usuário encontrado:', user);

    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    // 2. Compara a senha digitada com a senha (hash) do banco
    // O bcrypt.compare retorna true ou false
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    // 3. Criar o Token JWT com os dados que você quer acessar depois
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        assinou: user.assinou,
      },
      process.env.JWTENCRIPT,
      { expiresIn: '7d' },
    );

    // 4. Configurar o Cookie no navegador
    res.cookie('token', token, {
      httpOnly: true, // Impede acesso via JavaScript (protege contra XSS)
      secure: process.env.NODE_ENV === 'production', // True apenas em produção (HTTPS)
      sameSite: 'lax', // Proteção básica contra CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 semana
    });

    // 5. Resposta de sucesso (não envie a senha de volta!)
    return res.json({
      sucesso: true,
      message: 'Login realizado com sucesso!',
      user: {
        nome: user.nome,
      },
    });
  } catch (error) {
    console.error('Erro no processo de login:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

module.exports = loginController;
