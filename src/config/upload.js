// src/config/upload.js
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Para gerar nomes únicos

// Define onde os arquivos ficarão
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Certifique-se que esta pasta existe ou crie-a manualmente
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Gera um nome único: uuid + extensão original
    // Ex: 550e8400-e29b-41d4-a716-446655440000.png
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtro para aceitar apenas imagens (opcional, mas recomendado)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Formato de arquivo inválido. Apenas JPG, PNG e WEBP são permitidos.',
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
});

module.exports = upload;
