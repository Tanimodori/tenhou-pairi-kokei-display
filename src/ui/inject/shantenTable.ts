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

export function getShantenTable(config: ShantenTable): HTMLElement {
  // TODO
}

export function getShantenRow(config: ShantenRow): HTMLElement {
  // TODO
}

export function getShantenRowTile(config: ShantenTile): HTMLElement {
  // TODO
}
