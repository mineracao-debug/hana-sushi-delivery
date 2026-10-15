export const LOCATION_KEY = 'hana-location-v2';
export const LOCATION_MAX_AGE = 6 * 60 * 60 * 1000;
export const LOCATION_TIMEOUT = 3000;
export const LOCATION_URL = 'https://ipwho.is/?fields=success,country_code,city,region_code&lang=pt-BR';
// Starts before the application bundle. The hook consumes this same request.
export const EARLY_LOCATION_SCRIPT = `(()=>{
 if(window.location.pathname!=='/'||window.__hanaLocationRequest)return;
 let saved=null;try{saved=JSON.parse(localStorage.getItem(${JSON.stringify(LOCATION_KEY)})||'null');}catch{}
 if(saved&&typeof saved.city==='string'&&saved.city.length>=2&&typeof saved.state==='string'&&saved.state.length===2&&(saved.source==='manual'||(saved.source==='auto'&&Number.isFinite(saved.savedAt)&&saved.savedAt<=Date.now()&&Date.now()-saved.savedAt<${LOCATION_MAX_AGE})))return;
 const request=fetch(${JSON.stringify(LOCATION_URL)},{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal:AbortSignal.timeout(${LOCATION_TIMEOUT})}).then(response=>{if(!response.ok)throw new Error('Location unavailable');return response.json();});
 request.catch(()=>{});window.__hanaLocationRequest=request;
})();`;
const states = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));

export function normalizeLocation(data) {
  const city = typeof data?.city === 'string' ? data.city.trim() : '';
  const state = typeof data?.region_code === 'string' ? data.region_code.replace(/^BR-/, '') : '';
  if (data?.country_code !== 'BR' || !states.has(state) || city.length < 2 || city.length > 80 || !/^[\p{L}\p{M} .’'()-]+$/u.test(city)) return null;
  return { city, state };
}

export function readLocation(storage, now = Date.now()) {
  try {
    const saved = JSON.parse(storage.getItem(LOCATION_KEY) || 'null');
    const location = normalizeLocation({ ...saved, country_code: 'BR', region_code: saved?.state });
    if (!location || !['manual', 'auto'].includes(saved.source)) return null;
    if (saved.source === 'auto' && (!Number.isFinite(saved.savedAt) || saved.savedAt > now || now - saved.savedAt >= LOCATION_MAX_AGE)) return null;
    return { ...location, source: saved.source, savedAt: saved.savedAt };
  } catch { return null; }
}

export function saveLocation(storage, location, source) {
  const saved = { ...location, source, savedAt: Date.now() };
  try { storage.setItem(LOCATION_KEY, JSON.stringify(saved)); } catch { /* Selection still works without browser storage. */ }
  return saved;
}

/** @param {{signal?: AbortSignal, fetchImpl?: typeof fetch, earlyRequest?: Promise<any>}} [options] */
export async function detectCity({ signal, fetchImpl = fetch, earlyRequest } = {}) {
  signal?.throwIfAborted();
  const data = await (earlyRequest || (async()=>{
    const response = await fetchImpl(LOCATION_URL, {
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(LOCATION_TIMEOUT)]) : AbortSignal.timeout(LOCATION_TIMEOUT),
      credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
    });
    if (!response.ok) throw new Error('Location unavailable');
    return response.json();
  })());
  signal?.throwIfAborted();
  const location = data.success === true ? normalizeLocation(data) : null;
  if (!location) throw new Error('Location unavailable');
  return location;
}
