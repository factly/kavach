const AntDesignThemePlugin = require('antd-theme-webpack-plugin');
// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const options = {
  antDir: path.join(__dirname, './node_modules/antd'),
  stylesDir: path.join(__dirname, './src/styles'),
  varFile: path.join(__dirname, './src/styles/variables.less'),
  themeVariables: ['@primary-color', '@link-color'],
  publicPath: process.env.NODE_ENV === 'production' ? 'kavach.factly.org' : '/.factly/kavach/web/',
  indexFileName: 'index.html',
};
module.exports = function override(config, env) {
  config.plugins.push(new AntDesignThemePlugin(options));
  return config;
};
