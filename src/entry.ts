import { Hand } from './hand';
import { UIInfo, getUIInfo, injectCss, getTableConfigFromHand, getShantenTable } from './ui';

/**
 * The main function of script
 */
export const run = () => {
  // check
  let uiInfo: UIInfo;
  try {
    uiInfo = getUIInfo();
  } catch (e: unknown) {
    if (import.meta.env.DEV) {
      throw e;
    }
    return;
  }

  // prechecks
  const queryType = uiInfo.query.type;
  if (uiInfo.shanten[queryType] !== 1) {
    return;
  }

  // allowing input like (3n+2) after tenhou-pairi auto fill
  // TODO: add test
  if (uiInfo.hand.length % 3 !== 2) {
    return;
  }

  // inject css
  injectCss();

  // compute hand
  const hand = new Hand(uiInfo.hand, queryType);
  hand.mockShanten(1);

  // compute table
  const tableConfig = getTableConfigFromHand(hand);
  const table = getShantenTable(tableConfig);

  // inject table
  document.querySelector('#m2 > table')?.after(table);
};
