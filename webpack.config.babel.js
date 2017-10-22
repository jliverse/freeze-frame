import autoprefixer from 'autoprefixer';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MinifyPlugin from 'babel-minify-webpack-plugin';
import { resolve } from 'path';

const includeDebug = process.env.NODE_ENV === 'development';

const lessLoaders = [
  'style-loader',
  { loader: 'css-loader', options: { sourceMap: includeDebug } },
  { loader: 'postcss-loader', options: { sourceMap: includeDebug } },
  'resolve-url-loader',
  { loader: 'less-loader', options: { sourceMap: includeDebug } }
].filter(Boolean);

const lessExtractLoader = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: ['postcss-loader', 'resolve-url-loader', 'less-loader'].filter(Boolean)
});

module.exports = {
  devtool: includeDebug ? 'source-map' : undefined,
  devServer: {
    port: process.env.PORT || 3080,
    host: process.env.HOST || '0.0.0.0'
  },
  entry: { index: ['./src/index', 'core-js/fn/promise.js'] },
  output: { path: resolve(__dirname, 'public'), filename: '[name].js' },
  plugins: [
    new ExtractTextPlugin({ filename: '[name].css', disable: includeDebug }),
    new HtmlWebpackPlugin({
      favicon: './src/favicon.png',
      template: './src/index.html',
      minify: { collapseWhitespace: !includeDebug }
    }),
    !includeDebug && new MinifyPlugin({}, { comments: false })
  ].filter(Boolean),
  module: {
    rules: [
      { test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/, use: 'raw-loader' },
      { test: /\.(js)$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.(png|gif|jpg|mp3)$/, use: 'url-loader' },
      {
        test: /\.(less|css)$/,
        exclude: /node_modules/,
        use: includeDebug ? lessLoaders : lessExtractLoader
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.less'],
    alias: {
      preact: resolve(__dirname, 'src/lib/preact/esm.js'),
      components: resolve(__dirname, 'src/components'),
      css: resolve(__dirname, 'src/css'),
      lib: resolve(__dirname, 'src/lib')
      // NOTE: These convenience aliases are repeated in Jest's package.json moduleNameMapper.
    }
  }
};
