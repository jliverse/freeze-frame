import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve } from 'path';

const path = resolve(__dirname, '.browser');

export default {
  devtool: 'source-map',
  devServer: {
    port: process.env.PORT || 3080,
    host: process.env.HOST || '0.0.0.0'
  },
  entry: ['./browser/browser.js'],
  output: { path, filename: 'index.js' },
  plugins: [
    new HtmlWebpackPlugin({
      favicon: './src/favicon.png',
      filename: `${path}/index.html`,
      inject: 'head'
    })
  ],
  module: {
    rules: [
      { test: /\.(svg)$/, use: 'raw-loader' },
      { test: /\.(png|gif|jpg|mp3)$/, use: 'url-loader' },
      { test: /\.(js)$/, exclude: /node_modules/, use: 'babel-loader' },
      {
        test: /\.(less)$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },
  node: { fs: 'empty' },
  resolve: {
    alias: {
      css: resolve(__dirname, 'src/css'),
      lib: resolve(__dirname, 'src/lib')
    },
    extensions: ['.js', '.json', '.less']
  }
};
