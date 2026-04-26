export const PASSWORD_MIN_LENGTH = 10;

const uppercasePattern = /[A-ZÁÉÍÓÚÑ]/;
const lowercasePattern = /[a-záéíóúñ]/;
const numberPattern = /\d/;
const symbolPattern = /[^\w\s]/;
const whitespacePattern = /\s/;

export function validateStrongPassword(password) {
  if (!password) return "Ingresa una contrasena.";
  if (password.length < PASSWORD_MIN_LENGTH) return `La contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (whitespacePattern.test(password)) return "La contrasena no debe contener espacios.";
  if (!uppercasePattern.test(password)) return "La contrasena debe incluir al menos una letra mayuscula.";
  if (!lowercasePattern.test(password)) return "La contrasena debe incluir al menos una letra minuscula.";
  if (!numberPattern.test(password)) return "La contrasena debe incluir al menos un numero.";
  if (!symbolPattern.test(password)) return "La contrasena debe incluir al menos un simbolo.";

  return "";
}

export function getPasswordHelpText() {
  return `Minimo ${PASSWORD_MIN_LENGTH} caracteres, con mayuscula, minuscula, numero y simbolo.`;
}