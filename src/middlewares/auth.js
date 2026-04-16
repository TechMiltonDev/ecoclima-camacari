// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { Users } = require('../models/index');

// Esta função retorna o middleware real
const verificarSessao = (opcoes = {}) => {
  const requerAdmin = opcoes.admin || false;

  return async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      // Se for uma requisição API (JSON), retorna erro 401
      if (req.headers['content-type']?.includes('application/json')) {
        return res.status(401).json({ message: 'Não autorizado. Faça login.' });
      }
      // Se for navegação normal, redireciona
      return res.redirect('/login');
    }

    try {
      // Valida o token
      const dados = jwt.verify(token, process.env.JWTENCRIPT);

      // Anexa os dados do usuário à requisição
      req.user = dados;

      // 🛡️ Verificação de Admin (se solicitado)
      if (requerAdmin) {
        // Opção A: Se você salvou 'isAdmin' no token JWT
        if (!dados.isAdmin) {
          return res
            .status(403)
            .json({ message: 'Acesso restrito a administradores.' });
        }

        // Opção B: Se precisar verificar no banco (mais seguro, mas mais lento)
        // const userDb = await Users.buscarUsuarioPorEmail(dados.email);
        // if (!userDb || !userDb.isAdmin) {
        //    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
        // }
      }

      next(); // Tudo ok, segue para a próxima função
    } catch (error) {
      console.error('Erro na validação do token:', error.message);
      res.clearCookie('token');

      if (req.headers['content-type']?.includes('application/json')) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
      }
      return res.redirect('/login');
    }
  };
};

module.exports = verificarSessao;
