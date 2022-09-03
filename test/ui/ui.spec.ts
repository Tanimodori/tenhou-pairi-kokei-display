import { mjtiles, run } from '@/legacy';
import { shantenToNumber, getShantenInfo, getTiles, getTextareaTiles } from '@/ui';
import { describe, it, expect, vi } from 'vitest';
import { buildDocument, buildTestCases, TestCase } from './builder';

const testCases: TestCase[] = buildTestCases([
  {
    input: '19m19s19p123456z5m2p',
    calculated: {
      shanten: { standard: 1, normal: 7 },
      result: [
        ['5m', '19m19s19p123456z', 40],
        ['2p', '19m19s19p123456z', 40],
      ],
    },
    expected: {
      result: [
        ['5m', '19m19s19p123456z', 40, '', 0],
        ['2p', '19m19s19p123456z', 40, '', 0],
      ],
    },
  },
]);

describe('Test ui functions', () => {
  it('shantenToNumber', () => {
    expect(shantenToNumber('8向聴')).toBe(8);
    expect(shantenToNumber('聴牌')).toBe(0);
    expect(shantenToNumber('和了')).toBe(-1);
  });

  it.each(testCases)('getShantenInfo', (testCase) => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
    expect(getShantenInfo()).toEqual(testCase.calculated.shanten);
  });

  it.each(testCases)('getTiles', (testCase) => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
    expect(getTiles()).toEqual(mjtiles(testCase.tiles));
  });

  it.each(testCases)('getTextareaTiles', (testCase) => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
    expect(getTextareaTiles()).toEqual({
      hand: mjtiles(testCase.tiles),
      waitings: testCase.calculated.result.map(([discard, tiles]) => ({
        discard,
        tiles: mjtiles(tiles),
      })),
    });
  });

  it.each(testCases)('can render table', (testCase) => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
    run();
  });
});
