export const PHONE_ERROR = 'Informe o DDD e o número completo. Exemplo: (11) 99999-9999.';

// Keep the national number for storage; gateway adapters add +55 when required.
export function normalizePhone(value) {
  const raw = String(value ?? '').trim();
  if (!/^[+\d\s().-]+$/.test(raw)) return '';
  let number = raw.replace(/\D/g, '');
  if (/^55\d{10,11}$/.test(number)) number = number.slice(2);
  return /^[1-9]\d{9,10}$/.test(number) ? number : '';
}
