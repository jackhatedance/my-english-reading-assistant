'use strict';

import { merge } from 'webpack-merge';

import {common} from './webpack.common.js';
import PATHS from './paths.cjs';

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.js',
      popup2: PATHS.src + '/popup2.js',
      options: PATHS.src + '/options.js',
      mera: PATHS.src + '/mera.js',
      background: PATHS.src + '/background.js',
      sidePanel: PATHS.src + '/side-panel-iframe.js',
      guide: PATHS.src + '/guide.js',
      faq: PATHS.src + '/faq.js',
      "release-notes": PATHS.src + '/release-notes.js',
      report: PATHS.src + '/report.js',
      dictionary: PATHS.src + '/dictionary.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });


export default config;
