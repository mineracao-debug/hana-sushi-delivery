export const cepDigits = value => String(value ?? '').replace(/\D/g, '');
export function formatCEP(value) {
  const digits = cepDigits(value).slice(0, 8);
  return digits.length > 5 ? digits.slice(0, 5) + '-' + digits.slice(5) : digits;
}
export class CEPError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
const states = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));

export async function lookupCEP(value, {signal, fetchImpl = fetch, timeoutMs = 5000} = {}) {
  const cep = cepDigits(value);
  if (!/^\d{8}$/.test(cep)) throw new CEPError('invalid', 'Digite os 8 números do CEP.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, {once: true});
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await fetchImpl('https://viacep.com.br/ws/' + cep + '/json/', {
      signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer'
    });
    if (!response.ok) throw new Error('CEP service unavailable');
    const data = await response.json();
    if (data.erro === true || data.erro === 'true') throw new CEPError('not_found', 'CEP não encontrado. Confira o número ou preencha o endereço abaixo.');
    const text = v => typeof v === 'string' ? v.trim() : '';
    const address = {street:text(data.logradouro), district:text(data.bairro), city:text(data.localidade), uf:text(data.uf)};
    if (cepDigits(data.cep) !== cep || address.city.length < 2 || !states.has(address.uf)) throw new Error('Invalid address response');
    if (controller.signal.aborted) throw new Error('Lookup aborted');
    return address;
  } catch (error) {
    if (error instanceof CEPError) throw error;
    throw new CEPError('unavailable', 'Não foi possível buscar o CEP. Preencha o endereço abaixo ou tente novamente.');
  } finally {
    clearTimeout(timer); signal?.removeEventListener('abort', abort);
  }
}

// A late response must never replace another CEP or an address edited by hand.
export function createCEPLookup(fetcher = lookupCEP) {
  let active;
  const cancel = () => { active?.abort(); active = undefined; };
  return {cancel, async lookup(cep) {
    cancel(); const request = new AbortController(); active = request;
    try {
      const address = await fetcher(cep, {signal:request.signal});
      return request === active && !request.signal.aborted ? address : null;
    } catch (error) {
      if (request !== active || request.signal.aborted) return null;
      throw error;
    }
  }};
}
