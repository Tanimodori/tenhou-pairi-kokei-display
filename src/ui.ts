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

/**
 * Get tiles from textarea
 */
export const getTextareaTiles = () => {
  /** Regexp of all valid tiles */
  const pattern = /([0-9]+[mps]|[1-7]+z)+/gm;
  const textarea = document.querySelector<HTMLTextAreaElement>('div#m2 > textarea');
  if (!textarea) {
    throw new Error('Cannot get textarea element');
  }
  const content = textarea.textContent ?? '';
  const matches = content.match(pattern);
  if (matches) {
    return matches.map(mjtiles);
  } else {
    return [];
  }
};
