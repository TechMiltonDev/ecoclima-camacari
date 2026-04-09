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

const getDateBr = () => {
  return new Date(
    Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
  );
};

module.exports = {
  getAttrSafe,
  getTextSafe,
  getDateBr,
};
