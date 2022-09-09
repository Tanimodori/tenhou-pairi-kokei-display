import { Hand, HandWithParent } from '@/hand';
import { Iishanten, mjcomp, mjtiles, MJ_TILES, Tenpaikei } from '@/legacy';
import MJ from '@/MJ';
import style from '@/style/index.less?inline';

/** Inject Css style to the page */
export const inject_css = () => {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.innerHTML = style;
  document.head.appendChild(styleSheet);
};

/**
 * Creating tile image element of given tile
 * @param tile the tile
 * @param setClass whether or not set class of img
 * @returns the image element
 */
export const create_node_tile_img = (tile: string, setClass = false) => {
  const img_node = document.createElement('img');
  img_node.setAttribute('src', 'https://cdn.tenhou.net/2/a/' + tile + '.gif');
  img_node.setAttribute('border', '0');
  setClass && img_node.setAttribute('class', 'D');
  return img_node;
};

/**
 * Create a hyperlink element with image element children of giben tile
 * @param tile the tile
 * @param link the `href` attribute of `<a>` element
 * @returns the hyperlink element
 */
export const create_node_tile = (tile: string, link: string) => {
  const a_node = document.createElement('a');
  if (link) a_node.setAttribute('href', link);
  a_node.setAttribute('class', 'D');
  a_node.appendChild(create_node_tile_img(tile));
  return a_node;
};

/**
 * Create a table data element with given children nodes
 * @param children children of table data element
 * @returns the created table data element
 */
export const create_node_td = (...children: Node[]) => {
  const td = document.createElement('td');
  for (const child of children) {
    td.appendChild(child);
  }
  return td;
};

/**
 * Append popup to the node on mouse over
 * @param node the target of event
 * @param info the tenpaikei of the node
 */
export const mouse_over_node = (node: HTMLElement, info: Tenpaikei & { link: string }) => {
  const popups = node.getElementsByClassName('popup');
  let popup;
  if (popups.length === 0) {
    popup = document.createElement('div');
    const tiles = mjtiles(info.link.substring(3));
    for (const tile of tiles) {
      popup.appendChild(create_node_tile_img(tile));
    }
    popup.appendChild(document.createElement('br'));
    const table = document.createElement('table');
    table.setAttribute('cellpadding', 2);
    table.setAttribute('cellspacing', 0);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    const keys_valid = Object.keys(info)
      .filter((x) => MJ_TILES.indexOf(x.replace('0', '5')) !== -1)
      .sort((x, y) => {
        const nokori_diff = info[y].nokori - info[x].nokori;
        return nokori_diff === 0 ? mjcomp(x, y) : nokori_diff;
      });
    for (const key of keys_valid) {
      const tr = document.createElement('tr');
      const info_local = info[key];
      tr.appendChild(create_node_td(document.createTextNode('打')));
      tr.appendChild(create_node_td(create_node_tile_img(key)));
      tr.appendChild(create_node_td(document.createTextNode('待ち[')));
      const machis = [];
      for (const key_local of Object.keys(info_local)) {
        if (MJ_TILES.indexOf(key_local) === -1) continue;
        machis.push(create_node_tile_img(key_local));
      }
      tr.appendChild(create_node_td(...machis));
      tr.appendChild(create_node_td(document.createTextNode(info_local.nokori + '枚')));
      tr.appendChild(create_node_td(document.createTextNode(' ]')));
      tbody.appendChild(tr);
    }
    popup.appendChild(table);
    popup.classList.add('popup');
    node.appendChild(popup);
  } else {
    popup = popups[0];
  }
  popup.classList.toggle('show');
};

/**
 * Hide popup on mouse out event
 * @param node the event target
 */
export const mouse_out_node = (node: HTMLElement) => {
  const popup = node.getElementsByClassName('popup')[0];
  popup.classList.toggle('show');
};

export const renderTableLegacy = (tenpaikeis: Record<string, Iishanten>) => {
  const trs = document.querySelectorAll('#m2 tr');
  const sutehais = Object.keys(tenpaikeis);
  for (let i = 0; i < sutehais.length; ++i) {
    const tr = trs[i];
    const tds = tr.children;
    const tenpaikeis_local = tenpaikeis[sutehais[i]];
    tr.removeChild(tds[3]);
    tr.removeChild(tds[3]);
    const td_anchor = tds[3];
    const nokori_all = tenpaikeis_local.koukei + tenpaikeis_local.gukei;
    // modify
    // koukei
    if (tenpaikeis_local.koukei > 0) {
      const td_node = create_node_td();
      for (const koukeihai of tenpaikeis_local.koukeihais) {
        td_node.appendChild(create_node_tile(koukeihai, tenpaikeis_local[koukeihai].link));
      }
      tr.insertBefore(td_node, td_anchor);
      for (let i = 0; i < tenpaikeis_local.koukeihais.length; ++i) {
        const a_node = td_node.children[i];
        const koukeihai = tenpaikeis_local.koukeihais[i];
        a_node.addEventListener('mouseover', (e) => mouse_over_node(a_node, tenpaikeis_local[koukeihai]));
        a_node.addEventListener('mouseout', (e) => mouse_out_node(a_node));
      }
      tr.insertBefore(create_node_td(document.createTextNode('好形' + tenpaikeis_local.koukei + '枚')), td_anchor);
    } else {
      tr.insertBefore(create_node_td(), td_anchor);
      tr.insertBefore(create_node_td(), td_anchor);
    }
    // koukei - gukei
    if (tenpaikeis_local.koukei > 0 && tenpaikeis_local.gukei > 0) {
      tr.insertBefore(create_node_td(document.createTextNode('+')), td_anchor);
    } else {
      tr.insertBefore(create_node_td(), td_anchor);
    }
    // gukei
    if (tenpaikeis_local.gukei > 0) {
      const td_node = create_node_td();
      for (const gukeihai of tenpaikeis_local.gukeihais) {
        td_node.appendChild(create_node_tile(gukeihai, tenpaikeis_local[gukeihai].link));
      }
      tr.insertBefore(td_node, td_anchor);
      for (let i = 0; i < tenpaikeis_local.gukeihais.length; ++i) {
        const a_node = td_node.children[i];
        const gukeihai = tenpaikeis_local.gukeihais[i];
        a_node.addEventListener('mouseover', (e) => mouse_over_node(a_node, tenpaikeis_local[gukeihai]));
        a_node.addEventListener('mouseout', (e) => mouse_out_node(a_node));
      }
      tr.insertBefore(create_node_td(document.createTextNode('愚形' + tenpaikeis_local.gukei + '枚')), td_anchor);
    } else {
      tr.insertBefore(create_node_td(), td_anchor);
      tr.insertBefore(create_node_td(), td_anchor);
    }
    // all
    tr.insertBefore(create_node_td(document.createTextNode('=' + nokori_all + '枚')), td_anchor);
    tr.insertBefore(
      create_node_td(
        document.createTextNode('（好形率' + String(Math.round((100 * tenpaikeis_local.koukei) / nokori_all)) + '%）'),
      ),
      td_anchor,
    );
  }
};

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
    create_node_tile_img(hand.parent.tile, true),
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
