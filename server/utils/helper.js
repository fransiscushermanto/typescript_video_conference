/**
 * @param {number} length
 * @default length = 8
 */
const generate = (length = 8) => {
  const ALPHABET =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let rtn = "";
  for (let i = 0; i < length; i++) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return rtn;
};

module.exports = { generate };
