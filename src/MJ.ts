export default class MJ {
  /**
   * Split a hand into tiles array
   * @param input the hand to be split
   * @returns the tiles array of the hand
   * @example
   * ```ts
   * MJ.toArray('12m3s0p5z'); // -> ['1m', '2m', '3s', '0p', '5z']
   * ```
   */
  static toArray(input: string) {
    const result = [];
    let head, tail;
    for (head = tail = 0; head < input.length; ++head) {
      if ('mpsz'.indexOf(input[head]) === -1) {
        continue;
      }
      for (; tail < head; ++tail) {
        result.push(input[tail] + input[head]);
      }
      ++tail;
    }
    return result;
  }

  /**
   * Transform the tile to the equivalent akadora or non-akadora form
   * @param input the tile to transform
   * @param force `true` to transform to aka, `false` to non-aka, `undefined` oppersite
   * @returns the equivalent akadora or non-akadora form
   * If the tile has no akadora or non-akadora form,
   * i.e. not one of '50m50s50p', output as-is.
   */
  static toAka(input: string, force?: boolean) {
    const [num, suit] = input;
    if ('msp'.indexOf(suit) === -1) {
      return input;
    }
    if (num === '0' || num === '5') {
      if (force === true) {
        return '0' + suit;
      } else if (force === false) {
        return '5' + suit;
      } else {
        return '0' === num ? '5' + suit : '0' + suit;
      }
    }
    return input;
  }

  /**
   * Compare two tiles for sorting
   * @param a the lhs tile to compare
   * @param b the rhs tile to compare
   * @returns the comparison result
   * @example
   * ```ts
   * MJ.compareTile('5s', '6s'); // -> -1
   * MJ.compareTile('5m', '5p'); // -> -1
   * MJ.compareTile('5m', '0m'); // -> -1, '0m' is between '56m'
   * ```
   */
  static compareTile([aNum, aSuit]: string, [bNum, bSuit]: string) {
    const order = '1234506789';
    if (aSuit !== bSuit) {
      return aSuit < bSuit ? -1 : 1;
    } else {
      return order.indexOf(aNum) - order.indexOf(bNum);
    }
  }

  /**
   * Subtract tiles from existing tiles.
   * if source cannot afford subtracting tiles
   * subtraction of such tiles are omitted
   * check the length of result if you want to know fails
   * @param source the array of tiles to be subtracted from
   * @param tiles the array of tiles to be subtracted by
   * @returns the result of subtraction (shallow copy)
   */
  static sub(source: readonly string[], ...tiles: readonly string[]) {
    const result = [...source];
    for (const tile of tiles) {
      const index = result.findIndex((x) => MJ.toAka(x, false) === MJ.toAka(tile, false));
      if (index != -1) {
        result.splice(index, 1);
        continue;
      }
    }
    return result;
  }

  /**
   * Find the remaining count of same tile in the remaining tiles
   * @param source the known hand
   * @param tile the tile to search
   * @returns the remaining count
   */
  static remains(source: readonly string[], tile: string) {
    let result = 4;
    source.forEach((x) => {
      if (MJ.toAka(x, false) === MJ.toAka(tile, false)) {
        --result;
      }
    });
    return result;
  }

  /**
   * Detemine if the hand is a win-hand of 13 orphans
   * @param source the hand
   * @returns `true` if the hand is a win-hand of 13 orphans, `false` otherwise
   */
  static is13Orphans(source: readonly string[]) {
    const orphanTiles = MJ.toArray('19m19p19s1234567z');
    if (source.length !== 14) {
      return false;
    }
    const subbed = MJ.sub(source, ...orphanTiles);
    return subbed.length === 1 && orphanTiles.indexOf(subbed[0]) !== -1;
  }

  /**
   * Detemine if the hand is a win-hand of 7 pairs
   * @param source the hand
   * @returns `true` if the hand is a win-hand of 7 pairs, `false` otherwise
   */
  static is7Pairs(source: readonly string[]) {
    if (source.length !== 14) {
      return false;
    }
    const sorted = source.map((x) => MJ.toAka(x, false)).sort(MJ.compareTile);
    for (let i = 0; i < source.length - 1; ++i) {
      if (i % 2 === 0 && sorted[i] !== sorted[i + 1]) {
        return false;
      }
      if (i % 2 === 1 && sorted[i] === sorted[i + 1]) {
        return false;
      }
    }
    return true;
  }
}
