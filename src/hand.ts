import MJ from './MJ';

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
      this.tiles = MJ.toArray(tiles);
    } else {
      this.tiles = tiles;
    }
    this.children = [];
  }

  /** If it contains 3n+2 tiles */
  get full() {
    return this.tiles.length % 3 === 2;
  }

  /** Generate new hand by discarding tile */
  discard(tile: string) {
    const result = new Hand(MJ.sub(this.tiles, tile));
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
    const deck = [...tile];
    for (let cur = this.parent; cur; cur = cur.hand.parent) {
      deck.push(cur.tile);
    }
    const result = MJ.remains(deck, tile);
    if (result < 0) {
      throw new Error(`tile "${tile}" has more than 4 tiles`);
    }
    return result;
  }
}
