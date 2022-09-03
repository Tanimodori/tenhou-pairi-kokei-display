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
}
