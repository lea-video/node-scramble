class Rand {
  constructor(maximum, seed, outOffset, loop = false) {
    if (maximum < 2 || maximum > Rand.MAX_INT) {
      throw new Error(`"maximum" must be a number between 2 and ${Rand.MAX_INT} inclusive`);
    }
    // The highest (inclusive) possible number
    this.maximum = maximum;
    // Start vector, defaulting to 1
    // zero is not allowed => breaks the feedback system
    this.seed = seed;
    this._start = (Math.abs(seed % this.maximum) + 1) || 1;
    // Number of bits, based on the highest possible number
    this._highestBitPos = Rand._bitCount(this.maximum) - 1;
    // Fetch the feedback-mask to use
    this._mask = Rand._FEEDBACK_MASK[this._highestBitPos - 1];
    // Infinite loop the generated numbers
    this.loop = loop;
    // Prepare the output Offset
    this.outOffset = outOffset;
    this._outOffset = (outOffset % this.maximum) || 0;
    if (this._outOffset < 0) this._outOffset += this.maximum;
    // Initiate { next, prev, _curr, n }
    this.reset();
  }

  // Set default next, prev and start
  reset() {
    this._cur = this._start;
    this.next = this._next;
    this.prev = this._done;
    this.n = -1;
  }

  // Returns an array of all items
  all() {
    this.reset();
    const o = [];
    for (let i = 0; i < this.maximum; i++) o.push(this.next());
    return o;
  }

  // Resolve the value for the current Position
  current() {
    return this.n !== -1 ? Rand._offset(this._cur, this._outOffset, this.maximum) : null;
  }

  // Return the current Position or -1
  currentPos() {
    return this.n;
  }

  // Return the next n results
  lookahead(n) {
    const k = this.clone();
    const o = [];
    let v;
    while (o.length < n && (v = k.next())) o.push(v);
    return o;
  }

  // Return the previous n results
  lookbehind(n) {
    const k = this.clone();
    const o = [];
    let v;
    while (o.length < n && (v = k.prev())) o.push(v);
    return o;
  }

  // Clone the object
  clone() {
    const k = new Rand(this.maximum, this.seed, this.outOffset, this.loop);
    k.goTo(this._cur, this.n);
    return k;
  }

  // Go to a position based cur & n
  goTo(cur, n) {
    this._cur = cur;
    this.n = n;
    this.next = n < this.maximum - 1 ? this._next : this._done;
    this.prev = n >= 0 ? this._prev : this._done;
  }

  // Private method overwriting this#next when in use
  _next() {
    this.prev = this._prev;

    do {
      this._cur = this._cur & 1 ? (this._cur >> 1) ^ this._mask : this._cur >> 1;
    } while (this._cur > this.maximum);

    if (this._cur === this._start && !this.loop) this.next = this._done;

    this.n++;
    if (this.n > this.maximum - 1) this.n -= this.maximum;

    return Rand._offset(this._cur, this._outOffset, this.maximum);
  }

  // Private method overwriting this#next when in use
  _prev() {
    this.next = this._next;

    do {
      this._cur = this._cur >> this._highestBitPos ? ((this._mask ^ this._cur) << 1) + 1 : this._cur << 1;
    } while (this._cur > this.maximum);

    if (this._cur === this._start && !this.loop) {
      this.prev = this._done;
      return this._done();
    }

    this.n--;
    if (this.n < 0) this.n += this.maximum;

    return Rand._offset(this._cur, this._outOffset, this.maximum);
  }

  // Private method overwriting this#next and this#prev
  // when we are at the end (or respectively start) of the sequence
  _done() {
    return null;
  }

  // Export functionality as iterator for easy usage in loops
  [Symbol.iterator]() {
    const obj = this.clone();
    obj.reset();
    obj.loop = false;
    const wrapper = {
      next: () => {
        wrapper.value = obj.next();
        if (!wrapper.value) wrapper.done = true;
        return wrapper;
      },
      value: null,
      done: false,
    };
    return wrapper;
  }
}
Rand._offset = (n, off, max) => {
  if (n > max) throw new Error('not expecting number > max');
  if (off > max) throw new Error('not expecting offset > max');
  let k = n + off;
  if (k > max) k -= max;
  return k;
};
// Get bit count based on highest active bit in maximum
Rand._bitCount = n => {
  let r = 0;
  while (n) {
    n >>= 1;
    r++;
  }
  return r;
};
// Fast string to hash
// Based on https://stackoverflow.com/a/7616484
Rand.hashCode = str => {
  if (!str || typeof str !== 'string') {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    // Convert to 32bit integer
    hash |= 0;
  }
  return hash;
};
// Highest signed 32 bit integer
Rand.MAX_INT = (2 ** 31) - 1;
// Feedback mask for the xor of the linear feedback register
// after converting the Many-to-one implementation to the one-to-many counterpart
Rand._FEEDBACK_MASK = [
  // 2 to 8
  0x3, 0x6, 0x9, 0x1D, 0x36, 0x69, 0xA6,
  // 9 - 16, and so on
  0x17C, 0x32D, 0x4F2, 0xD34, 0x1349, 0x2532, 0x6699, 0xD295,
  0x12933, 0x2C93E, 0x593CA, 0xAFF95, 0x12B6BC, 0x2E652E, 0x5373D6, 0x9CCDAE,
  0x12BA74D, 0x36CD5A7, 0x4E5D793, 0xF5CDE95, 0x1A4E6FF2, 0x29D1E9EB, 0x7A5BC2E3, 0xB4BCD35C,
];
// Export it all
module.exports = Rand;
