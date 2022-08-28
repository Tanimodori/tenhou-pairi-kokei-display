import { describe, it, expect } from 'vitest';
import { mjcomp, mjtiles } from 'src/legacy';

describe('Test tiles manipulating functions', () => {
  it('mjtiles: can split tiles', () => {
    expect(mjtiles('12m3s0p5z')).toEqual(['1m', '2m', '3s', '0p', '5z']);
  });

  it('mjcomp: can compare tiles', () => {
    // same suite
    expect(mjcomp('5s', '6s')).toBeLessThan(0);
    expect(mjcomp('5s', '5s')).toEqual(0);
    expect(mjcomp('5s', '0s')).toBeLessThan(0);
    expect(mjcomp('0s', '6s')).toBeLessThan(0);
    // different suite
    expect(mjcomp('9m', '1p')).toBeLessThan(0);
    expect(mjcomp('9p', '1s')).toBeLessThan(0);
    expect(mjcomp('9s', '1z')).toBeLessThan(0);
  });
});
