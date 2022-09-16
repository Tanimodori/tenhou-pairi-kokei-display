import { Hand, HandWithParent } from '@/hand';
import MJ from '@/MJ';
import { create_node_tile_img } from './legacy';

/**
 * Get the total count of parent tile of children
 * @param children the children
 * @returns total count of parent tiles available of all children
 */
export const getTotalTileCounts = (children: HandWithParent[]) => {
  return children.reduce((a, x) => a + x.parent.tileCount, 0);
};

/**
 * Sort children by parent tile
 * @param children the children
 * @returns sorted children
 */
export const sortHandByParentTile = (children: HandWithParent[]) => {
  return children.sort((a, b) => MJ.compareTile(a.parent.tile, b.parent.tile));
};

/**
 * Sort children by waiting counts and tile
 * @param children the children
 * @returns sorted children
 */
export const sortHandByParentTileAndCount = (children: HandWithParent[]) => {
  return children.sort((a, b) => {
    const aNum = getTotalTileCounts(a.children);
    const bNum = getTotalTileCounts(b.children);
    return aNum !== bNum ? bNum - aNum : MJ.compareTile(a.parent.tile, b.parent.tile);
  });
};

/**
 * Generate anchor element of a full tenpai hand
 * @param hand The tenpai full hand
 * @returns the link anchor used in the row
 */
export const get0ShantenFullAnchors = (hand: HandWithParent) => {
  return create_node_tile_img(hand.parent.tile);
};

/**
 * Determine a hand can have a koukei tenpai
 * @param hand The full tenpai hand
 * @returns `true` if the hand has any partial ten-pai hand waiting for more than 4 tiles.
 */
export const isKoukei = (hand: Hand) => {
  // hand is 0ShantenFull
  //  child is 0ShantenPartial
  for (const child of hand.children) {
    const waitingCount = getTotalTileCounts(child.children);
    if (waitingCount > 4) {
      return true;
    }
  }
  return false;
};

/**
 * Generate row element of a partial hand of ii-shan-ten
 * @param hand The partial hand of ii-shan-ten
 * @returns The row element generated
 */
export const renderTableRow = (hand: HandWithParent) => {
  const tr = document.createElement('tr');
  // hand is 1ShantenPartial
  let koukeis: HandWithParent[] = [];
  let gukeis: HandWithParent[] = [];
  // child is 0ShantenFull
  for (const child of hand.children) {
    const isChildKoukei = isKoukei(child);
    if (isChildKoukei) {
      koukeis.push(child);
    } else {
      gukeis.push(child);
    }
  }
  koukeis = sortHandByParentTile(koukeis);
  gukeis = sortHandByParentTile(gukeis);
  const koukeiCount = getTotalTileCounts(koukeis);
  const gukeiCount = getTotalTileCounts(gukeis);
  const totalCount = koukeiCount + gukeiCount;
  const tdDatas = [
    '打',
    create_node_tile_img(hand.parent.tile),
    '摸[',
    koukeis.map(get0ShantenFullAnchors),
    koukeiCount ? `好形${koukeiCount}枚` : ``,
    koukeiCount && gukeiCount ? '+' : '',
    gukeis.map(get0ShantenFullAnchors),
    gukeiCount ? `愚形${gukeiCount}枚` : ``,
    `=${totalCount}枚`,
    `（好形率${Math.round((100 * koukeiCount) / totalCount)}%）`,
    ']',
  ];
  const tds = tdDatas.map((data) => {
    const td = document.createElement('td');
    if (Array.isArray(data)) {
      td.append(...data);
    } else {
      td.append(data);
    }
    return td;
  });
  tr.append(...tds);
  return tr;
};

/**
 * Create Table element from a calculated/mocked hand
 * @param hand The calculated/mocked full ii-shan-ten hand
 * @returns The table element created
 */
export const renderTable = (hand: Hand) => {
  const table = document.createElement('table');
  table.setAttribute('cellpadding', '2');
  table.setAttribute('cellspacing', '0');
  const tbody = document.createElement('tbody');
  const children = sortHandByParentTileAndCount(hand.children);
  for (const child of children) {
    tbody.append(renderTableRow(child));
  }
  table.appendChild(tbody);
  return table;
};
