import MJ, { HandPredicate } from './MJ';

/** Mahjong hand */
export class Hand {
  static allTiles = MJ.toArray('123456789m123456789p123456789s1234567z');
  static predicates: Record<string, HandPredicate> = {
    standard: MJ.isWinHand,
    normal: MJ.isNormalWinHand,
  };
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
  /** The predicate of this hand */
  predicate: string | HandPredicate;

  /** constructor of hand */
  constructor(tiles: string | string[], predicate: string | HandPredicate = 'standard') {
    if (typeof tiles === 'string') {
      this.tiles = MJ.toArray(tiles);
    } else {
      this.tiles = tiles;
    }
    this.children = [];
    this.predicate = predicate;
  }

  /** If it contains 3n+2 tiles */
  get full() {
    return this.tiles.length % 3 === 2;
  }

  /** returns predicate function */
  get predicateFn() {
    if (typeof this.predicate === 'function') {
      return this.predicate;
    } else if (this.predicate in Hand.predicates) {
      return Hand.predicates[this.predicate];
    } else {
      throw new Error(`Unknown predicate "${this.predicate}"`);
    }
  }

  /** Generate new hand by discarding tile */
  discard(tile: string) {
    const result = new Hand(MJ.sub(this.tiles, tile), this.predicate);
    result.parent = { hand: this, type: 'discard', tile };
    return result;
  }

  /** Generate new hand by drawing tile */
  draw(tile: string) {
    const result = new Hand([...this.tiles, tile], this.predicate);
    result.parent = { hand: this, type: 'draw', tile };
    return result;
  }

  /** Counting how many tiles remains for given tile */
  remains(tile: string) {
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

  /** Check if this hand is a win hand */
  isWinHand() {
    return this.predicateFn(this.tiles);
  }

  /** Returns unique tiles of this hand */
  uniqueTiles(normalize = false) {
    const unique = (value: string, index: number, self: string[]) => self.indexOf(value) === index;
    let target = this.tiles;
    if (normalize) {
      target = MJ.normalize(target);
    }
    return target.filter(unique);
  }

  /**
   * Compute all full hands with x shan-ten.
   * Expected to be called on a partial (3n+1) hand
   * with x shanten
   * @returns All child hands
   * @internal
   */
  _xShantenPartial(childPredicate: (this: Hand) => boolean) {
    if (this.tiles.length % 3 !== 1) {
      return [];
    }
    this.children = [];
    for (const tile of Hand.allTiles) {
      if (this.remains(tile) <= 0) {
        continue;
      }
      const child = this.draw(tile);
      if (childPredicate.call(child)) {
        this.children.push(child);
      }
    }
    return this.children;
  }

  /**
   * @see _xShantenPartial
   * @internal
   */
  _0ShantenPartial() {
    return this._xShantenPartial(this.isWinHand);
  }

  /**
   * @see _xShantenPartial
   * @internal
   */
  _1ShantenPartial() {
    return this._xShantenPartial(function () {
      return this._0ShantenFull().length !== 0;
    });
  }

  /**
   * Compute all partial hands with x shan-ten.
   * Expected to be called on a full (3n+2) hand
   * with x shanten (tenpai)
   * @returns All child hands
   * @internal
   */
  _xShantenFull(childPredicate: (this: Hand) => boolean) {
    if (this.tiles.length % 3 !== 2) {
      return [];
    }
    this.children = [];
    for (const tile of this.uniqueTiles(true)) {
      const child = this.discard(tile);
      if (childPredicate.call(child)) {
        this.children.push(child);
      }
    }
    return this.children;
  }

  /**
   * @see _xShantenFull
   * @internal
   */
  _0ShantenFull() {
    return this._xShantenFull(function () {
      return this._0ShantenPartial().length !== 0;
    });
  }

  /**
   * @see _xShantenFull
   * @internal
   */
  _1ShantenFull() {
    return this._xShantenFull(function () {
      return this._1ShantenPartial().length !== 0;
    });
  }
}
