import { describe, it, expect, vi } from 'vitest';
import { Window, Document, HTMLElement } from 'happy-dom';
import { mjtiles, run } from 'src/legacy';
import { getShantenInfo, getTextareaTiles, getTiles, shantenToNumber } from 'src/ui';

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

/** Get the tenpai text */
const getTenpaiText = (shanten: { standard: number; normal: number }) => {
  const rawText = (x: number) => (x ? `${x}向聴` : `聴牌`);
  const { standard, normal } = shanten;
  if (standard !== normal) {
    return `標準形${rawText(standard)} / 一般形${rawText(normal)}`;
  } else {
    return `${rawText(standard)} `;
  }
};

/**
 * Build the hand of website
 * @param document the window document object
 * @param testCase the test case
 */
const buildHand = (document: Document, testCase: TestCase) => {
  const tiles = mjtiles(testCase.tiles).map((tile) =>
    buildElement(document, {
      _tag: 'a',
      href: '?', // inaccurate
      _class: 'D',
      _children: [{ _tag: 'img', src: `https://cdn.tenhou.net/2/t/${tile}.gif` }],
    }),
  );
  // result
  return buildElement(document, {
    _tag: 'div',
    id: 'tehai',
    _children: [getTenpaiText(testCase.calculated.shanten), { _tag: 'br' }, ...tiles],
  });
};

/**
 * Build the teipaikei table of website
 * @param document the window document object
 * @param testCase the test case
 */
const buildTeipaikeiTable = (document: Document, testCase: TestCase) => {
  /**
   * transform tile to tenhou tile ID
   * [1..9m][1..9p][1..9s][1..7z] -> [0..33]
   */
  const tile2Id = (tile: string) => 'mpsz'.indexOf(tile[1]) * 9 + (tile[0] === '0' ? 4 : Number(tile[0])) - 1;
  const trs = testCase.calculated.result.map(([discard, tiles, count]) => {
    const tds = mjtiles(tiles).map((tile) =>
      buildElement(document, {
        _tag: 'a',
        href: '?', // inaccurate
        _class: 'D',
        _children: [{ _tag: 'img', src: `https://cdn.tenhou.net/2/a/${tile}.gif` }],
      }),
    );
    return buildElement(document, {
      _tag: 'tr',
      id: `mda${tile2Id(discard)}`,
      _children: [
        { _tag: 'td', _innerHTML: `打` },
        {
          _tag: 'td',
          _children: [{ _tag: 'img', src: `https://cdn.tenhou.net/2/a/${discard}.gif` }],
        },
        { _tag: 'td', _innerHTML: `摸[` },
        { _tag: 'td', _children: tds },
        { _tag: 'td', _innerHTML: `${count}枚` },
        { _tag: 'td', _innerHTML: `]` },
      ],
    });
  });
  return buildElement(document, {
    _tag: 'table',
    _children: [{ _tag: 'tbody', _children: trs }],
  });
};

/**
 * Get the textarea content
 * @param testCase the test case
 */
const buildTextareaContent = (testCase: TestCase) => {
  // It uses `testCase.input`, not `testCase.tiles`
  const firstLine = `${testCase.input}\n`;
  const mainLines = testCase.calculated.result.map(
    ([discard, tiles, count]) => `打${discard} 摸[${mjtiles(tiles).join('')} ${count}枚]`,
  );
  return firstLine + mainLines.join('\n');
};

/**
 * Build the `div#m2` of website
 * @param document the window document object
 * @param testCase the test case
 */
const buildM2Div = (document: Document, testCase: TestCase) => {
  const standardFormText = [`標準形(七対国士を含む)の計算結果 / `, `一般形`];
  const normalFormText = [`一般形(七対国士を含まない)の計算結果 / `, `標準形`];
  const formText = testCase.showAllResults ? standardFormText : normalFormText;
  return buildElement(document, {
    _tag: 'div',
    id: 'm2',
    _children: [
      { _tag: 'hr' },
      formText[0],
      {
        _tag: 'a',
        href: '?', // inaccurate
        _innerHTML: formText[1],
      },
      { _tag: 'br' },
      buildTeipaikeiTable(document, testCase),
      { _tag: 'br' },
      { _tag: 'hr' },
      { _tag: 'br' },
      { _tag: 'textarea', _innerHTML: buildTextareaContent(testCase) },
      { _tag: 'br' },
    ],
  });
};

/**
 * Build document of website
 * @param testCase the test case
 */
const buildDocument = (testCase: TestCase) => {
  // create document
  const window = new Window();
  const document = window.document;
  // create container
  const container = buildElement(document, {
    _tag: 'div',
    _children: [buildForm(document, testCase.input), buildHand(document, testCase), buildM2Div(document, testCase)],
  });
  // mount and return
  document.body.appendChild(container);
  return window;
};

describe('Test ui functions', () => {
  it('shantenToNumber', () => {
    expect(shantenToNumber('8向聴')).toBe(8);
    expect(shantenToNumber('聴牌')).toBe(0);
    expect(shantenToNumber('和了')).toBe(-1);
  });

  it.each(testCases)('getShantenInfo', (testCase) => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
    expect(getShantenInfo()).toEqual(testCase.calculated.shanten);
  });

  it.each(testCases)('getTiles', (testCase) => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
    expect(getTiles()).toEqual(mjtiles(testCase.tiles));
  });

  it.each(testCases)('getTextareaTiles', (testCase) => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
    expect(getTextareaTiles()).toEqual({
      hand: mjtiles(testCase.tiles),
      waitings: testCase.calculated.result.map(([discard, tiles]) => ({
        discard,
        tiles: mjtiles(tiles),
      })),
    });
  });

  it.each(testCases)('can render table', (testCase) => {
    const window = buildDocument(testCase);
    vi.stubGlobal('document', window.document);
    run();
  });
});
