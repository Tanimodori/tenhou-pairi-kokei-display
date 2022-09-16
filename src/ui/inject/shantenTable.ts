import { e } from 'vitest/dist/index-ea17aa0c';
import { getElement } from '../utils';

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
}

/**
 * Get a shanten table row element based on given config.
 * @param config the config of row
 */
export function getShantenRow(config: ShantenRow): HTMLElement {
  // TODO
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
