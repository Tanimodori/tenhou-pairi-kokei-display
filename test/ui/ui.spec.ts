import { mjtiles, run } from '@/legacy';
import { shantenToNumber, getShantenInfo, getTiles, getTextareaTiles } from '@/ui';
import { describe, it, expect, vi } from 'vitest';
import { buildDocument } from './builder';
import { testCases } from './cases';

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
