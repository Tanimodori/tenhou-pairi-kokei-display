import { describe, it, expect, vi } from 'vitest';
import { Window, Document, HTMLElement } from 'happy-dom';
import { run } from 'src/legacy';

/** Test case for ui manipulation */
interface TestCaseInput {
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

type TestCase = Required<TestCaseInput>;

/** Sanitize test cases for testing */
const buildTestCases = (inputs: TestCaseInput[]): TestCase[] => {
  return inputs.map((input) => ({
    tiles: input.input,
    showAllResults: true,
    ...input,
  }));
};

const testCases: TestCase[] = buildTestCases([
  {
    input: '19m19s19p123456z5m2p',
    calculated: {
      shanten: { standard: 1, normal: 7 },
      result: [
        ['5m', '19m19s19p123456z', 40],
        ['2p', '19m19s19p123456z', 40],
      ],
    },
    expected: {
      result: [
        ['5m', '19m19s19p123456z', 40, '', 0],
        ['2p', '19m19s19p123456z', 40, '', 0],
      ],
    },
  },
]);

/**
 * Construct element for testing
 * @param document the document object
 * @param spec the spec of element
 */
const buildElement = (document: Document, spec: string | HTMLElement | Record<string, unknown>) => {
  if (typeof spec === 'string') {
    return document.createTextNode(spec);
  }
  if (spec instanceof HTMLElement) {
    return spec;
  }
  const element = document.createElement(spec['_tag'] as string);
  for (const key in spec) {
    if (key === '_tag') {
      continue;
    } else if (key === '_class') {
      element.className = spec[key] as string;
    } else if (key === '_innerHTML') {
      element.innerHTML = spec[key] as string;
    } else if (key === '_children') {
      const value = spec[key] as typeof spec[];
      const children = value.map((x) => buildElement(document, x));
      element.append(...children);
    } else {
      element.setAttribute(key, spec[key] as string);
    }
  }
  return element;
};

/**
 * Build the input form of website
 * @param document the window document object
 * @param input the content of input
 */
const buildForm = (document: Document, input: string) => {
  return buildElement(document, {
    _tag: 'form',
    name: 'f',
    _children: [
      // link of "新規"
      { _tag: 'a', href: '?', _innerHTML: '新規' },
      // text " | 手牌 "
      ' | 手牌 ',
      // input text
      { _tag: 'input', type: 'text', name: 'q', _innerHTML: input },
      // input submit
      { _tag: 'input', type: 'submit' },
      // hr
      { _tag: 'hr' },
    ],
  });
};

const buildDocument = (testCase: TestCase) => {
  // create document
  const window = new Window();
  const document = window.document;
  // create container
  const container = buildElement(document, {
    _tag: 'div',
    _children: [buildForm(document, testCase.input)],
  });
  // mount and return
  document.body.appendChild(container);
  return window;
};

describe('Test ui functions', () => {
  it.each(testCases)('can render table', (testCase) => {
    const window = buildDocument(testCase);
    console.log(window.document.body.innerHTML);
    vi.stubGlobal('document', window.document);
    run();
  });
});
