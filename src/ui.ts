import { mjtiles } from './legacy';

/** Inject Css style to the page */
export const inject_css = () => {
  const styles = `
    .D {
      position: relative;
    }
    .D .popup {
      visibility: hidden;
      width: 300px;
      background-color: #ddd;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 8px 0;
      position: absolute;
      z-index: 1;
      top: 125%;
      left: 50%;
      margin-left: -150px;
    }
    .D .popup::before {
      content: "";
      position: absolute;
      top: calc(0% - 10px);
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent #ddd transparent;
    }
    .D .popup.show {
      visibility: visible;
    }
    .D .popup table {
        text-align: initial;
        margin-left: auto;
        margin-right: auto;
    }
`;
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.innerText = styles;
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
