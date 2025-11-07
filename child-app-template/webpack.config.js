const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-child-app.js',  // Change this to your app name
    libraryTarget: 'system',  // Required for SystemJS
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,  // Supports both JavaScript and TypeScript
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',  // Add for TypeScript support
            ],
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
      template: './index.html',
      filename: 'my-child-app.html',  // Change this to match your app name
      inject: false,
    }),
  ],
  devServer: {
    port: 9003,  // Change to a unique port for your app
    headers: {
      'Access-Control-Allow-Origin': '*',  // Required for CORS
    },
  },
  externals: ['react', 'react-dom', 'single-spa'],  // These are provided by main app
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],  // Added TypeScript extensions
  },
};

