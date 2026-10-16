export function pixState(payment, now = Date.now()) {
 if (!payment) return 'none';
 if (payment.status === 'paid' || payment.paid) return 'paid';
 if (['failed', 'refused', 'canceled', 'refunded', 'chargedback', 'expired'].includes(payment.status)) return 'closed';
 const expiry = Date.parse(payment.expirationDate || '');
 if (Number.isFinite(expiry) && expiry <= now) return 'expired';
 return 'pending';
}

export function sameOrderItems(lines, payment) {
 const items = payment?.order?.items;
 if (!Array.isArray(items) || !items.length) return false;
 const signature = entries => JSON.stringify(entries.map(item => [String(item.id), Number(item.qty), item.opt || '']).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));
 return signature(lines) === signature(items);
}

// A saved ID is only a recovery option. It never replaces the checkout automatically.
/** @param {string} id @param {{fetcher?: typeof fetch, signal?: AbortSignal}} options */
export async function recoverPix(id, {fetcher = fetch, signal = undefined} = {}) {
 if (!/^SB-[a-f0-9-]{36}$/i.test(id || '')) return {kind: 'discard'};
 const response = await fetcher('/api/pix-status?id=' + encodeURIComponent(id), {signal, cache: 'no-store'});
 if ([400, 403, 404].includes(response.status)) return {kind: 'discard'};
 if (!response.ok) throw new Error('Não foi possível consultar o Pix anterior.');
 const payment = await response.json();
 if (payment.id !== id || !Number.isSafeInteger(payment.amount) || payment.amount < 1) throw new Error('Não foi possível conferir o Pix anterior.');
 const state = pixState(payment);
 return state === 'pending' ? {kind: 'offer', payment} : {kind: 'discard', state};
}

export function forgetPix(storage, id) {
 try { if (storage.getItem('hana-pix') === id) storage.removeItem('hana-pix'); } catch {}
}
