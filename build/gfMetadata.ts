/// <reference types="node" />

import fs from 'fs';
import { resolve } from 'path';
import { PluginOption } from 'vite';

const metadata = `// ==UserScript==
// @name         天鳳牌理好形表示
// @name:zh      天凤牌理好形表示
// @name:zh-CN   天凤牌理好形表示
// @name:zh-TW   天鳳牌理好形表示
// @name:en      Tenhou-Pairi Kokei display
// @namespace    http://tanimodori.com/
// @version      0.0.7
// @description  天鳳牌理で一向聴の好形率を表示する
// @description:zh  在天凤牌理中显示好形率
// @description:zh-CN  在天凤牌理中显示好形率
// @description:zh-TW  在天鳳牌理中顯示好形率
// @description:en  Display Kokei percentage of ii-shan-ten in Tenhou-Pairi
// @author       Tanimodori
// @match        http://tenhou.net/2/*
// @match        https://tenhou.net/2/*
// @include      http://tenhou.net/2/*
// @include      https://tenhou.net/2/*
// @grant        none
// @license      MIT
// ==/UserScript==
`;

const plugin: PluginOption = {
  name: 'vite-plugin-greasyfork-metadata',
  writeBundle(options, bundle) {
    for (const fileName in bundle) {
      if (fileName !== 'index.js') {
        return;
      }
      const chunk = bundle[fileName];
      if (!('code' in chunk)) {
        return;
      }
      const outputFileName = options.dir ? resolve(options.dir, fileName) : fileName;
      fs.writeFileSync(outputFileName, metadata + chunk.code);
    }
  },
};

export default plugin;
