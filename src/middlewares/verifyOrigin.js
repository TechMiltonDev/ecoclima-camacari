// src/middlewares/verifyOrigin.js

const verifyOrigin = (req, res, next) => {
  // Permitir localhost em desenvolvimento e seu domínio em produção
  const allowedOrigins = [
    'http://localhost:3000', // Ajuste a porta se necessário
    'https://eco-clima-camacari.vercel.app/', // Seu domínio real
  ];

  const origin = req.headers.origin || req.headers.referer;

  // Se não tiver origin (comum em alguns bots ou curl), bloqueia
  if (!origin) {
    return res
      .status(403)
      .json({ message: 'Acesso negado: Origem desconhecida.' });
  }

  // Verifica se a origem está na lista permitida
  // O referer às vezes vem com caminho (/login), então usamos includes ou startWith
  const isAllowed = allowedOrigins.some((allowed) =>
    origin.startsWith(allowed),
  );

  if (!isAllowed) {
    console.warn(`⚠️ Tentativa de acesso bloqueada de: ${origin}`);
    return res
      .status(403)
      .json({ message: 'Acesso negado: Domínio não autorizado.' });
  }

  next();
};

module.exports = verifyOrigin;
