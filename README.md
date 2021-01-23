# node-scramble
[![codecov](https://codecov.io/gh/lea-video/node-scramble/branch/master/graph/badge.svg)](https://codecov.io/gh/lea-video/node-scramble)
[![Known Vulnerabilities](https://snyk.io/test/github/lea-video/node-scramble/badge.svg)](https://snyk.io/test/github/lea-video/node-scramble)

Iterative & Unique Random Number Generator

This library is an iteration of the greate [bit-meddler module by alanmacleod](https://github.com/alanmacleod/bit-meddler).

Contrairy to algorithms like the [Fisher-Yates/Knuth Shuffle](https://en.wikipedia.org/wiki/Knuth_shuffle) the approaches this library takes is the use of a Linear Feedback Shift Register (short LFSR) to bijectivly map base 2 numbers to a randomised base 2 space. This comes with the disadvantage of (minimal) higher computational cost to retrieve individual numbers (since we have to first compute them instead of popping them from an array) but massively reduces memory usage - allowing to scramble billions of items. LFSRs are known to use O(1) memory and roughly O(1) time.

Build into this library is the possibility to seed the results & and a utility function to build a seed from a string. This allows to recreate a scramble from a single number.

The results should **NOT** be used for cryptography since the numbers generated are not "very random".

Its build to scramble Playlists in a seemingly random way, supporting seeds and being easy to transfer over network.

A good explanation of the concept behind it can be found in [this Article by Max Maxfield](https://www.eetimes.com/tutorial-linear-feedback-shift-registers-lfsrs-part-1/) or the Sources provided by alanmacleod in the bit-meddler README.

# example usage
To scramble some numbers, say between `1` and `1000`:
```js
const scramble = require('node-scramble');
const s = new scramble(1000);
const n = s.next(); // give me a number
```

or if you prefer the good old iterator
```js
const scramble = require('node-scramble');
const s = new scramble(1000);
for (const n of s) {
  dosth(n);
}
```

Calling `.next()` will return every number between 1 and 1000 in a scrambled, pseudorandom order. The method will return `null` once every number has been returned exactly once.

If you missed something there's the option to use `.current()`. If you missed even more you can use `.prev()` to return the LSFR to the previous state, also returning the previous number (or `null`).

You can call `.reset()` to start again if you wish.

Optional additional parameters are:
* a seed number to vary the start position
* offset to greatly vary the responding numbers
* loop to automaticlaly call `.reset()` when you `.next()`'ed the last number

```js
const seed = 42;
const offset = 420;
const doLoop = true;
const s = new scramble(1000, seed, offset, doLoop);
s.next() // would do a regular scramble with initial seed 42
         // then offset the scrambled number by 420, wrapping around to keep us within the 1000 limit
s.current() // would print the same number as the s.next() above
s.all() // still returns 1000 elements starting with the first element
s.prev() // would print the second-last number, since the .all() moved us to the last positition
```

If you want access to the full list of numbers, there's a convenient `all` method for that:
```js
const s = new scramble(1000);
const ns = s.all(); // return array of 1000 scrambled elements
```

Further that you can fetch the surrounding elements using `lookahead` and `lookbehind` method. They both take an argument describing the amount of numbers to look ahead for.
```js
const s = new scramble(1000);
s.next(); // -> 813
s.next(); // -> 699
s.lookbehind(3); // -> [813]
s.lookahead(3); // -> [624, 312, 156]
s.current(); // -> 699
```

# installation
```bash
npm i lea-video/node-scramble
```
