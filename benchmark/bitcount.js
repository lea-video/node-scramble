/**
 * Benchmark to evaluate the fastest method to count bits of a number
 */

const options = [
  n => Math.floor(Math.log2(2))+1,
  n => n.toString(2).length,
  n => {
    var r = 0;
    while (n) { n >>=1; r++; }
    return r;
  },
];
const runs = [
  1e3,
  1e5,
  1e7,
  1e9,
];

for (const run of runs) {
  timings = [];
  for(let i = 0 ; i < options.length ; i++) {
    const start = Date.now();
    for(let ii = 2 ; ii < 1e7 ; ii++) {
      options[i](ii);
    }
    timings[i] = Date.now() - start;
  }
  console.log(`took ${timings.join(', ')} for ${run} runs`);
}
