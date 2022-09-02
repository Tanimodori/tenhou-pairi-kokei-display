import { mjtiles } from './legacy';
import style from './style.css?inline';

/** Inject Css style to the page */
export const inject_css = () => {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);
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
