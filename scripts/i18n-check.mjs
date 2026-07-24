// Flat all keys from a nested object, e.g. { a: { b: 1 } } -> ['a.b']
function flatKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object'
      ? flatKeys(v, prefix ? `${prefix}.${k}` : k)
      : [prefix ? `${prefix}.${k}` : k]
  );
}

const locales = ['zh-TW', 'en', 'ja'];
const messages = await Promise.all(
  locales.map(l => import(`../messages/${l}.json`, { with: { type: 'json' } }).then(m => m.default))
);
const keysets = messages.map(m => flatKeys(m));
const baseline = keysets[0];

let failed = false;
for (let i = 1; i < locales.length; i++) {
  const missing = baseline.filter(k => !keysets[i].includes(k));
  const extra   = keysets[i].filter(k => !baseline.includes(k));
  if (missing.length) { console.error(`[${locales[i]}] missing: ${missing.join(', ')}`); failed = true; }
  if (extra.length)   { console.error(`[${locales[i]}] extra:   ${extra.join(', ')}`);   failed = true; }
}
if (failed) process.exit(1);
console.log('✓ all locale files have identical keys');
