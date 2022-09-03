import { getUIInfo, inject_css, renderTable, UIInfo, TextareaInfo } from '@/ui';

/**
 * Split a hand into tiles array
 * @param input the hand to be split
 * @returns the tiles array of the hand
 * @example
 * ```ts
 * mjtiles('12m3s0p5z'); // -> ['1m', '2m', '3s', '0p', '5z']
 * ```
 */
export const mjtiles = (input: string) => {
  const result = [];
  let stk = '';
  for (const tile_i of input) {
    if ('0' <= tile_i && tile_i <= '9') {
      stk += tile_i;
    } else {
      for (const tile_j of stk) {
        result.push(tile_j + tile_i);
      }
      stk = '';
    }
  }
  return result;
};

/**
 * Compare two tiles for sorting
 * @param a the lhs tile to compare
 * @param b the rhs tile to compare
 * @returns the comparison result
 * @example
 * ```ts
 * mjcomp('5s', '6s'); // -> -1
 * mjcomp('5m', '5p'); // -> -1
 * mjcomp('5m', '0m'); // -> -0.5, '0m' is between '56m'
 * ```
 */
export const mjcomp = (a: string, b: string) => {
  let [a_n, a_t] = a;
  let [b_n, b_t] = b;
  if (a_n === '0') a_n = 5.5;
  if (b_n === '0') b_n = 5.5;
  return a_t !== b_t ? (a_t < b_t ? -1 : 1) : Number(a_n) - Number(b_n);
};

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
 */
export const mjaka = (tile: string) => {
  if ('msp'.indexOf(tile[1]) === -1) {
    return tile;
  }
  if (tile[0] === '0' || tile[0] === '5') {
    return String(5 - Number(tile[0])) + tile[1];
  }
  return tile;
};

/**
 * The array of mj tiles, with `mjfail` indicating whether it is valid
 * @deprecated
 */
export type MJArray = string[] & { mjfail: boolean };

/**
 * Subtract tiles from existing array of tiles.
 * @param mjarr the array of tiles to be subtracted from
 * @param tiles the array of tiles to be subtracted by
 * @returns the result of subtraction
 */
export const mjsub = (mjarr: MJArray, ...tiles: string[]) => {
  if (mjarr.mjfail) return;
  for (const tile of tiles) {
    let index = mjarr.indexOf(tile);
    if (index != -1) {
      mjarr.splice(index, 1);
      continue;
    }
    index = mjarr.indexOf(mjaka(tile));
    if (index != -1) {
      mjarr.splice(index, 1);
      continue;
    }
    mjarr.mjfail = true;
    return mjarr;
  }
  return mjarr;
};

/**
 * Detemine if the hand is a win-hand of 7 pairs
 * @param mjarr the hand
 * @returns `true` if the hand is a win-hand of 7 pairs, `false` otherwise
 */
export const mj7toi = (mjarr: MJArray) => {
  if (mjarr.length != 14) {
    return false;
  }
  mjarr.sort(mjcomp);
  for (let i = 0; i <= 12; i += 2) {
    if (mjarr[i] !== mjarr[i + 1] && mjarr[i] !== mjaka(mjarr[i + 1])) {
      return false;
    }
    if (i > 0) {
      if (mjarr[i] === mjarr[i - 2] || mjarr[i] === mjaka(mjarr[i - 2])) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Detemine if the hand is a win-hand of 13 orphans
 * @param mjarr the hand
 * @returns `true` if the hand is a win-hand of 13 orphans, `false` otherwise
 */
export const mj13orphan = (mjarr: MJArray) => {
  if (mjarr.length != 14) {
    return false;
  }
  mjsub(mjarr, ...MJ_13ORPHAN_TILES);
  if (!mjarr.mjfail && MJ_13ORPHAN_TILES.indexOf(mjarr[0]) !== -1) {
    return true;
  }
  return false;
};

/** Cache for a hand if it is valid */
let mjagaricache: Record<string, boolean> = {};

/**
 * Detemine if the hand is a win-hand (Cached version)
 * @param mjarr the hand
 * @returns `true` if the hand is a win-hand , `false` otherwise
 */
export const mjagari = (mjarr: MJArray, show_all_result = global_show_all_result) => {
  if (mjarr.mjfail || mjarr.length % 3 === 1) return false;
  if (mjarr.length == 0) {
    return true;
  }
  if (show_all_result) {
    if (mj7toi([...mjarr])) return true;
    if (mj13orphan([...mjarr])) return true;
  }
  const joined_result = mjarr.sort(mjcomp).join('').replace('0', '5');
  if (joined_result in mjagaricache) {
    return mjagaricache[joined_result];
  }
  const result = mjagari_raw(mjarr);
  mjagaricache[joined_result] = result;
  return result;
};

/**
 * Detemine if the hand is a win-hand (Non-cached version)
 * @param mjarr the hand
 * @returns `true` if the hand is a win-hand , `false` otherwise
 */
export const mjagari_raw = (mjarr: MJArray) => {
  const tile = mjarr[0];
  const [tile_num, tile_type] = tile;
  // toitsu
  if (mjarr.length % 3 === 2) {
    if (mjagari(mjsub([...mjarr], tile, tile), false)) return true;
  }
  // kootsu
  if (mjagari(mjsub([...mjarr], tile, tile, tile), false)) return true;
  // shuntsu
  if (tile_type !== 'z') {
    let tile_number = Number(tile_num);
    if (tile_number === 0) tile_number = 5;
    const shuntsu_tiles_groups = [tile_number - 2, tile_number - 1, tile_number]
      .filter((x) => x >= 1 && x <= 7)
      .map((x) => [x + tile_type, x + 1 + tile_type, x + 2 + tile_type]);
    for (const s_tiles of shuntsu_tiles_groups) {
      if (mjagari(mjsub([...mjarr], ...s_tiles), false)) return true;
    }
  }
  return false;
};

/**
 * Temp fix for testing mjagari
 * TODO: remove global variables
 * @param show_all_result value set to `global_show_all_result`
 */
export const resetMjagari = (show_all_result = global_show_all_result) => {
  global_show_all_result = show_all_result;
  mjagaricache = {};
};

/**
 * Find the remaining count of same tile in the remaining tiles
 * @param mjarr the known hand
 * @param tile the tile to search
 * @returns the remaining count
 */
export const mjnokori = (mjarr: MJArray, tile: string) => {
  return 4 - mjarr.filter((x) => x === tile || x === mjaka(tile)).length;
};

/**
 * Find the waiting tiles of the given hand
 * @param mjarr the hand
 * @returns the waiting tiles
 */
export const mjmachi = (mjarr: MJArray) => {
  if (mjarr.length % 3 !== 1) return [];
  return MJ_TILES.filter((tile) => {
    if (mjnokori(mjarr, tile) === 0) return false; // ikasama
    return mjagari([...mjarr, tile]);
  });
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
  inject_css();

  // calculate tenpaikei
  const tenpaikeis = getTenpaikeis(uiInfo);
  // display tenpaikei
  renderTable(tenpaikeis);
};
