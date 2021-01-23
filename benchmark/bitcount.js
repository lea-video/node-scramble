/**
 * Benchmark to evaluate the fastest method to count bits of a number
 */

const options = new Map();
// Functions return the number of bits based on the highest bit present
options.set('log2', n => Math.floor(Math.log2(n)) + 1);
options.set('toString(2)', n => n.toString(2).length);
options.set('bitshift', n => {
  let r = 0;
  while (n) {
    n >>= 1;
    r++;
  }
  return r;
});

// Runs to run
const runs = [
  1e4,
  1e5,
  1e6,
  1e7,
];
// Bitlengths to try
const lengths = [
  8,
  16,
  24,
  31,
];

const doTestForOption = (run, length, testData, name, uut) => {
  const start = Date.now();
  for (let i = 0; i < run; i++) {
    if (uut(testData) !== length) throw new Error(`invalid result for ${name}`);
  }
  return `${Date.now() - start} ms`;
};

const doTestForLength = (run, length) => {
  const timings = {};
  const testData = (2 ** length) - 1;
  for (const [name, uut] of options) {
    timings[name] = doTestForOption(run, length, testData, name, uut);
  }
  return timings;
};

const doTestForRun = run => {
  console.log(`evaluating methods to get bit count, ${run.toExponential()} runs`);
  const results = {};
  for (const length of lengths) {
    results[`${length} bit length`] = doTestForLength(run, length);
  }
  console.table(results);
};

for (const run of runs) {
  doTestForRun(run);
}
