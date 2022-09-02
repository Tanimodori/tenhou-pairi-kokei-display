import { mjtiles } from './legacy';
import style from './style.css?inline';

/** Inject Css style to the page */
export const inject_css = () => {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);
};

export interface WaitingInfo {
  /** Current hand */
  hand: string[];
  /** Waiting tiles after discards */
  waitings: {
    /** the discarded tile */
    discard?: string;
    /** Waiting tiles after discards */
    tiles: string[];
  }[];
}

/** shanten number */
export interface UIInfoShanten {
  /** shanten number of standard forms */
  standard: number;
  /** shanten number of normal forms */
  normal: number;
}

/** All UI info */
export interface UIInfo extends WaitingInfo {
  /** query type */
  query: {
    /** raw string flags like `q` and `p` */
    raw: string;
    /** `q` flag for `standard`, `p` flag for normal */
    type: 'standard' | 'normal';
    /** if `d` flag presents */
    autofill: boolean;
  };
  shanten: UIInfoShanten;
}

export const getShantenInfo = () => {
  // should use `div#tehai`
  // workarounds for https://github.com/capricorn86/happy-dom/issues/576
  const tehaiElement = document.querySelector<HTMLDivElement>('#tehai');
  if (!tehaiElement) {
    throw new Error('Cannot find #tehai element');
  }
  let result: UIInfoShanten | null = null;
  tehaiElement.childNodes.forEach((node) => {
    if (!result && node.nodeType === node.TEXT_NODE) {
      const text = node.textContent ?? '';
      const pattern = /\d+(?=向聴)/gm;
      const matches = text.match(pattern);
      if (matches) {
        if (matches.length === 1) {
          // one
          const shanten = Number.parseInt(matches[0]);
          result = { standard: shanten, normal: shanten };
        } else if (matches.length === 2) {
          // two
          const standard = Number.parseInt(matches[0]);
          const normal = Number.parseInt(matches[1]);
          result = { standard, normal };
        }
      }
    }
  });
  if (!result) {
    throw new Error('Cannot find shanten info');
  }
  return result;
};

/**
 * Get tiles from hand tile image
 * to get the tile auto-filled by Tenhou-pairi
 */
export const getTiles = () => {
  const pattern = /([0-9][mps]|[1-7]z).gif/;
  const tiles: string[] = [];
  document.querySelectorAll<HTMLImageElement>('div#tehai > a > img').forEach((element) => {
    const match = element.src.match(pattern);
    if (match) {
      tiles.push(match[1]);
    }
  });
  return tiles;
};

/**
 * Parse info from textarea
 */
export const parseTextareaContent = (content: string) => {
  /** Regexp of all valid tiles */
  const pattern = /([0-9]+[mps]|[1-7]+z)+/gm;
  const matches = content.match(pattern);
  const result: WaitingInfo = {
    hand: [],
    waitings: [],
  };
  if (matches) {
    // the hand
    result.hand = mjtiles(matches[0]);
    // check if the content contains discards
    if (content.indexOf('打') !== -1) {
      // have discards
      for (let i = 1; i < matches.length; i += 2) {
        result.waitings.push({ discard: matches[i], tiles: mjtiles(matches[i + 1]) });
      }
    } else {
      // no discards
      for (let i = 1; i < matches.length; ++i) {
        result.waitings.push({ tiles: mjtiles(matches[i]) });
      }
    }
  }
  return result;
};

/**
 * Get tiles from textarea
 */
export const getTextareaTiles = () => {
  const textarea = document.querySelector<HTMLTextAreaElement>('div#m2 > textarea');
  if (!textarea) {
    throw new Error('Cannot get textarea element');
  }
  const content = textarea.textContent ?? '';
  return parseTextareaContent(content);
};

/**
 * Get all ui info
 */
export const getUIInfo = () => {};
