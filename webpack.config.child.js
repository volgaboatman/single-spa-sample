const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './child/src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'child.js',
    libraryTarget: 'system',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './child/index.html',
      filename: 'child.html',
      inject: false,
    }),
  ],
  devServer: {
    port: 9002,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  externals: ['react', 'react-dom', 'single-spa'],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};

