const counts = [1e3, 1e5, 1e7, 1e9];

const mods = new Map();
mods.set('bit-meddler', require('bit-meddler'));
mods.set('custom bit-meddler', require('../custom_bit_meddler.js'));
mods.set('custom bit-meddler#prev', require('../custom_bit_meddler.js'));
mods.set('custom', require('../script.js'));
mods.set('custom#prev', require('../script.js'));

for(const [name, mod] of mods) {
  const times = [];
  for(const c of counts) {
    const m = new mod(c);
    const prev = name.endsWith('#prev');
    if (prev) for(let i = 0 ; i < c ; i++) m.next();
    let start = Date.now();
    for(let i = 0 ; i < c ; i++) prev ? m.prev() : m.next();
    times.push(`${c.toExponential()} = ${Date.now() - start}`);
  }
  console.log(`${name} achieved: ${times.join(', ')}`);
}
