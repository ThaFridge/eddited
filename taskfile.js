'use strict';

const version = require('./package.json').version;
const csscond = require('postcss-conditionals');
const cssvars = require('postcss-simple-vars');
const csscomb = require('postcss-csscomb');
const cssnext = require('postcss-cssnext')({ features: { fontVariant: false } });
const imports = require('postcss-import');
const cssnano = require('cssnano')({ zindex: false });

const cfg = {
  rename: { suffix: '.min' },
  clean: { plugins: [ csscomb ] },
  build: { from: './src/theme.css', to: './dist',
    plugins: [ imports, cssvars, csscond, cssnext, cssnano ] }
};

/* version prefix plugin */
const prefix = function * (file) {
  let prefix = `eddited v${version}`;
  let data = file[0].data.toString();
  file[0].data = new Buffer(`/* ${prefix} */\n${data}`);
};

exports.default = function * (task) {
  yield task.serial( ['clean', 'build'] )
  yield task.watch('config.css', 'build')
  yield task.watch('src/**/*.css', 'build')
};

exports.clean = function * (task) {
  yield task.source('src/**/*.css').postcss(cfg.clean).target('src');
};

exports.build = function * (task) {
  yield task.source('src/theme.css')
    .postcss(cfg.build)
    .rename(cfg.rename)
    .run({ every: false }, prefix)
    .target('dist')
};
