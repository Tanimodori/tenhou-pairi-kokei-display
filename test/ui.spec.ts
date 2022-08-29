import { describe, it, expect, vi } from 'vitest';
import { Window } from 'happy-dom';
import { run } from 'src/legacy';

/** Test case for ui manipulation */
interface TestCase {
  /** The string representation of user input. */
  input: string;
  /**
   * The string representation of tile images displayed.
   * If omited, `input` field is used.
   * This is because Tenhou-pairi auto fill feature
   * detemined by input tiles count.
   * * `3n+2`: compute possible waiting forms after discarding a tile.
   * * `3n+1`: randomly add a tile, then considered as `3n+2`.
   * * `3n`: randomly add a tile, then output the waiting form without discarding.
   */
  tiles?: string;
  /**
   * If all results will be shown,
   * including 7 pairs and 13 orphans.
   * `true` for standard forms, and `false` for normal forms.
   * @default true
   */
  showAllResults?: boolean;
  /** Pre-calculated result of default Tenhou-pairi behaviour */
  calculated: {
    /** Shanten number for standard forms and normal forms */
    shanten: {
      standard: number;
      normal: number;
    };
    /**
     * The computed result of given input.
     * In the form of `[discard, waiting, remainingCount]`.
     * `discard` is the tile to be discarded.
     * `waiting` is the tiles to complete the hand.
     * `remainingCount` is the total number of all waiting tiles.
     */
    result: Array<[string, string, number]>;
  };
  /** expectation output */
  expected: {
    /**
     * The computed result of given input.
     * In the form of `[discard, koukeiWaiting, koukeiCount, gukeiWaiting, gukeiCount]`.
     * `discard` is the tile to be discarded.
     * `koukeiWaiting` is the tiles to complete the hand as a koukei-tenpai.
     * `koukeiCount` is the total number of all koukeiWaiting tiles.
     * `gukeiWaiting` is the tiles to complete the hand as a gukei-tenpai.
     * `gukeiCount` is the total number of all gukeiWaiting tiles.
     */
    result: Array<[string, string, number, string, number]>;
  };
}

const buildDocument = (testCase: TestCase) => {
  const window = new Window();
  const document = window.document;
  return window;
};

it('Test ui functions', () => {
  const window = buildDocument(null);
  vi.stubGlobal('document', window.document);
  run();
});
