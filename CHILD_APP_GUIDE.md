# Guide: Creating an Independent Child Application

This guide explains how to create a fully independent child application that can be dynamically mounted to the main single-spa microfrontend application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Building the Application](#building-the-application)
6. [Adding to Main App](#adding-to-main-app)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

A child application in this single-spa setup is a standalone React application that:
- Can be developed and built independently
- Exports single-spa lifecycle functions (bootstrap, mount, unmount)
- Can be loaded dynamically from any URL
- Shares React and ReactDOM with the main app via SystemJS

## Prerequisites

- Node.js and npm installed
- Basic knowledge of React
- Understanding of single-spa concepts
- (Optional) TypeScript knowledge if using TypeScript

## Project Structure

A typical child application has this structure:

```
my-child-app/
├── package.json
├── webpack.config.js
├── src/
│   ├── main.js          # Single-spa lifecycle exports
│   ├── App.jsx          # Your React component
│   └── App.css          # Styles
└── index.html           # HTML template
```

## Step-by-Step Setup

### 1. Initialize the Project

Create a new directory and initialize npm:

```bash
mkdir my-child-app
cd my-child-app
npm init -y
```

### 2. Install Dependencies

Install required dependencies:

```bash
npm install react react-dom single-spa-react
```

Install dev dependencies:

```bash
npm install --save-dev \
  webpack \
  webpack-cli \
  webpack-dev-server \
  @babel/core \
  @babel/preset-env \
  @babel/preset-react \
  @babel/preset-typescript \
  babel-loader \
  css-loader \
  style-loader \
  html-webpack-plugin \
  typescript \
  @types/react \
  @types/react-dom
```

**Note**: TypeScript dependencies are optional. Omit them if using JavaScript only.

### 3. Create package.json Scripts

Update your `package.json` scripts section:

```json
{
  "scripts": {
    "start": "webpack serve --config webpack.config.js --port 9003",
    "build": "webpack --config webpack.config.js --mode production"
  }
}
```

### 4. Create webpack.config.js

Create a webpack configuration file:

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-child-app.js',
    libraryTarget: 'system',  // Important: Use system format
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
      filename: 'my-child-app.html',
      inject: false,
    }),
  ],
  devServer: {
    port: 9003,  // Use a unique port
    headers: {
      'Access-Control-Allow-Origin': '*',  // Important for CORS
    },
  },
  // Mark these as externals - they'll be loaded from the main app
  externals: ['react', 'react-dom', 'single-spa'],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
```

**Key Points:**
- `libraryTarget: 'system'` - Required for SystemJS compatibility
- `externals` - React, ReactDOM, and single-spa are provided by the main app
- CORS headers - Required for cross-origin loading
- Unique port - Each child app needs its own port

### 5. Create src/main.js

This is the entry point that exports single-spa lifecycle functions:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

const APP_NAME = 'my-child-app';

// Log when module loads (optional, for debugging)
console.log(`📥 [${APP_NAME}] Module loaded at ${new Date().toISOString()}`);

// Create single-spa-react lifecycle functions
const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    console.error(`[${APP_NAME}] Error Boundary triggered:`, err);
    return <div>Error: {err.message}</div>;
  },
});

// Wrap lifecycle functions with logging (optional, for debugging)
const originalBootstrap = lifecycles.bootstrap;
const originalMount = lifecycles.mount;
const originalUnmount = lifecycles.unmount;

export const bootstrap = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`🚀 [${APP_NAME}] Bootstrap - ${timestamp}`);
  console.log('Bootstrap Props:', props);
  
  try {
    const startTime = performance.now();
    const result = await originalBootstrap(props);
    const duration = performance.now() - startTime;
    
    console.log(`✅ Bootstrap completed in ${duration.toFixed(2)}ms`);
    console.groupEnd();
    return result;
  } catch (error) {
    console.error(`❌ Bootstrap failed:`, error);
    console.groupEnd();
    throw error;
  }
};

export const mount = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`📦 [${APP_NAME}] Mount - ${timestamp}`);
  console.log('Mount Props:', props);
  console.log('DOM Element:', props?.domElement);
  
  try {
    const startTime = performance.now();
    const result = await originalMount(props);
    const duration = performance.now() - startTime;
    
    console.log(`✅ Mount completed in ${duration.toFixed(2)}ms`);
    console.log('DOM Element after mount:', props?.domElement?.innerHTML?.substring(0, 100));
    console.groupEnd();
    return result;
  } catch (error) {
    console.error(`❌ Mount failed:`, error);
    console.groupEnd();
    throw error;
  }
};

export const unmount = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`🗑️ [${APP_NAME}] Unmount - ${timestamp}`);
  console.log('Unmount Props:', props);
  
  try {
    const startTime = performance.now();
    const result = await originalUnmount(props);
    const duration = performance.now() - startTime;
    
    console.log(`✅ Unmount completed in ${duration.toFixed(2)}ms`);
    console.groupEnd();
    return result;
  } catch (error) {
    console.error(`❌ Unmount failed:`, error);
    console.groupEnd();
    throw error;
  }
};
```

**Key Points:**
- Must export `bootstrap`, `mount`, and `unmount` functions
- Uses `single-spa-react` to create lifecycle functions
- Logging is optional but helpful for debugging
- Error boundary handles React errors gracefully

### 6. Create src/App.jsx

Your main React component:

```javascript
import React from 'react';
import './App.css';

function App() {
  // Your application logic here
  return (
    <div className="my-child-app">
      <h2>My Child Application</h2>
      <p>This is an independent child application!</p>
      {/* Add your components here */}
    </div>
  );
}

export default App;
```

### 7. Create src/App.css

Your styles:

```css
.my-child-app {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}

.my-child-app h2 {
  color: #333;
  margin-bottom: 10px;
}
```

### 8. Create index.html

HTML template (minimal, webpack will inject the script):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Child App</title>
</head>
<body>
  <div id="my-child-app"></div>
</body>
</html>
```

## Building the Application

### Development Mode

Start the development server:

```bash
npm start
```

This will:
- Start webpack dev server on port 9003 (or your configured port)
- Enable hot reloading
- Serve the app at `http://localhost:9003/my-child-app.js`

### Production Build

Build for production:

```bash
npm run build
```

This creates optimized files in the `dist/` directory:
- `my-child-app.js` - Your application bundle
- `my-child-app.html` - HTML file (for testing standalone)

## Adding to Main App

### 1. Start Your Child App

Make sure your child app is running:

```bash
cd my-child-app
npm start
```

The app should be accessible at: `http://localhost:9003/my-child-app.js`

### 2. Add to Main App

1. Open the main application in your browser
2. In the form, enter:
   - **Application Name**: `My Child App` (or any name)
   - **Application URL**: `http://localhost:9003/my-child-app.js`
3. Click **Add Application**

The main app will:
- Load your child app dynamically
- Bootstrap it
- Mount it in a container
- Display it alongside other child apps

### 3. Verify It Works

Check the browser console for logs:
- `📥 [my-child-app] Module loaded`
- `🚀 [my-child-app] Bootstrap`
- `📦 [my-child-app] Mount`

Your child app should now be visible in the main application!

## Best Practices

### 1. Naming Conventions

- Use descriptive, unique application names
- Use kebab-case for file names and URLs
- Keep app names consistent across your codebase

### 2. Port Management

- Each child app needs a unique port
- Document which ports are in use
- Consider using environment variables for port configuration

### 3. Error Handling

- Always implement error boundaries
- Log errors for debugging
- Provide user-friendly error messages

### 4. Styling

- Use CSS modules or scoped styles to avoid conflicts
- Consider using a CSS-in-JS solution
- Test styles don't leak to other apps

### 5. Dependencies

- Keep dependencies minimal
- Only mark truly shared dependencies as externals
- Bundle app-specific dependencies

### 6. Development Workflow

```bash
# Terminal 1: Main app
cd main-app
npm start

# Terminal 2: Child app 1
cd child-app-1
npm start

# Terminal 3: Child app 2
cd child-app-2
npm start
```

### 7. Testing Standalone

You can test your child app independently by:
1. Building it: `npm run build`
2. Opening `dist/my-child-app.html` in a browser
3. Or using the dev server HTML file

## Troubleshooting

### Issue: "Failed to load application"

**Solutions:**
- Verify the child app server is running
- Check the URL is correct (including `.js` extension)
- Verify CORS headers are set in webpack config
- Check browser console for specific errors

### Issue: "React is not available"

**Solutions:**
- Ensure React and ReactDOM are in the main app's import map
- Verify `externals` in webpack config includes 'react' and 'react-dom'
- Check that the main app has loaded React before child apps

### Issue: "Module does not export bootstrap/mount/unmount"

**Solutions:**
- Verify `src/main.js` exports all three functions
- Check webpack `libraryTarget` is set to 'system'
- Ensure the entry point is correct in webpack config

### Issue: "removeChild error"

**Solutions:**
- This is usually resolved by the main app's container structure
- Ensure you're not manually manipulating DOM that React manages
- Check that unmount is called properly

### Issue: Styles not loading

**Solutions:**
- Verify CSS loader is configured in webpack
- Check that styles are imported in your component
- Ensure style-loader is in the webpack config

### Debugging Tips

1. **Check Console Logs**: All lifecycle functions log to console
2. **Network Tab**: Verify the JS file is loading (200 status)
3. **SystemJS**: Check `System.import()` is working
4. **React DevTools**: Use React DevTools to inspect the component tree

## Example: Complete Minimal Child App

Here's a minimal working example:

**package.json:**
```json
{
  "name": "minimal-child-app",
  "version": "1.0.0",
  "scripts": {
    "start": "webpack serve --config webpack.config.js --port 9003",
    "build": "webpack --config webpack.config.js --mode production"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "single-spa-react": "^6.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.22.0",
    "babel-loader": "^9.1.3",
    "css-loader": "^6.8.1",
    "html-webpack-plugin": "^5.5.3",
    "style-loader": "^3.3.3",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1"
  }
}
```

**webpack.config.js:**
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'minimal-child-app.js',
    libraryTarget: 'system',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
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
      filename: 'minimal-child-app.html',
      inject: false,
    }),
  ],
  devServer: {
    port: 9003,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  externals: ['react', 'react-dom', 'single-spa'],
};
```

**src/main.js:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
});

export const { bootstrap, mount, unmount } = lifecycles;
```

**src/App.jsx:**
```javascript
import React from 'react';

function App() {
  return <div><h1>Minimal Child App</h1></div>;
}

export default App;
```

## Next Steps

- Add routing (if needed)
- Add state management
- Add API integration
- Add tests
- Deploy to a CDN or server
- Add more complex features

## Additional Resources

- [Single-SPA Documentation](https://single-spa.js.org/)
- [Single-SPA React Documentation](https://single-spa.js.org/docs/ecosystem-react/)
- [SystemJS Documentation](https://github.com/systemjs/systemjs)

---

**Note**: This guide assumes you're using the same main application setup. If your main app has different configurations, adjust accordingly.

