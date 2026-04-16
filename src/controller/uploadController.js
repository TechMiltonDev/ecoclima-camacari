// src/controller/uploadController.js

const uploadController = async (req, res) => {
  try {
    // 1. Pegar o nome personalizado enviado no campo de texto
    // Certifique-se que no HTML o input text tem name="nomeImagem"
    const nomePersonalizado = req.body.nomeImagem;

    // 2. Pegar o arquivo enviado
    // 'files' é um objeto quando usamos .fields(). Acessamos pelo nome do campo file.
    // Verifica se o arquivo 'arquivo' foi enviado
    if (!req.files || !req.files.arquivo) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    const file = req.files.arquivo[0]; // Pega o primeiro arquivo do campo 'arquivo'

    // Caminho relativo para salvar no banco ou retornar
    const caminhoRelativo = `/uploads/${file.filename}`;

    console.log(
      `✅ Upload recebido: "${nomePersonalizado}" -> ${caminhoRelativo}`,
    );

    return res.status(200).json({
      sucesso: true,
      message: 'Upload realizado com sucesso!',
      dados: {
        nomePersonalizado: nomePersonalizado,
        caminho: caminhoRelativo,
        tamanho: file.size,
        tipo: file.mimetype,
      },
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return res
      .status(500)
      .json({ message: 'Erro interno ao processar upload.' });
  }
};

module.exports = uploadController;
