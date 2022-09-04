import { Hand } from '@/hand';
import { getTenpaikeis, mjtiles } from '@/legacy';
import { shantenToNumber, getShantenInfo, getTiles, getTextareaTiles, getUIInfo } from '@/ui';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildDocument, buildUIinfo } from './builder';
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
    const uiInfo = buildUIinfo(testCase);
    expect(getTextareaTiles()).toEqual({
      hand: mjtiles(testCase.tiles),
      waitings: uiInfo.waitings,
    });
  });

  it('getUIInfo', () => {
    const uiInfo = buildUIinfo(testCase);
    expect(getUIInfo()).toEqual(uiInfo);
  });

  it('getTenpaikeis', () => {
    const uiInfo = buildUIinfo(testCase);
    const tenpaikeis = getTenpaikeis(uiInfo);
    /*
    Object.entries(tenpaikeis).forEach(([discard, iishanten]) => {
      console.log(discard, iishanten);
    });
    */
  });

  it('Hand', () => {
    const hand = new Hand('1122m3344556677s', 'normal');
    hand._1ShantenFull();
    const printHand = (source: Hand, pre = '>') => {
      console.log(pre + source.tiles.join(''));
      for (const child of source.children) {
        printHand(child, '-' + pre);
      }
    };
    printHand(hand);
  });
});
