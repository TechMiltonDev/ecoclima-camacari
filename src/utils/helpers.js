// utils/helpers.js

const getAttrSafe = ($element, attr) => {
  if (!$element || $element.length === 0) return '';
  const val = $element.attr(attr);
  return val ? val.trim() : '';
};

const getTextSafe = ($element) => {
  if (!$element || $element.length === 0) return '';
  const val = $element.text();
  return val ? val.trim() : '';
};

// CORREÇÃO AQUI: Use new Date() e ajuste o fuso horário corretamente
const getDateBr = () => {
  // Cria uma data atual e converte para o fuso horário de São Paulo
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
};

module.exports = {
  getAttrSafe,
  getTextSafe,
  getDateBr,
};