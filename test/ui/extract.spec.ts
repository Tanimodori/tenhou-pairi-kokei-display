import { mjtiles } from '@/legacy';
import { shantenToNumber, getShantenInfo, getTiles, getTextareaTiles } from '@/ui';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildDocument } from './builder';
import { testCases } from './cases';

describe('Extract pure functions', () => {
  it('shantenToNumber', () => {
    expect(shantenToNumber('8向聴')).toBe(8);
    expect(shantenToNumber('聴牌')).toBe(0);
    expect(shantenToNumber('和了')).toBe(-1);
  });
});

describe.each(testCases)('Extract ui functions', (testCase) => {
  beforeEach(() => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
  });

  it('getShantenInfo', () => {
    expect(getShantenInfo()).toEqual(testCase.calculated.shanten);
  });

  it('getTiles', () => {
    expect(getTiles()).toEqual(mjtiles(testCase.tiles));
  });

  it('getTextareaTiles', () => {
    expect(getTextareaTiles()).toEqual({
      hand: mjtiles(testCase.tiles),
      waitings: testCase.calculated.result.map(([discard, tiles]) => ({
        discard,
        tiles: mjtiles(tiles),
      })),
    });
  });
});
