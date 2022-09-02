import { Iishanten, mjcomp, mjtiles, MJ_TILES, Tenpaikei } from '@/legacy';
import style from '@/style/index.less?inline';

/** Inject Css style to the page */
export const inject_css = () => {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);
};

/**
 * Creating tile image element of given tile
 * @param tile the tile
 * @returns the image element
 */
export const create_node_tile_img = (tile: string) => {
  const img_node = document.createElement('img');
  img_node.setAttribute('src', 'https://cdn.tenhou.net/2/a/' + tile + '.gif');
  img_node.setAttribute('border', '0');
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

export const renderTable = (tenpaikeis: Record<string, Iishanten>) => {
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
