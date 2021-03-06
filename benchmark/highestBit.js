/**
 * Benchmark to evaluate the fastest method of getting the highest bit
 */

const options = new Map();
// Functions return 1 if bit b is 1, else 0
options.set('bitshift', (n, b) => n >> (b - 1));
options.set('bitmask', (n, b, m) => (n & m) !== 0);

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

const doTestForOption = (run, length, testData, mask, name, uut) => {
  const start = Date.now();
  for (let i = 0; i < run; i++) {
    if (!uut(testData, length, mask)) throw new Error(`invalid result for ${name}`);
  }
  return `${Date.now() - start} ms`;
};

const doTestForLength = (run, length) => {
  const timings = {};
  const mask = 2 ** (length - 1);
  const testData = (2 ** length) - 1;
  for (const [name, uut] of options) {
    timings[name] = doTestForOption(run, length, testData, mask, name, uut);
  }
  return timings;
};

const doTestForRun = run => {
  console.log(`evaluating methods to receive the highest bit, ${run.toExponential()} runs`);
  const results = {};
  for (const length of lengths) {
    results[`${length} bit length`] = doTestForLength(run, length);
  }
  console.table(results);
};

for (const run of runs) {
  doTestForRun(run);
}
