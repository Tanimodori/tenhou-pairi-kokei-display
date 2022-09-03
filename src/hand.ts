import { mjaka, mjcomp, mjsub, mjtiles } from '@/legacy';

/** Mahjong hand */
export class Hand {
  /** Tiles of the hand */
  tiles: string[];
  /** The parent info */
  parent?: {
    /** The parent hand which generates this hand */
    hand: Hand;
    /** The method that this hand is generated from */
    type: 'discard' | 'draw';
    /** The tile discarded or drawn when generated */
    tile: string;
  };
  /** The children info */
  children: Hand[];
  /** The shanten of this hand, currently not computable */
  shanten?: number;

  /** constructor of hand */
  constructor(tiles: string | string[]) {
    if (typeof tiles === 'string') {
      this.tiles = mjtiles(tiles);
    } else {
      this.tiles = tiles;
    }
    this.tiles.sort(mjcomp);
    this.children = [];
  }

  /** If it contains 3n+2 tiles */
  get full() {
    return this.tiles.length % 3 === 2;
  }

  /** Generate new hand by discarding tile */
  discard(tile: string) {
    const result = new Hand(mjsub(this.tiles, tile));
    result.parent = { hand: this, type: 'discard', tile };
    this.children.push(result);
    return result;
  }

  /** Generate new hand by drawing tile */
  draw(tile: string) {
    const result = new Hand([...this.tiles, tile]);
    result.parent = { hand: this, type: 'draw', tile };
    this.children.push(result);
    return result;
  }

  /** Counting how many tiles remains for given tile */
  remaining(tile: string) {
    const mjequal = (a: string, b: string) => a === b || a === mjaka(b);
    let result = 4;
    this.tiles.forEach((x) => mjequal(x, tile) && --result);
    let cur = this.parent;
    while (cur) {
      mjequal(cur.tile ?? '', tile) && --result;
      cur = cur.hand.parent;
    }
    if (result < 0) {
      throw new Error(`tile "${tile}" has more than 4 tiles`);
    }
    return result;
  }
}
