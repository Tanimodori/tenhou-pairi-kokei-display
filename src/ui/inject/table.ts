import { Hand, HandWithParent } from '@/hand';
import MJ from '@/MJ';
import { getShantenTable, ShantenRow, ShantenTile } from './shantenTable';

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
export const renderTableRow = (hand: HandWithParent): ShantenRow => {
  // hand is 1ShantenPartial
  const tiles: ShantenTile[] = [];
  // child is 0ShantenFull
  for (const child of hand.children) {
    const queryType = hand.predicateFn === Hand.predicates.standard ? 'q' : 'p';
    const queryStr = child.tiles.join('');
    tiles.push({
      type: isKoukei(child) ? 'koukei' : 'gukei',
      tile: child.parent.tile,
      count: child.parent.tileCount,
      url: `https://tenhou.net/2/?${queryType}=${queryStr}`,
    });
  }
  return { discard: hand.parent.tile, tiles };
};

/**
 * Create Table element from a calculated/mocked hand
 * @param hand The calculated/mocked full ii-shan-ten hand
 * @returns The table element created
 */
export const renderTable = (hand: Hand) => {
  const children = sortHandByParentTileAndCount(hand.children);
  const config = {
    hand: hand.tiles,
    showHand: false,
    rows: children.map(renderTableRow),
  };
  console.log(config);
  return getShantenTable(config);
};
