const S_P_QUERY = '一般形(七対国士を含まない)の計算結果 / 標準形';
const S_Q_QUERY = '標準形(七対国士を含む)の計算結果 / 一般形';
const S_YIISHANTEN = '1向聴';
const S_YIISHANTEN_ALL = '標準形1向聴';
const MJ_RE = /([0-9]+[mpsz])+/gm;

const mjtiles = (input) => {
  const result = [];
  let stk = '';
  for (const tile_i of input) {
    if ('0' <= tile_i && tile_i <= '9') {
      stk += tile_i;
    } else {
      for (const tile_j of stk) {
        result.push(tile_j + tile_i);
      }
      stk = '';
    }
  }
  return result;
};

const mjcomp = (a, b) => {
  let [a_n, a_t] = a;
  let [b_n, b_t] = b;
  if (a_n === '0') a_n = 5.5;
  if (b_n === '0') b_n = 5.5;
  return a_t !== b_t ? (a_t < b_t ? -1 : 1) : Number(a_n) - Number(b_n);
};

const MJ_13ORPHAN_TILES = mjtiles('19m19s19p1234567z');
const MJ_TILES = mjtiles('123456789m123456789s123456789p1234567z');

let global_show_all_result = false;

const mjaka = (tile) => {
  if (tile[0] === '0' || tile[0] === '5') {
    return String(5 - Number(tile[0])) + tile[1];
  }
  return tile;
};

const mjsub = (mjarr, ...tiles) => {
  if (mjarr.mjfail) return;
  for (const tile of tiles) {
    let index = mjarr.indexOf(tile);
    if (index != -1) {
      mjarr.splice(index, 1);
      continue;
    }
    index = mjarr.indexOf(mjaka(tile));
    if (index != -1) {
      mjarr.splice(index, 1);
      continue;
    }
    mjarr.mjfail = true;
    return mjarr;
  }
  return mjarr;
};

const mj7toi = (mjarr) => {
  if (mjarr.length != 14) {
    return false;
  }
  mjarr.sort(mjcomp);
  for (let i = 0; i <= 12; i += 2) {
    if (mjarr[i] !== mjarr[i + 1] && mjarr[i] !== mjaka(mjarr[i + 1])) {
      return false;
    }
    if (i > 0) {
      if (mjarr[i] === mjarr[i - 2] || mjarr[i] === mjaka(mjarr[i - 2])) {
        return false;
      }
    }
  }
  return true;
};

const mj13orphan = (mjarr) => {
  if (mjarr.length != 14) {
    return false;
  }
  mjsub(mjarr, MJ_13ORPHAN_TILES);
  if (!mjarr.mjfail && MJ_13ORPHAN_TILES.indexOf(mjarr[0]) !== -1) {
    return true;
  }
  return false;
};

const mjagaricache = {};

const mjagari = (mjarr) => {
  if (mjarr.mjfail || mjarr.length % 3 === 1) return false;
  if (mjarr.length == 0) {
    return true;
  }
  if (global_show_all_result) {
    if (mj7toi([...mjarr])) return true;
    if (mj13orphan([...mjarr])) return true;
  }
  const joined_result = mjarr.sort(mjcomp).join('').replace('0', '5');
  if (joined_result in mjagaricache) {
    return mjagaricache[joined_result];
  }
  const result = mjagari_raw(mjarr);
  mjagaricache[joined_result] = result;
  return result;
};

const mjagari_raw = (mjarr) => {
  const tile = mjarr[0];
  const [tile_num, tile_type] = tile;
  // toitsu
  if (mjarr.length % 3 === 2) {
    if (mjagari(mjsub([...mjarr], tile, tile), false)) return true;
  }
  // kootsu
  if (mjagari(mjsub([...mjarr], tile, tile, tile), false)) return true;
  // shuntsu
  if (tile_type !== 'z') {
    let tile_number = Number(tile_num);
    if (tile_number === 0) tile_number = 5;
    const shuntsu_tiles_groups = [tile_number - 2, tile_number - 1, tile_number]
      .filter((x) => x >= 1 && x <= 7)
      .map((x) => [x + tile_type, x + 1 + tile_type, x + 2 + tile_type]);
    for (const s_tiles of shuntsu_tiles_groups) {
      if (mjagari(mjsub([...mjarr], ...s_tiles), false)) return true;
    }
  }
  return false;
};

const mjnokori = (mjarr, tile) => {
  return 4 - mjarr.filter((x) => x === tile || x === mjaka(tile)).length;
};

const mjmachi = (mjarr) => {
  if (mjarr.length % 3 !== 1) return [];
  return MJ_TILES.filter((tile) => {
    if (mjnokori(mjarr, tile) === 0) return false; // ikasama
    return mjagari([...mjarr, tile]);
  });
};

const mjtenpaikei = (mjarr) => {
  if (mjarr.length % 3 === 1) return {};
  const result = {};
  result.nokori_max = 0;
  const unique = (value, index, self) => self.indexOf(value) === index;
  for (const tile of mjarr.filter(unique)) {
    const machi = mjmachi(mjsub([...mjarr], tile));
    if (machi.length > 0) {
      result[tile] = {};
      result[tile].nokori = 0;
      for (const machihai of machi) {
        const nokori = mjnokori([...mjarr, tile], machihai);
        result[tile][machihai] = nokori;
        result[tile].nokori += nokori;
      }
      result.nokori_max = Math.max(result.nokori_max, result[tile].nokori);
    }
  }
  return result;
};

const inject_css = () => {
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
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
};

const create_node_tile_img = (tile) => {
  const img_node = document.createElement('img');
  img_node.setAttribute('src', 'https://cdn.tenhou.net/2/a/' + tile + '.gif');
  img_node.setAttribute('border', '0');
  return img_node;
};

const create_node_tile = (tile, link) => {
  const a_node = document.createElement('a');
  if (link) a_node.setAttribute('href', link);
  a_node.setAttribute('class', 'D');
  a_node.appendChild(create_node_tile_img(tile));
  return a_node;
};

const create_node_td = (...children) => {
  const td = document.createElement('td');
  for (const child of children) {
    td.appendChild(child);
  }
  return td;
};

const mouse_over_node = (node, info) => {
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

const mouse_out_node = (node) => {
  const popup = node.getElementsByClassName('popup')[0];
  popup.classList.toggle('show');
};

const run = () => {
  // check
  const tehai = document.getElementById('tehai');
  const m2 = document.getElementById('m2');
  if (!tehai) return;
  if (!m2) return;

  if (m2.textContent.startsWith(S_P_QUERY)) {
    global_show_all_result = false;
  } else if (m2.textContent.startsWith(S_Q_QUERY)) {
    global_show_all_result = true;
  } else {
    return;
  }
  if (!tehai.textContent.startsWith(S_YIISHANTEN)) {
    if (!global_show_all_result || !tehai.textContent.startsWith(S_YIISHANTEN_ALL)) {
      return;
    }
  }

  // parse hands
  const info = m2.getElementsByTagName('textarea')[0].textContent;
  const matches = info.match(MJ_RE).map(mjtiles);

  // calculate tenpaikei
  const hands = matches[0].sort(mjcomp);
  const tenpaikeis = {};
  for (let i = 1; i < matches.length; i += 2) {
    const sutehai = matches[i][0];
    const tsumohais = matches[i + 1];
    const tenpaikeis_local = {};
    tenpaikeis_local.koukei = 0;
    tenpaikeis_local.gukei = 0;
    tenpaikeis_local.koukeihais = [];
    tenpaikeis_local.gukeihais = [];
    for (const tsumohai of tsumohais) {
      const hands_local = [...mjsub([...hands], sutehai), tsumohai];
      const tenpaikei_local = mjtenpaikei(hands_local);
      tenpaikei_local.link = '?' + (global_show_all_result ? 'q' : 'p') + '=' + hands_local.join('');
      tenpaikei_local.nokori_self = mjnokori(hands, tsumohai);
      if (tenpaikei_local.nokori_max > 4) {
        tenpaikeis_local.koukei += tenpaikei_local.nokori_self;
        tenpaikeis_local.koukeihais.push(tsumohai);
      } else {
        tenpaikeis_local.gukei += tenpaikei_local.nokori_self;
        tenpaikeis_local.gukeihais.push(tsumohai);
      }
      tenpaikeis_local[tsumohai] = tenpaikei_local;
    }
    tenpaikeis[sutehai] = tenpaikeis_local;
  }

  // display tenpaikei
  inject_css();
  const trs = m2.getElementsByTagName('tr');
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

run();
