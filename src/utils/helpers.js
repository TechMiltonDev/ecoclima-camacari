// utils/helpers.js
let getAttrSafe = ($element, attr) => {
  if (!$element || $element.length === 0) return "";
  const val = $element.attr(attr);
  return val ? val.trim() : "";
};

let getTextSafe = ($element) => {
  if (!$element || $element.length === 0) return "";
  const val = $element.text();
  return val ? val.trim() : "";
};

module.exports = {
  getAttrSafe,
  getTextSafe
};