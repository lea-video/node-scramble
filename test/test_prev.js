const counts = new Array(10).fill(1e5).map(x => Math.floor(x * Math.random()));

const mods = new Map();
mods.set('custom bit-meddler', require('../custom_bit_meddler.js'));
// Mods.set('custom', require('../script.js'));

for (const [name, mod] of mods) {
  const results = [];
  for (const c of counts) {
    const m = new mod(c, 1337, 69);
    const all = m.all().reverse();
    const all_rev = [all[0]];
    for (let i = all.length - 1; i > 0; i--) {
      all_rev.push(m.prev());
    }
    // Console.log(all, all_rev);
    results.push(`${c} = ${all.some((item, index) => item !== all_rev[index]) ? 'failed' : 'success'}`);
  }
  console.log(`${name} achieved: ${results.join(', ')}`);
}
