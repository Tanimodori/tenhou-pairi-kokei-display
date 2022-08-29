import { describe, it, expect } from 'vitest';
import {
  type MJArray,
  resetMjagari,
  mj13orphan,
  mj7toi,
  mjaka,
  mjcomp,
  mjsub,
  mjtiles,
  mjagari,
  mjnokori,
  mjmachi,
  mjtenpaikei,
  Tenpaikei,
} from 'src/legacy';

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

describe('mj7toi', () => {
  const testHand = (tiles: string) => {
    const hand = mjtiles(tiles) as MJArray;
    hand.mjfail = false;
    return mj7toi(hand);
  };
  it('should calculate winning hands correctly', () => {
    // normal hands is not 7 pairs
    expect(testHand('123456789s12344p')).toBe(false);
    // 13 orphans is not 7 pairs
    expect(testHand('19m19p19s12345677z')).toBe(false);
    // 13 tiles is not 7 pairs
    expect(testHand('1122m334455667p')).toBe(false);
    // 7 pairs should not contain same pairs
    // (bugs fixed in 0.0.7)
    expect(testHand('1122m3344555577p')).toBe(false);
    expect(testHand('1122m3344555077p')).toBe(false);
    // correct 7 pairs with akadoras
    // (bugs fixed in 0.0.3)
    expect(testHand('1122m3344506677p')).toBe(true);
  });
});

describe('mj13orphan', () => {
  const testHand = (tiles: string) => {
    const hand = mjtiles(tiles) as MJArray;
    hand.mjfail = false;
    return mj13orphan(hand);
  };
  it('can calculate winning hands', () => {
    // normal hands is not 13 orphans
    expect(testHand('123456789s12344p')).toBe(false);
    // 7 pairs is not 13 orphans
    expect(testHand('1122m3344556677p')).toBe(false);
    // 13 tiles is not 13 orphans
    expect(testHand('19m19p19s1234567z')).toBe(false);
    // correct 13 orphans
    expect(testHand('19m19p19s12345677z')).toBe(true);
  });
});

describe('mjagari', () => {
  const testHand = (tiles: string, show_all_result = true) => {
    resetMjagari(show_all_result);
    const hand = mjtiles(tiles) as MJArray;
    hand.mjfail = false;
    return mjagari(hand, show_all_result);
  };

  // [hand, standard, normal]
  const cases: [string, boolean, boolean][] = [
    ['123456789m12344p', true, true],
    ['123456789m12345p', false, false],
    ['1122m3344556677p', true, false],
    ['19m19p19s12345677z', true, false],
  ];
  it.each(cases)('can calulate winning hands', (hand, standard, normal) => {
    expect(testHand(hand)).toBe(standard);
    expect(testHand(hand, false)).toBe(normal);
  });
});

describe('mjnokori', () => {
  const getHand = (tiles = '15m50p550s5555z') => {
    const hand = mjtiles(tiles) as MJArray;
    hand.mjfail = false;
    return hand;
  };
  it('can calculate remaining tile count', () => {
    const hand = getHand();
    expect(mjnokori(hand, '1m')).toBe(3);
    expect(mjnokori(hand, '0m')).toBe(3);
    expect(mjnokori(hand, '5p')).toBe(2);
    expect(mjnokori(hand, '5s')).toBe(1);
    expect(mjnokori(hand, '5z')).toBe(0);
  });
});

describe('mjmachi', () => {
  const testHand = (tiles: string, show_all_result = true) => {
    resetMjagari(show_all_result);
    const hand = mjtiles(tiles) as MJArray;
    hand.mjfail = false;
    return mjmachi(hand);
  };

  // [hand, standard, normal]
  const cases: [string, string, string][] = [
    // 23p
    ['123456789m23p11z', '14p', '14p'],
    // 13p
    ['123456789m13p11z', '2p', '2p'],
    // 12p
    ['123456789m12p11z', '3p', '3p'],
    // 1122z
    ['123456789m1122z', '12z', '12z'],
    // 2z
    ['123456789m1112z', '2z', '2z'],
    // 2333p
    ['123456789m2333p', '124p', '124p'],
    // 2444p
    ['123456789m2444p', '23p', '23p'],
    // 1112p
    ['123456789m1112p', '23p', '23p'],
    // 1234p
    ['123456789m1234p', '14p', '14p'],
    // 23456p
    ['11122233m23456p', '147p', '147p'],
    // 1234567p
    ['111222m1234567p', '147p', '147p'],
    // 234p + 4567p
    ['111222m2344567p', '147p', '147p'],
    // 11123m44p
    ['11123m44p111222z', '14m4p', '14m4p'],
    // 234p + 5556p
    ['111222m2345556p', '1467p', '1467p'],
    // 234p + 4555p
    ['111222m2344555p', '1346p', '1346p'],
    // 234p + 3555p
    ['111222m2334555p', '134p', '134p'],
    // 234p + 5666p
    ['111222m2345666p', '12457p', '12457p'],
    // 345p + 1666p (4666p)
    ['111222m1345666p', '12p', '12p'],
    // 234p + 4666p
    ['111222m2344666p', '145p', '145p'],
    // 234p + 5777p
    ['111222m2345777p', '256p', '256p'],
    // 2233444p
    ['111222m2233444p', '1234p', '1234p'],
    // 2233344p
    ['111222m2233344p', '234p', '234p'],
    // 2223444p
    ['111222m2223444p', '12345p', '12345p'],
    // 2333444p
    ['111222m2333444p', '1234p', '1234p'],
    // 2224666p
    ['111222m2224666p', '345p', '345p'],
    // 2222344p
    ['111222m2222344p', '134p', '134p'],
    // 2333344p
    ['111222m2333344p', '1245p', '1245p'],
    // 2344445p
    ['111222m2344445p', '2356p', '2356p'],
    // 7 pairs
    ['1122m334455667p', '7p', ''],
    // 7 pairs - ryanpeikou
    ['1122334455667p', '147p', '147p'],
    // 13 orphans
    ['19m19p19s1234566z', '7z', ''],
    // 13 orphans - 13-men machi
    ['19m19p19s1234567z', '19m19p19s1234567z', ''],
  ];

  it.each(cases)('can calulate waiting tiles', (hand, standard, normal) => {
    expect(testHand(hand)).toEqual(mjtiles(standard));
    expect(testHand(hand, false)).toEqual(mjtiles(normal));
  });
});

describe('mjtenpaikei', () => {
  const testHand = (tiles: string, show_all_result = true) => {
    resetMjagari(show_all_result);
    const hand = mjtiles(tiles) as MJArray;
    hand.mjfail = false;
    return mjtenpaikei(hand);
  };

  const cases: [string, Tenpaikei][] = [
    // no-ten
    ['123456789m258p11z', { nokori_max: 0 }],
    // normal
    [
      '123456789m235p11z',
      {
        nokori_max: 8,
        '5p': { nokori: 8, '1p': 4, '4p': 4 },
        '2p': { nokori: 4, '4p': 4 },
      },
    ],
    // 7 pairs
    [
      '1122m3344556678p',
      {
        nokori_max: 4,
        '3p': { nokori: 4, '1m': 2, '2m': 2 },
        '6p': { nokori: 4, '1m': 2, '2m': 2 },
        '7p': { nokori: 3, '8p': 3 },
        '8p': { nokori: 3, '7p': 3 },
      },
    ],
    // 13 orphans
    [
      '19m19p159s1234567z',
      {
        nokori_max: 39,
        '5s': {
          nokori: 39,
          '1m': 3,
          '9m': 3,
          '1s': 3,
          '9s': 3,
          '1p': 3,
          '9p': 3,
          '1z': 3,
          '2z': 3,
          '3z': 3,
          '4z': 3,
          '5z': 3,
          '6z': 3,
          '7z': 3,
        },
      },
    ],
  ];
  it.each(cases)('can calulate all waiting forms', (hand, standard) => {
    expect(testHand(hand)).toEqual(standard);
  });
});
