/**
 * Benchmark to evaluate the performance against the original bit-meddler
 */

const options = new Map();
options.set('bit-meddler', require('bit-meddler'));
options.set('custom bit-meddler', require('../'));
options.set('custom bit-meddler#prev', require('../'));

// LoopLengths to try
const lengths = [
  1e4,
  1e5,
  1e6,
  1e7,
  1e9,
];

const doTestForOption = (length, name, uut) => {
  const u = new uut(length);
  const isPrev = name.endsWith('#prev');
  if (isPrev) {
    // Spool to end
    while (u.next());
  }
  const start = Date.now();
  let v;
  do {
    v = isPrev ? u.prev() : u.next();
  } while (v);
  return `${Date.now() - start} ms`;
};

const doTestForLength = length => {
  const timings = {};
  for (const [name, uut] of options) {
    timings[name] = doTestForOption(length, name, uut);
  }
  return timings;
};

const doTestForRun = () => {
  console.log('evaluating full script');
  const results = {};
  for (const length of lengths) {
    results[`${length.toExponential()} loop length`] = doTestForLength(length);
  }
  console.table(results);
};

doTestForRun();
