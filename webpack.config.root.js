const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './root-config.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'root-config.js',
    libraryTarget: 'system',
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript', // Added for TypeScript support
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/single-spa/lib/es5/system/single-spa.min.js'),
          to: path.resolve(__dirname, 'dist/vendor/single-spa.min.js'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/react/umd/react.production.min.js'),
          to: path.resolve(__dirname, 'dist/vendor/react.production.min.js'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/react-dom/umd/react-dom.production.min.js'),
          to: path.resolve(__dirname, 'dist/vendor/react-dom.production.min.js'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/systemjs/dist/system.min.js'),
          to: path.resolve(__dirname, 'dist/vendor/system.min.js'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/systemjs/dist/extras/amd.min.js'),
          to: path.resolve(__dirname, 'dist/vendor/amd.min.js'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/systemjs/dist/extras/named-exports.min.js'),
          to: path.resolve(__dirname, 'dist/vendor/named-exports.min.js'),
        },
      ],
    }),
  ],
  devServer: {
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  externals: ['single-spa'],
};

