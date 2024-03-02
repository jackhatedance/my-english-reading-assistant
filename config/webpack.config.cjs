'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.cjs');
const PATHS = require('./paths.cjs');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.js',
      options: PATHS.src + '/options.js',
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
      sidePanel: PATHS.src + '/sidePanel.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
