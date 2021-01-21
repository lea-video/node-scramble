class Rand {
  constructor(maximum, seed, outOffset, loop=false) {
    if (maximum < 2 || maximum > Rand.MAX_INT)
      throw `"maximum" must be a number between 2 and ${Rand.MAX_INT} inclusive`;
    this.maximum = maximum;
    this.start = Math.abs(seed % this.maximum || 1);
    this.bitCount = Rand._bitCount(this.maximum);
    this.mask = Rand.FEEDBACK_MASK[ this.bitCount - 2 ];
    // infinite loop the generated numbers
    this.loop = loop;
    this.outOffset = outOffset || 0;
    // initiate { next, prev, _curr, n }
    this.reset();
  }

  // set default next, prev and start
  reset() {
    this._cur = this.start;
    this.next = this._next;
    this.prev = this._done;
    this.n = -1;
  }

  // returns an array of all items
  all() {
    this.reset();
    const o = [];
    for (let i = 0 ; i < this.maximum ; i++)
      o.push(this.next());
    return o;
  }

  current() {
    return (this._cur + this.outOffset) % this.maximum
  }

  lookahead(n) {
    const k = this.clone();
    const o = [];
    let v;
    while (o.length < n && (v = k.next()))
      o.push(v);
    return o;
  }

  lookbehind(n) {
    const k = this.clone();
    const o = [];
    let v;
    while (o.length < n && (v = k.prev()))
      o.push(v);
    return o;
  }

  clone() {
    const k = new Rand(this.maximum, this.start, this.outOffset, this.loop);
    k.goTo(this._cur, this.n);
    return k;
  }

  goTo(cur, n) {
    this._cur = cur;
    this.n = n;
    if (n < this.maximum-1)
      this.next = this._next;
    else this.next = this._done;
    if (n >= 0)
      this.prev = this._prev;
    else this.prev = this._done;
  }

  _next() {
    this.prev = this._prev;

    do {
      this._cur = (this._cur & 1) ? (this._cur >> 1) ^ this.mask : this._cur >> 1;
    } while( this._cur > this.maximum );

    if (this._cur === this.start && !this.loop)
      this.next = this._done;

    this.n++;
    return (this._cur + this.outOffset) % this.maximum;
  }

  _prev() {
    this.next = this._next;

    do {
      this._cur = this._cur >> this.bitCount - 1 ? ((this.mask ^ this._cur) << 1) + 1: this._cur << 1;
    } while( this._cur > this.maximum );

    this.n--;
    if (this._cur === this.start && !this.loop) {
      this.prev = this._done;
      return this._done();
    }

    return (this._cur + this.outOffset) % this.maximum;
  }

  _done() {
    return null;
  }
}
// fast string to hash
// Based on https://stackoverflow.com/a/7616484
Rand.hashCode = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
// get bit count based on highest active bit in maximum#
Rand._bitCount = n => Math.floor(Math.log2(n))+1
// highest signed 32 bit integer
Rand.MAX_INT = 2**31 -1;
// feedback mask for the xor of the linear feedback register
// after converting the Many-to-one implementation to the one-to-many counterpart
Rand.FEEDBACK_MASK = [
  0x3,0x6,0x9,0x1D,0x36,0x69,0xA6, // 2 to 8
  0x17C,0x32D,0x4F2,0xD34,0x1349,0x2532,0x6699,0xD295, // 9 - 16
  0x12933,0x2C93E,0x593CA,0xAFF95,0x12B6BC,0x2E652E,0x5373D6,0x9CCDAE, // etc
  0x12BA74D,0x36CD5A7,0x4E5D793,0xF5CDE95,0x1A4E6FF2,0x29D1E9EB,0x7A5BC2E3,0xB4BCD35C
];
// export it all
module.exports = Rand;
