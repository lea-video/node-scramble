const ASSERT = require('assert-diff');
ASSERT.options.strict = true;
const SCRAMBLE = require('../');

describe('SCRAMBLE', () => {
  it('returns numbers <= maximum', () => {
    const count = 123;
    const uut = new SCRAMBLE(count);

    let v = uut.next();
    while (v) {
      ASSERT.ok(v <= count);
      v = uut.next();
    }
  });

  it('returns numbers > 0', () => {
    const uut = new SCRAMBLE(123);

    let v = uut.next();
    while (v) {
      ASSERT.ok(v > 0);
      v = uut.next();
    }
  });

  it('returns exactly the amount of numbers asked for', () => {
    const count = 123;
    const uut = new SCRAMBLE(count);

    let i;
    for (i = 0; uut.next(); i++);
    ASSERT.equal(i, count);
  });

  it('returns each number exactly once', () => {
    const count = 123;
    const uut = new SCRAMBLE(count);
    const hits = new Array(count).fill(0);

    let v = uut.next();
    while (v) {
      // Offset, since results are 0 exclusive to max (inclusive)
      hits[v - 1]++;
      v = uut.next();
    }
    ASSERT.equal(hits.length, count);
    ASSERT.ok(!hits.some(x => x !== 1));
  });
});

describe('SCRAMBLE#prev', () => {
  it('successfully pulls items in reverse', () => {
    const count = 123;
    const uut = new SCRAMBLE(count);
    // Get all items forward-fashion
    const all = uut.all();
    ASSERT.equal(all.length, count);
    // Last (=current) item is skipped
    const all_rev = [uut.current()];
    // Get all items reverse-fashion
    for (let i = all.length - 1; i > 0; i--) {
      all_rev.push(uut.prev());
    }
    ASSERT.equal(all_rev.length, count);
    ASSERT.deepEqual(all.reverse(), all_rev);
  });

  it('returns null when done', () => {
    const uut = new SCRAMBLE(123);
    const n1 = uut.next();
    uut.next();
    ASSERT.equal(uut.prev(), n1);
    ASSERT.equal(uut.prev(), null);
    ASSERT.equal(uut.prev, uut._done);
  });
});

describe('SCRAMBLE#iterator', () => {
  it('successfully exposes the iterator', () => {
    const uut = new SCRAMBLE(123);
    ASSERT.ok(uut[Symbol.iterator]);
  });

  it('returns returns the requested amount of numbers', () => {
    const count = 123;
    const uut = new SCRAMBLE(count);
    // Get all items forward-fashion
    let n = 0;
    // eslint-disable-next-line no-unused-vars
    for (const k of uut) n++;
    ASSERT.equal(n, count);
  });

  it('it ignores the previous state of the scrambler', () => {
    const count = 123;
    const uut = new SCRAMBLE(count);
    uut.next();
    uut.next();
    // Get all items forward-fashion
    let n = 0;
    // eslint-disable-next-line no-unused-vars
    for (const k of uut) n++;
    ASSERT.equal(n, count);
  });
});

describe('SCRAMBLE#options', () => {
  it('allows for use of loop', () => {
    const count = 123;
    const uut = new SCRAMBLE(count, 0, 0, true);

    const first = uut.next();
    // Skip some
    for (let i = 1; i < count; i++) uut.next();
    const second = uut.next();
    ASSERT.equal(first, second);
  });

  it('allows for use of output offset', () => {
    const count = 123;
    const uut_0 = new SCRAMBLE(count);
    const uut_1 = new SCRAMBLE(count, 0, 5);

    // Compare the first 5 items
    for (let i = 0; i < 5; i++) {
      const offset = (uut_0.next() + 5) % (count + 1);
      ASSERT.equal(offset, uut_1.next());
    }
  });

  it('allows for the use of seed', () => {
    const count = 123;
    const uut_0 = new SCRAMBLE(count);

    // Offset by a bit
    for (let i = 0; i < 5; i++) uut_0.next();

    const uut_1 = new SCRAMBLE(count, uut_0._cur);

    // Compare the next 5
    for (let i = 0; i < 5; i++) {
      ASSERT.equal(uut_0.next(), uut_1.next());
    }
  });

  it('ensures save value for _start', () => {
    const count = 123;
    // Create some test units
    const uuts = [
      -500,
      -5,
      -1,
      0,
      1,
      123,
      500,
      'yey',
    ].map(x => new SCRAMBLE(count, x));

    // Check the units
    for (const uut of uuts) {
      ASSERT.ok(uut._start > 0, `${uut.seed} is not bigger zero`);
      ASSERT.ok(uut._start <= count, `${uut.seed} is bigger than max`);
      ASSERT.ok(!isNaN(uut._start), `${uut.seed} is not a number`);
    }
  });

  it('ensures save value for _outOffset', () => {
    const count = 123;
    // Create some test units
    const uuts = [
      -500,
      -5,
      -1,
      0,
      1,
      123,
      500,
      'yey',
    ].map(x => new SCRAMBLE(count, 0, x));

    // Check the units
    for (const uut of uuts) {
      ASSERT.ok(Math.abs(uut._outOffset) <= count, `${uut.outOffset} is not between -max and max`);
      ASSERT.ok(!isNaN(uut._outOffset), `${uut.outOffset} is not a number`);
    }
  });
});

describe('SCRAMBLE#next', () => {
  it('returns null when done', () => {
    const count = 123;
    const uut = new SCRAMBLE(123);

    for (let i = 0; i < count; i++) {
      ASSERT.ok(uut.next() !== null);
    }
    ASSERT.equal(uut.next, uut._done);
    ASSERT.ok(uut.next() === null);
  });
});

describe('SCRAMBLE#hashCode', () => {
  it('returns a number for a string', () => {
    const n = SCRAMBLE.hashCode('test');
    ASSERT.equal(typeof n, 'number');
  });

  it('does not error for invalid inputs', () => {
    ASSERT.doesNotThrow(() => {
      SCRAMBLE.hashCode('');
      SCRAMBLE.hashCode(123);
      SCRAMBLE.hashCode();
      SCRAMBLE.hashCode([123]);
    });
  });

  it('returns different hashes for different strings', () => {
    const n1 = SCRAMBLE.hashCode('test 1');
    const n2 = SCRAMBLE.hashCode('test 2');
    ASSERT.notEqual(n1, n2);
  });
});

describe('SCRAMBLE#_offset', () => {
  it('throws when number is above max', () => {
    ASSERT.throws(() => {
      SCRAMBLE._offset(10, 0, 5);
    }, /not expecting number > max/);
  });

  it('throws when offset is above max', () => {
    ASSERT.throws(() => {
      SCRAMBLE._offset(0, 10, 5);
    }, /not expecting offset > max/);
  });

  it('returns number when offset = 0', () => {
    ASSERT.equal(SCRAMBLE._offset(5, 0, 10), 5);
  });

  it('is able to return max', () => {
    ASSERT.equal(SCRAMBLE._offset(5, 5, 10), 10);
    ASSERT.equal(SCRAMBLE._offset(0, 10, 10), 10);
    ASSERT.equal(SCRAMBLE._offset(10, 0, 10), 10);
  });

  it('handles wrap-around', () => {
    ASSERT.equal(SCRAMBLE._offset(5, 10, 10), 5);
  });
});

describe('SCRAMBLE#_bitCount', () => {
  it('successfully counts the highest bit', () => {
    const samples = [
      '10010',
      '10110',
      '11001',
    ];
    for (const s of samples) {
      const n = parseInt(s, 2);
      ASSERT.equal(SCRAMBLE._bitCount(n), s.length);
    }
  });

  it('ignores leading zeros', () => {
    const n = 0b00010010;
    ASSERT.equal(SCRAMBLE._bitCount(n), 5);
  });
});
