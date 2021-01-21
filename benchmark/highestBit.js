/**
 * Benchmark to evaluate the fastest method of getting the highest bit
 */

// Testing with 5 bit number
const options = [
  // bitshift
  (n,b,m) => n >> b == 0,
  // bitm ask
  (n,b,m) => n & m == 0,
];
const runs = [
  1e1,
  1e2,
  1e3,
  1e5,
  1e7,
  1e9,
  1e11,
  1e13,
];

for (const run of runs) {
  timings = [];
  const bits = Math.floor(Math.log2(run)) + 1;
  const mask = 2**bits;
  for(let i = 0 ; i < options.length ; i++) {
    const start = Date.now();
    for(let ii = 2 ; ii < 1e7 ; ii++) {
      options[i](ii,bits,mask);
    }
    timings[i] = Date.now() - start;
  }
  console.log(`took ${timings.join(', ')} for ${run} runs`);
}
