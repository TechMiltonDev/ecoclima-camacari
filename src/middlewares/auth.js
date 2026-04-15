const jwt = require('jsonwebtoken');

const verificarSessao = (req, res, next) => {
  const token = req.cookies.token; // Nome do cookie que definimos no login

  if (!token) {
    // Se não tem token, redireciona para a página de login
    return res.redirect('/login');
  }

  try {
    // Valida se o token é verdadeiro e não expirou
    const dados = jwt.verify(token, process.env.JWTENCRIPT);

    // Salva os dados do usuário na requisição para usar na página
    req.user = dados;

    next(); // Autorizado! Segue para a rota
  } catch (error) {
    // Token inválido ou expirado
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

module.exports = verificarSessao;
