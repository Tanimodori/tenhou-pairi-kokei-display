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
}
