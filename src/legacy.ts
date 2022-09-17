import {
  getUIInfo,
  injectCss,
  renderTableLegacy,
  UIInfo,
  TextareaInfo,
  getTableConfigFromHand,
  getShantenTable,
} from '@/ui';
import { Hand } from './hand';
import MJ from './MJ';

/**
 * Split a hand into tiles array
 * @param input the hand to be split
 * @returns the tiles array of the hand
 * @deprecated
 * @example
 * ```ts
 * mjtiles('12m3s0p5z'); // -> ['1m', '2m', '3s', '0p', '5z']
 * ```
 */
export const mjtiles = MJ.toArray;

/**
 * Compare two tiles for sorting
 * @param a the lhs tile to compare
 * @param b the rhs tile to compare
 * @returns the comparison result
 * @deprecated
 * @example
 * ```ts
 * mjcomp('5s', '6s'); // -> -1
 * mjcomp('5m', '5p'); // -> -1
 * mjcomp('5m', '0m'); // -> -0.5, '0m' is between '56m'
 * ```
 */
export const mjcomp = MJ.compareTile;

/** All orphan tiles */
export const MJ_13ORPHAN_TILES = mjtiles('19m19p19s1234567z');
/** All tiles except akadora */
export const MJ_TILES = mjtiles('123456789m123456789p123456789s1234567z');

/**
 * If true, we are calculating standard forms.
 * i.e. 7 pairs or 13 orphans are included.
 */
export let global_show_all_result = false;

/**
 * Transform the tile to the equivalent akadora or non-akadora form
 * @param tile the tile to transform
 * @returns the equivalent akadora or non-akadora form
 * If the tile has no akadora or non-akadora form,
 * i.e. not one of '50m50s50p', output as-is.
 * @deprecated
 */
export const mjaka = MJ.toAka;

/**
 * The array of mj tiles, with `mjfail` indicating whether it is valid
 * @deprecated
 */
export type MJArray = string[] & { mjfail: boolean };

/**
 * Subtract tiles from existing array of tiles.
 * @param mjarr the array of tiles to be subtracted from
 * @param tiles the array of tiles to be subtracted by
 * @returns the result of subtraction (no copy)
 * @deprecated
 */
export const mjsub = (mjarr: MJArray, ...tiles: string[]) => {
  if (mjarr.mjfail) return;
  const result = MJ.sub(mjarr, ...tiles);
  if (result.length !== mjarr.length - tiles.length) {
    mjarr.mjfail = true;
    return mjarr;
  } else {
    mjarr.splice(0, mjarr.length, ...result);
    return mjarr;
  }
};

/**
 * Detemine if the hand is a win-hand of 7 pairs
 * @param mjarr the hand
 * @returns `true` if the hand is a win-hand of 7 pairs, `false` otherwise
 * @deprecated
 */
export const mj7toi = MJ.is7Pairs;

/**
 * Detemine if the hand is a win-hand of 13 orphans
 * @param mjarr the hand
 * @returns `true` if the hand is a win-hand of 13 orphans, `false` otherwise
 * @deprecated
 */
export const mj13orphan = (mjarr: MJArray) => {
  if (mjarr.mjfail) {
    return false;
  }
  return MJ.is13Orphans(mjarr);
};

/**
 * Detemine if the hand is a win-hand (Cached version)
 * @param mjarr the hand
 * @returns `true` if the hand is a win-hand , `false` otherwise
 * @deprecated
 */
export const mjagari = (mjarr: MJArray, show_all_result = global_show_all_result) => {
  if (mjarr.mjfail || mjarr.length % 3 === 1) return false;
  if (show_all_result) {
    return MJ.isWinHand(mjarr);
  } else {
    return MJ.isNormalWinHand(mjarr);
  }
};

/**
 * Detemine if the hand is a win-hand (Non-cached version)
 * @param mjarr the hand
 * @returns `true` if the hand is a win-hand , `false` otherwise
 * @deprecated
 */
export const mjagari_raw = MJ.isNormalWinHand;

/**
 * Temp fix for testing mjagari
 * TODO: remove global variables
 * @param show_all_result value set to `global_show_all_result`
 */
export const resetMjagari = (show_all_result = global_show_all_result) => {
  global_show_all_result = show_all_result;
};

/**
 * Find the remaining count of same tile in the remaining tiles
 * @param mjarr the known hand
 * @param tile the tile to search
 * @returns the remaining count
 * @deprecated
 */
export const mjnokori = MJ.remains;

/**
 * Find the waiting tiles of the given hand
 * @param mjarr the hand
 * @returns the waiting tiles
 * @deprecated
 */
export const mjmachi = (mjarr: MJArray) => {
  return MJ.findWaitingTiles(mjarr, global_show_all_result ? MJ.isWinHand : MJ.isNormalWinHand);
};

/**
 * The waiting forms of a hand
 * @deprecated
 */
export interface Tenpaikei {
  /** Maxinum count of waiting tiles of all possible forms*/
  nokori_max: number;
  /** Waiting forms of the hand after discard the `tile` */
  [tile: string]: {
    /** Counting waiting tiles of the waiting form */
    [machi: string]: number;
    /** Counting all waiting tiles of the waiting form */
    nokori: number;
  };
}

/**
 * one waiting form of a hand of ii-shan-ten
 * @deprecated
 */
export interface TenpaikeiExtended extends Tenpaikei {
  link: string;
  nokori_self: number;
  koukei: number;
  gukei: number;
  koukeihais: unknown[];
  gukeihais: unknown[];
}

/**
 * ii-shan-ten
 * @deprecated
 */
export interface Iishanten {
  koukei: number;
  gukei: number;
  koukeihais: string[];
  gukeihais: string[];
  [tile: string]: TenpaikeiExtended;
}

/**
 * Find waiting forms of the given hand
 * @param mjarr the hand
 * @returns the waiting forms
 */
export const mjtenpaikei = (mjarr: MJArray) => {
  if (mjarr.length % 3 === 1) return {} as Tenpaikei;
  const result = {} as Tenpaikei;
  result.nokori_max = 0;
  const unique = (value, index, self) => self.indexOf(value) === index;
  for (const tile of mjarr.filter(unique)) {
    const machi = mjmachi(mjsub([...mjarr], tile));
    if (machi.length > 0) {
      result[tile] = {};
      result[tile].nokori = 0;
      for (const machihai of machi) {
        const nokori = mjnokori([...mjarr, tile], machihai);
        result[tile][machihai] = nokori;
        result[tile].nokori += nokori;
      }
      result.nokori_max = Math.max(result.nokori_max, result[tile].nokori);
    }
  }
  return result;
};

/** @deprecated */
export const getTenpaikeis = (info: TextareaInfo) => {
  const hands = info.hand;
  const tenpaikeis: Record<string, Iishanten> = {};
  for (const waiting of info.waitings) {
    const sutehai = waiting.discard; // TODO: check null
    const tsumohais = waiting.tiles;
    const tenpaikeis_local = {} as Iishanten;
    tenpaikeis_local.koukei = 0;
    tenpaikeis_local.gukei = 0;
    tenpaikeis_local.koukeihais = [];
    tenpaikeis_local.gukeihais = [];
    for (const tsumohai of tsumohais) {
      const hands_local = [...mjsub([...hands], sutehai), tsumohai];
      const tenpaikei_local = mjtenpaikei(hands_local) as TenpaikeiExtended;
      tenpaikei_local.link = '?' + (global_show_all_result ? 'q' : 'p') + '=' + hands_local.join('');
      tenpaikei_local.nokori_self = mjnokori(hands, tsumohai);
      if (tenpaikei_local.nokori_max > 4) {
        tenpaikeis_local.koukei += tenpaikei_local.nokori_self;
        tenpaikeis_local.koukeihais.push(tsumohai);
      } else {
        tenpaikeis_local.gukei += tenpaikei_local.nokori_self;
        tenpaikeis_local.gukeihais.push(tsumohai);
      }
      tenpaikeis_local[tsumohai] = tenpaikei_local;
    }
    tenpaikeis[sutehai] = tenpaikeis_local;
  }
  return tenpaikeis;
};

/**
 * The main function of script
 */
export const run = () => {
  // check
  let uiInfo: UIInfo;
  try {
    uiInfo = getUIInfo();
  } catch (e: unknown) {
    if (import.meta.env.DEV) {
      throw e;
    }
    return;
  }

  // legacy
  const queryType = uiInfo.query.type;
  global_show_all_result = queryType === 'standard';

  // prechecks
  if (uiInfo.shanten[queryType] !== 1) {
    return;
  }
  // allowing input like (3n+2) after tenhou-pairi auto fill
  // TODO: add test
  if (uiInfo.hand.length % 3 !== 2) {
    return;
  }

  // inject css
  injectCss();

  // calculate tenpaikei
  const tenpaikeis = getTenpaikeis(uiInfo);
  // display tenpaikei
  renderTableLegacy(tenpaikeis);

  const hand = new Hand(uiInfo.hand, queryType);
  hand.mockShanten(1);
  const tableConfig = getTableConfigFromHand(hand);
  const table = getShantenTable(tableConfig);
  console.log(tableConfig);
  document.querySelector('#m2 > table')?.after(table);
};
