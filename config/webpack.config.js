'use strict';

import { merge } from 'webpack-merge';

import {common} from './webpack.common.js';
import PATHS from './paths.cjs';

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.js',
      options: PATHS.src + '/options.js',
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
      sidePanel: PATHS.src + '/side-panel.js',
      guide: PATHS.src + '/guide.js',
      report: PATHS.src + '/report.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });


export default config;
