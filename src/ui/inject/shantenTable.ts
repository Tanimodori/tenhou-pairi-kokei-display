import { ElementSpec, getElement } from '../utils';

/**
 * The type of tile drawn to form teipaikei.
 *
 * Used to detemine tile in the row.
 */
export type ShantenTileType = 'koukei' | 'gukei' | null;

/**
 * The tile drawn to form teipaikei.
 */
export interface ShantenTile {
  /** tile string */
  tile: string;
  /** tile count remaining */
  count: number;
  /** tile type */
  type: ShantenTileType;
  /** url on tile link element */
  url?: string;
  /** info to display when hover on tile */
  child?: ShantenTable;
}

/**
 * The row of shanten table.
 */
export interface ShantenRow {
  /**
   * The discard tile shown at the beginning of row.
   */
  discard?: string;
  /**
   * The tiles in the row.
   */
  tiles: ShantenTile[];
  /**
   * If true, display "待ち" on row, otherwise "摸".
   */
  tenpai?: boolean;
}
/**
 * The shanten table.
 */
export interface ShantenTable {
  /**
   * The hand of 1 shanten.
   * Last tile is considered current drawn tile.
   */
  hand: string[];
  /**
   * Display hand or not.
   */
  showHand?: boolean;
  /**
   * The rows in the table.
   */
  rows: ShantenRow[];
}

/**
 * Get a shanten table element based on given config.
 * @param config the config of table
 */
export function getShantenTable(config: ShantenTable): HTMLElement {
  // TODO
  const table = getElement({
    _tag: 'table',
    cellpadding: '2',
    cellspacing: '0',
    _children: [
      {
        _tag: 'tbody',
        _children: config.rows.map(getShantenRow),
      },
    ],
  }) as HTMLElement;
  if (config.showHand) {
    return getElement({
      _tag: 'div',
      children: [{ _tag: 'div', _children: config.hand.map(getShantenRowTile) }, table],
    }) as HTMLElement;
  } else {
    return table;
  }
}

/**
 * Get a shanten table row element based on given config.
 * @param config the config of row
 */
export function getShantenRow(config: ShantenRow): HTMLElement {
  // 1.  split
  const tiles = splitRowTiles(config);
  // 2.  childs
  // 2.1 discard
  const tdData: Array<ElementSpec[]> = [];
  if (config.discard) {
    tdData.push(['打']);
    tdData.push([getShantenRowTile(config.discard)]);
  }
  tdData.push([config.tenpai ? '待ち' : '摸']);
  // 2.2 koukei, gukei
  let koukeiTotalCount: number | undefined;
  let gukeiTotalCount: number | undefined;
  const hasKoukei = tiles.koukei.length > 0;
  const hasGukei = tiles.gukei.length > 0;
  if (hasKoukei || hasGukei) {
    // koukei
    if (hasKoukei) {
      tdData.push(tiles.koukei.map(getShantenRowTile));
      koukeiTotalCount = tiles.koukei.reduce((a, x) => a + x.count, 0);
      tdData.push([`好形${koukeiTotalCount}枚`]);
    } else {
      koukeiTotalCount = 0;
      tdData.push([]);
      tdData.push([]);
    }
    // +
    tdData.push([hasKoukei && hasGukei ? '+' : '']);
    // gukei
    if (hasGukei) {
      tdData.push(tiles.gukei.map(getShantenRowTile));
      gukeiTotalCount = tiles.gukei.reduce((a, x) => a + x.count, 0);
      tdData.push([`愚形${gukeiTotalCount}枚`]);
    } else {
      gukeiTotalCount = 0;
      tdData.push([]);
      tdData.push([]);
    }
    // =
    tdData.push(['=']);
  }
  // 3.  other
  const hasOther = tiles.other.length > 0;
  if (hasOther) {
    tdData.push(tiles.other.map(getShantenRowTile));
  }
  // 4.  total count
  const totalCount = config.tiles.reduce((a, x) => a + x.count, 0);
  tdData.push([`${totalCount}枚`]);
  // 5.  total ratio
  if (koukeiTotalCount !== undefined) {
    const ratio = Math.round((100 * koukeiTotalCount) / totalCount);
    tdData.push([`（好形率${ratio}%）`]);
  }
  tdData.push([']']);
  // 6.  map and return
  return getElement({
    _tag: 'tr',
    _children: tdData.map((x) => ({
      _tag: 'td',
      children: x,
    })),
  }) as HTMLElement;
}

function splitRowTiles(config: ShantenRow) {
  const koukei: ShantenTile[] = [];
  const gukei: ShantenTile[] = [];
  const other: ShantenTile[] = [];
  for (const tile of config.tiles) {
    if (tile.type === 'koukei') {
      koukei.push(tile);
    } else if (tile.type === 'gukei') {
      gukei.push(tile);
    } else {
      other.push(tile);
    }
  }
  return { koukei, gukei, other };
}

/**
 * Get a shanten table row tile element based on given config.
 * @param config the config of tile.
 * * if `string`, render it as img element
 * * if `ShantenTile`, render it as link elment
 */
export function getShantenRowTile(config: ShantenTile | string): HTMLElement {
  if (typeof config === 'string') {
    return getElement({
      _tag: 'img',
      src: `https://cdn.tenhou.net/2/a/${config}.gif`,
      border: '0',
      class: 'D',
    }) as HTMLElement;
  } else {
    const element = getShantenRowTile(config.tile);
    // TODO
    return element;
  }
}
