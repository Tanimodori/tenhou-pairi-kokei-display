import { describe, it, expect } from 'vitest';
import { mjaka, MJArray, mjcomp, mjsub, mjtiles } from 'src/legacy';

describe('mjtiles', () => {
  it('can split tiles', () => {
    expect(mjtiles('12m3s0p5z')).toEqual(['1m', '2m', '3s', '0p', '5z']);
  });
});

describe('mjcomp', () => {
  it('can compare tiles', () => {
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

describe('mjaka', () => {
  it('can convert akadoras', () => {
    expect(mjaka('5m')).toBe('0m');
    expect(mjaka('0m')).toBe('5m');
    expect(mjaka('5z')).toBe('5z');
    expect(mjaka('6s')).toBe('6s');
  });
});

describe('mjsub', () => {
  const getHand = (tiles = '456s50p') => {
    const hand = mjtiles(tiles) as MJArray;
    hand.mjfail = false;
    return hand;
  };

  it('should skip failed hand', () => {
    const hand = getHand();
    hand.mjfail = true;
    // TODO: return undefined is not a good practice
    expect(mjsub(hand)).toEqual(undefined);
  });

  it('can subtract tiles', () => {
    const hand = getHand();
    expect(mjsub(hand, '5s')).toEqual(getHand('46s50p'));
  });

  it('subtracts akadoras when necessary', () => {
    expect(mjsub(getHand(), '0s')).toEqual(getHand('46s50p'));
    expect(mjsub(getHand(), '5p')).toEqual(getHand('456s0p'));
    expect(mjsub(getHand(), '5p', '5p')).toEqual(getHand('456s'));
  });

  it('should fail when no tile can be subtracted', () => {
    expect(mjsub(getHand(), '5z')?.mjfail).toBe(true);
  });
});
