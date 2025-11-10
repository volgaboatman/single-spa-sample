# Guide: Creating a Child Application in Pure JavaScript

This guide explains how to create a fully independent child application using **pure JavaScript** (no frameworks like React, Vue, or Angular) that can be dynamically mounted to the main single-spa microfrontend application.

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

A pure JavaScript child application in this single-spa setup is a standalone application that:
- Can be developed and built independently
- Uses vanilla JavaScript (no frameworks)
- Exports single-spa lifecycle functions (bootstrap, mount, unmount) manually
- Can be loaded dynamically from any URL
- Uses direct DOM manipulation instead of a framework

## Prerequisites

- Node.js and npm installed
- Basic knowledge of JavaScript and DOM manipulation
- Understanding of single-spa concepts
- No framework knowledge required!

## Project Structure

A typical pure JavaScript child application has this structure:

```
my-pure-js-app/
├── package.json
├── webpack.config.js
├── src/
│   ├── main.js          # Single-spa lifecycle exports
│   ├── app.js           # Your application logic
│   └── app.css          # Styles
└── index.html           # HTML template
```

## Step-by-Step Setup

### 1. Initialize the Project

Create a new directory and initialize npm:

```bash
mkdir my-pure-js-app
cd my-pure-js-app
npm init -y
```

### 2. Install Dependencies

Install only the minimal required dependencies:

```bash
npm install single-spa
```

Install dev dependencies:

```bash
npm install --save-dev \
  webpack \
  webpack-cli \
  webpack-dev-server \
  css-loader \
  style-loader \
  html-webpack-plugin
```

**Note**: No React, no Babel, no TypeScript - just pure JavaScript!

### 3. Create package.json Scripts

Update your `package.json` scripts section:

```json
{
  "scripts": {
    "start": "webpack serve --config webpack.config.js --port 9004",
    "build": "webpack --config webpack.config.js --mode production"
  }
}
```

### 4. Create webpack.config.js

Create a simple webpack configuration file:

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-pure-js-app.js',
    libraryTarget: 'system',  // Important: Use system format for SystemJS
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'my-pure-js-app.html',
      inject: false,
    }),
  ],
  devServer: {
    port: 9004,  // Use a unique port
    headers: {
      'Access-Control-Allow-Origin': '*',  // Important for CORS
    },
  },
  // Mark single-spa as external - it'll be loaded from the main app
  externals: ['single-spa'],
  resolve: {
    extensions: ['.js'],
  },
};
```

**Key Points:**
- `libraryTarget: 'system'` - Required for SystemJS compatibility
- `externals: ['single-spa']` - single-spa is provided by the main app
- CORS headers - Required for cross-origin loading
- Unique port - Each child app needs its own port
- No Babel needed - Modern browsers support ES6+ natively, or use webpack's built-in support

### 5. Create src/main.js

This is the entry point that exports single-spa lifecycle functions. Since we're not using React, we implement these manually:

```javascript
import './app.css';
import { createApp, destroyApp } from './app';

const APP_NAME = 'my-pure-js-app';

// Log when module loads (optional, for debugging)
console.log(`📥 [${APP_NAME}] Module loaded at ${new Date().toISOString()}`);

// Bootstrap function - called once when the app is first loaded
export async function bootstrap(props) {
  const timestamp = new Date().toISOString();
  console.group(`🚀 [${APP_NAME}] Bootstrap - ${timestamp}`);
  console.log('Bootstrap Props:', props);
  
  try {
    const startTime = performance.now();
    
    // Perform any one-time initialization here
    // For example: initialize global state, load configuration, etc.
    console.log(`✅ Bootstrap completed in ${(performance.now() - startTime).toFixed(2)}ms`);
    console.groupEnd();
  } catch (error) {
    console.error(`❌ Bootstrap failed:`, error);
    console.groupEnd();
    throw error;
  }
}

// Mount function - called when the app should be displayed
export async function mount(props) {
  const timestamp = new Date().toISOString();
  console.group(`📦 [${APP_NAME}] Mount - ${timestamp}`);
  console.log('Mount Props:', props);
  console.log('DOM Element:', props?.domElement);
  
  try {
    const startTime = performance.now();
    
    // Validate that we have a DOM element to mount to
    if (!props || !props.domElement) {
      throw new Error('No DOM element provided for mounting');
    }
    
    // Create and mount the application
    createApp(props.domElement, props);
    
    const duration = performance.now() - startTime;
    console.log(`✅ Mount completed in ${duration.toFixed(2)}ms`);
    console.log('DOM Element after mount:', props.domElement.innerHTML?.substring(0, 100));
    console.groupEnd();
  } catch (error) {
    console.error(`❌ Mount failed:`, error);
    console.groupEnd();
    throw error;
  }
}

// Unmount function - called when the app should be removed
export async function unmount(props) {
  const timestamp = new Date().toISOString();
  console.group(`🗑️ [${APP_NAME}] Unmount - ${timestamp}`);
  console.log('Unmount Props:', props);
  
  try {
    const startTime = performance.now();
    
    // Validate that we have a DOM element
    if (!props || !props.domElement) {
      console.warn('No DOM element provided for unmounting');
      return;
    }
    
    // Clean up the application
    destroyApp(props.domElement);
    
    const duration = performance.now() - startTime;
    console.log(`✅ Unmount completed in ${duration.toFixed(2)}ms`);
    console.groupEnd();
  } catch (error) {
    console.error(`❌ Unmount failed:`, error);
    console.groupEnd();
    throw error;
  }
}
```

**Key Points:**
- Must export `bootstrap`, `mount`, and `unmount` functions
- `bootstrap` - One-time initialization (optional, can be empty)
- `mount` - Creates and renders your app into `props.domElement`
- `unmount` - Cleans up and removes your app from the DOM
- All functions receive `props` which includes `domElement` (the container)

### 6. Create src/app.js

Your main application logic using pure JavaScript:

```javascript
// Application state
let appState = {
  mounted: false,
  container: null,
  eventListeners: [],
};

/**
 * Creates and mounts the application to the provided DOM element
 * @param {HTMLElement} container - The DOM element to mount the app to
 * @param {Object} props - Props passed from single-spa
 */
export function createApp(container, props) {
  if (appState.mounted) {
    console.warn('App is already mounted');
    return;
  }
  
  appState.container = container;
  appState.mounted = true;
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Create the main app structure
  const appRoot = document.createElement('div');
  appRoot.className = 'pure-js-app';
  appRoot.id = 'pure-js-app-root';
  
  // Create header
  const header = document.createElement('h2');
  header.textContent = 'My Pure JavaScript Application';
  header.className = 'app-header';
  
  // Create content area
  const content = document.createElement('div');
  content.className = 'app-content';
  
  // Create a simple counter example
  let count = 0;
  const counterDisplay = document.createElement('p');
  counterDisplay.className = 'counter-display';
  counterDisplay.textContent = `Count: ${count}`;
  
  const incrementBtn = document.createElement('button');
  incrementBtn.textContent = 'Increment';
  incrementBtn.className = 'btn btn-primary';
  
  const decrementBtn = document.createElement('button');
  decrementBtn.textContent = 'Decrement';
  decrementBtn.className = 'btn btn-secondary';
  
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.className = 'btn btn-danger';
  
  // Event handlers
  const handleIncrement = () => {
    count++;
    counterDisplay.textContent = `Count: ${count}`;
    console.log(`Count incremented to ${count}`);
  };
  
  const handleDecrement = () => {
    count--;
    counterDisplay.textContent = `Count: ${count}`;
    console.log(`Count decremented to ${count}`);
  };
  
  const handleReset = () => {
    count = 0;
    counterDisplay.textContent = `Count: ${count}`;
    console.log('Count reset to 0');
  };
  
  // Attach event listeners
  incrementBtn.addEventListener('click', handleIncrement);
  decrementBtn.addEventListener('click', handleDecrement);
  resetBtn.addEventListener('click', handleReset);
  
  // Store event listeners for cleanup
  appState.eventListeners.push(
    { element: incrementBtn, event: 'click', handler: handleIncrement },
    { element: decrementBtn, event: 'click', handler: handleDecrement },
    { element: resetBtn, event: 'click', handler: handleReset }
  );
  
  // Create info section
  const info = document.createElement('div');
  info.className = 'app-info';
  info.innerHTML = `
    <p><strong>Application Name:</strong> ${props?.name || 'N/A'}</p>
    <p><strong>Mounted At:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Container ID:</strong> ${container.id || 'N/A'}</p>
  `;
  
  // Assemble the DOM
  content.appendChild(counterDisplay);
  content.appendChild(incrementBtn);
  content.appendChild(decrementBtn);
  content.appendChild(resetBtn);
  
  appRoot.appendChild(header);
  appRoot.appendChild(content);
  appRoot.appendChild(info);
  
  // Mount to container
  container.appendChild(appRoot);
  
  console.log('✅ Pure JS app created and mounted');
}

/**
 * Destroys the application and cleans up resources
 * @param {HTMLElement} container - The DOM element containing the app
 */
export function destroyApp(container) {
  if (!appState.mounted) {
    console.warn('App is not mounted');
    return;
  }
  
  // Remove all event listeners
  appState.eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  appState.eventListeners = [];
  
  // Clear the container
  container.innerHTML = '';
  
  // Reset state
  appState.mounted = false;
  appState.container = null;
  
  console.log('✅ Pure JS app destroyed and cleaned up');
}
```

**Key Points:**
- Use `document.createElement()` to create DOM elements
- Attach event listeners and store them for cleanup
- Clear `innerHTML` or remove elements on unmount
- Keep application state in a module-level variable or object

### 7. Create src/app.css

Your styles:

```css
.pure-js-app {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.app-header {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.app-content {
  margin-bottom: 20px;
}

.counter-display {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin: 20px 0;
  padding: 10px;
  background: white;
  border-radius: 4px;
  text-align: center;
}

.btn {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.app-info {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #28a745;
}

.app-info p {
  margin: 5px 0;
  color: #555;
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
  <title>My Pure JS App</title>
</head>
<body>
  <div id="pure-js-app"></div>
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
- Start webpack dev server on port 9004 (or your configured port)
- Enable hot reloading
- Serve the app at `http://localhost:9004/my-pure-js-app.js`

### Production Build

Build for production:

```bash
npm run build
```

This creates optimized files in the `dist/` directory:
- `my-pure-js-app.js` - Your application bundle
- `my-pure-js-app.html` - HTML file (for testing standalone)

## Adding to Main App

### 1. Start Your Child App

Make sure your child app is running:

```bash
cd my-pure-js-app
npm start
```

The app should be accessible at: `http://localhost:9004/my-pure-js-app.js`

### 2. Add to Main App

1. Open the main application in your browser
2. In the form, enter:
   - **Application Name**: `My Pure JS App` (or any name)
   - **Application URL**: `http://localhost:9004/my-pure-js-app.js`
3. Click **Add Application**

The main app will:
- Load your child app dynamically
- Bootstrap it
- Mount it in a container
- Display it alongside other child apps

### 3. Verify It Works

Check the browser console for logs:
- `📥 [my-pure-js-app] Module loaded`
- `🚀 [my-pure-js-app] Bootstrap`
- `📦 [my-pure-js-app] Mount`

Your pure JavaScript child app should now be visible in the main application!

## Best Practices

### 1. Event Listener Cleanup

Always remove event listeners in `unmount` to prevent memory leaks:

```javascript
// Store listeners
appState.eventListeners.push(
  { element: button, event: 'click', handler: handleClick }
);

// Remove in unmount
appState.eventListeners.forEach(({ element, event, handler }) => {
  element.removeEventListener(event, handler);
});
```

### 2. DOM Element Management

- Always check if `props.domElement` exists before using it
- Clear the container before mounting new content
- Remove all child elements in `unmount`

### 3. State Management

For simple apps, use module-level variables. For complex apps, consider:
- A simple state object
- Event-driven architecture
- Custom state management (if needed)

### 4. Error Handling

Always wrap your mount/unmount logic in try-catch blocks:

```javascript
export async function mount(props) {
  try {
    // Your mount logic
  } catch (error) {
    console.error('Mount error:', error);
    // Optionally render an error message to the DOM
    if (props?.domElement) {
      props.domElement.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
    throw error;
  }
}
```

### 5. Styling

- Use CSS classes with unique prefixes to avoid conflicts
- Consider CSS modules or scoped styles
- Test that styles don't leak to other apps

### 6. Performance

- Debounce/throttle event handlers for frequent events
- Use `requestAnimationFrame` for animations
- Lazy load heavy resources

### 7. Development Workflow

```bash
# Terminal 1: Main app
cd main-app
npm start

# Terminal 2: Pure JS child app
cd my-pure-js-app
npm start
```

## Troubleshooting

### Issue: "Failed to load application"

**Solutions:**
- Verify the child app server is running
- Check the URL is correct (including `.js` extension)
- Verify CORS headers are set in webpack config
- Check browser console for specific errors

### Issue: "Module does not export bootstrap/mount/unmount"

**Solutions:**
- Verify `src/main.js` exports all three functions
- Check webpack `libraryTarget` is set to 'system'
- Ensure the entry point is correct in webpack config
- Make sure you're using ES6 `export` syntax

### Issue: "removeChild error" or DOM manipulation errors

**Solutions:**
- Ensure you're clearing `innerHTML` or properly removing elements in `unmount`
- Don't try to manipulate DOM elements that have been removed
- Check that `props.domElement` exists before using it

### Issue: Event listeners not working

**Solutions:**
- Ensure event listeners are attached after elements are in the DOM
- Check that you're not removing elements before removing listeners
- Verify event listener cleanup in `unmount`

### Issue: Styles not loading

**Solutions:**
- Verify CSS loader is configured in webpack
- Check that styles are imported in `main.js` or `app.js`
- Ensure `style-loader` and `css-loader` are in the webpack config

### Debugging Tips

1. **Check Console Logs**: All lifecycle functions log to console
2. **Network Tab**: Verify the JS file is loading (200 status)
3. **SystemJS**: Check `System.import()` is working
4. **DOM Inspection**: Use browser DevTools to inspect the mounted elements
5. **Breakpoints**: Add `debugger;` statements in your code

## Example: Complete Minimal Pure JS App

Here's a minimal working example:

**package.json:**
```json
{
  "name": "minimal-pure-js-app",
  "version": "1.0.0",
  "scripts": {
    "start": "webpack serve --config webpack.config.js --port 9004",
    "build": "webpack --config webpack.config.js --mode production"
  },
  "dependencies": {
    "single-spa": "^6.0.0"
  },
  "devDependencies": {
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
    filename: 'minimal-pure-js-app.js',
    libraryTarget: 'system',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'minimal-pure-js-app.html',
      inject: false,
    }),
  ],
  devServer: {
    port: 9004,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  externals: ['single-spa'],
};
```

**src/main.js:**
```javascript
import './app.css';

export async function bootstrap(props) {
  console.log('Bootstrap');
}

export async function mount(props) {
  if (!props?.domElement) {
    throw new Error('No DOM element provided');
  }
  
  props.domElement.innerHTML = `
    <div class="app">
      <h2>Minimal Pure JS App</h2>
      <p>Hello from pure JavaScript!</p>
    </div>
  `;
}

export async function unmount(props) {
  if (props?.domElement) {
    props.domElement.innerHTML = '';
  }
}
```

**src/app.css:**
```css
.app {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}
```

## Advanced Examples

### Example: Using Templates

Instead of building DOM with `createElement`, you can use template strings:

```javascript
export function createApp(container, props) {
  const template = `
    <div class="app">
      <header>
        <h1>${props?.name || 'App'}</h1>
      </header>
      <main>
        <p>Content goes here</p>
      </main>
    </div>
  `;
  
  container.innerHTML = template;
  
  // Attach event listeners after DOM is created
  const button = container.querySelector('button');
  if (button) {
    button.addEventListener('click', handleClick);
  }
}
```

### Example: Component-like Structure

You can organize your code in a component-like way:

```javascript
// src/components/Counter.js
export function createCounter(container) {
  let count = 0;
  
  const render = () => {
    container.innerHTML = `
      <div class="counter">
        <p>Count: ${count}</p>
        <button id="increment">+</button>
        <button id="decrement">-</button>
      </div>
    `;
    
    container.querySelector('#increment').addEventListener('click', () => {
      count++;
      render();
    });
    
    container.querySelector('#decrement').addEventListener('click', () => {
      count--;
      render();
    });
  };
  
  render();
  return { destroy: () => container.innerHTML = '' };
}
```

## Creating a Child App Without Webpack

Yes! It's absolutely possible to create a child application in pure JavaScript **without webpack**. Since SystemJS can load modules from any URL, you can serve plain JavaScript files directly. Here are two approaches:

### Approach 1: SystemJS Format (Recommended)

Create a single JavaScript file that uses SystemJS module format. This is the simplest approach and works directly with SystemJS.

**Project Structure:**
```
my-pure-js-app-no-webpack/
├── app.js          # Single file with everything
└── server.js       # Simple HTTP server (optional)
```

**app.js** - Complete application in one file:

```javascript
// SystemJS module format - exports directly to SystemJS
(function() {
  'use strict';
  
  const APP_NAME = 'my-pure-js-app';
  
  // Application state
  let appState = {
    mounted: false,
    container: null,
    eventListeners: [],
  };
  
  // Create and inject CSS
  function injectStyles() {
    if (document.getElementById('pure-js-app-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pure-js-app-styles';
    style.textContent = `
      .pure-js-app {
        padding: 20px;
        background: #f0f0f0;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .app-header {
        color: #333;
        margin-bottom: 20px;
        border-bottom: 2px solid #007bff;
        padding-bottom: 10px;
      }
      .btn {
        padding: 10px 20px;
        margin: 5px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background-color: #007bff;
        color: white;
      }
      .btn:hover {
        background-color: #0056b3;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create the application
  function createApp(container, props) {
    if (appState.mounted) {
      console.warn('App is already mounted');
      return;
    }
    
    appState.container = container;
    appState.mounted = true;
    
    // Inject styles
    injectStyles();
    
    // Clear container
    container.innerHTML = '';
    
    // Create app structure
    const appRoot = document.createElement('div');
    appRoot.className = 'pure-js-app';
    
    let count = 0;
    
    const header = document.createElement('h2');
    header.className = 'app-header';
    header.textContent = 'Pure JS App (No Webpack!)';
    
    const counterDisplay = document.createElement('p');
    counterDisplay.textContent = `Count: ${count}`;
    counterDisplay.style.fontSize = '24px';
    counterDisplay.style.fontWeight = 'bold';
    
    const incrementBtn = document.createElement('button');
    incrementBtn.className = 'btn';
    incrementBtn.textContent = 'Increment';
    
    const handleIncrement = () => {
      count++;
      counterDisplay.textContent = `Count: ${count}`;
    };
    
    incrementBtn.addEventListener('click', handleIncrement);
    appState.eventListeners.push({
      element: incrementBtn,
      event: 'click',
      handler: handleIncrement
    });
    
    appRoot.appendChild(header);
    appRoot.appendChild(counterDisplay);
    appRoot.appendChild(incrementBtn);
    container.appendChild(appRoot);
    
    console.log(`✅ [${APP_NAME}] App created and mounted`);
  }
  
  // Destroy the application
  function destroyApp(container) {
    if (!appState.mounted) return;
    
    // Remove event listeners
    appState.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    appState.eventListeners = [];
    
    // Clear container
    container.innerHTML = '';
    
    appState.mounted = false;
    appState.container = null;
    
    console.log(`✅ [${APP_NAME}] App destroyed`);
  }
  
  // Bootstrap function
  async function bootstrap(props) {
    console.log(`🚀 [${APP_NAME}] Bootstrap`);
    // Optional: perform one-time initialization
  }
  
  // Mount function
  async function mount(props) {
    console.log(`📦 [${APP_NAME}] Mount`);
    if (!props || !props.domElement) {
      throw new Error('No DOM element provided');
    }
    createApp(props.domElement, props);
  }
  
  // Unmount function
  async function unmount(props) {
    console.log(`🗑️ [${APP_NAME}] Unmount`);
    if (props && props.domElement) {
      destroyApp(props.domElement);
    }
  }
  
  // Export to SystemJS
  // SystemJS will call this function and expect an object with bootstrap, mount, unmount
  if (typeof System !== 'undefined' && System.register) {
    // SystemJS format
    System.register([], function(_export) {
      return {
        execute: function() {
          _export('bootstrap', bootstrap);
          _export('mount', mount);
          _export('unmount', unmount);
        }
      };
    });
  } else {
    // Fallback: UMD format (works with SystemJS too)
    (function(root, factory) {
      if (typeof exports === 'object') {
        module.exports = factory();
      } else if (typeof define === 'function' && define.amd) {
        define(factory);
      } else {
        root['my-pure-js-app'] = factory();
      }
    }(typeof self !== 'undefined' ? self : this, function() {
      return {
        bootstrap: bootstrap,
        mount: mount,
        unmount: unmount
      };
    }));
  }
})();
```

**Serving the file:**

You can serve this file using any simple HTTP server:

**Option A: Using Python (if installed):**
```bash
# Python 3
python -m http.server 9004

# Python 2
python -m SimpleHTTPServer 9004
```

**Option B: Using Node.js http-server:**
```bash
npm install -g http-server
http-server -p 9004 --cors
```

**Option C: Using a simple Node.js server (server.js):**
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 9004;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './app.js';
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
  };
  
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`Access app.js at http://localhost:${port}/app.js`);
});
```

Run with: `node server.js`

**Adding to Main App:**
- Application URL: `http://localhost:9004/app.js`

### Approach 2: Native ES Modules

You can also use native ES modules, but this requires SystemJS to support ES modules or you need to configure it properly.

**app.js** (ES Module format):

```javascript
// Native ES module - requires proper MIME type and CORS
const APP_NAME = 'my-pure-js-app';

let appState = {
  mounted: false,
  container: null,
  eventListeners: [],
};

function createApp(container, props) {
  if (appState.mounted) return;
  
  appState.container = container;
  appState.mounted = true;
  container.innerHTML = '';
  
  const appRoot = document.createElement('div');
  appRoot.className = 'pure-js-app';
  appRoot.innerHTML = `
    <h2>Pure JS App (ES Module)</h2>
    <p>This is a native ES module!</p>
  `;
  
  container.appendChild(appRoot);
}

function destroyApp(container) {
  if (!appState.mounted) return;
  appState.eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  appState.eventListeners = [];
  container.innerHTML = '';
  appState.mounted = false;
}

export async function bootstrap(props) {
  console.log(`🚀 [${APP_NAME}] Bootstrap`);
}

export async function mount(props) {
  console.log(`📦 [${APP_NAME}] Mount`);
  if (!props?.domElement) throw new Error('No DOM element');
  createApp(props.domElement, props);
}

export async function unmount(props) {
  console.log(`🗑️ [${APP_NAME}] Unmount`);
  if (props?.domElement) destroyApp(props.domElement);
}
```

**Note:** For ES modules to work with SystemJS, you may need to configure SystemJS to handle ES modules, or use a build step to convert to SystemJS format.

### Comparison: Webpack vs No Webpack

| Feature | With Webpack | Without Webpack |
|---------|--------------|-----------------|
| **Setup Complexity** | Medium (config file needed) | Low (just a JS file) |
| **Build Step** | Required | Optional |
| **CSS Handling** | Automatic (loaders) | Manual (inject styles) |
| **Code Splitting** | Supported | Manual |
| **Minification** | Automatic | Manual (if needed) |
| **Hot Reload** | Built-in | Manual refresh |
| **Dependencies** | Many npm packages | None (or minimal) |
| **File Size** | Optimized | Raw size |
| **Best For** | Complex apps, production | Simple apps, prototyping |

### When to Use Each Approach

**Use Webpack when:**
- You have multiple files to organize
- You need CSS preprocessing (Sass, Less)
- You want code splitting and optimization
- You need hot module replacement
- You're building for production

**Use No-Webpack when:**
- You want the simplest possible setup
- You have a single-file application
- You're prototyping or learning
- You want zero build configuration
- You prefer minimal dependencies

### Tips for No-Webpack Approach

1. **Keep it simple**: Start with a single file, split later if needed
2. **Inject styles**: Use `<style>` tags or inline styles
3. **Use template literals**: For HTML generation
4. **Manual cleanup**: Always remove event listeners in unmount
5. **CORS headers**: Ensure your server sends proper CORS headers
6. **MIME types**: Make sure `.js` files are served as `application/javascript`

## Next Steps

- Add routing (if needed) using a simple router or hash-based routing
- Add state management for complex applications
- Add API integration
- Add tests using Jest or other testing frameworks
- Deploy to a CDN or server
- Add more complex features and interactions

## Additional Resources

- [Single-SPA Documentation](https://single-spa.js.org/)
- [MDN Web Docs - DOM Manipulation](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [SystemJS Documentation](https://github.com/systemjs/systemjs)
- [Webpack Documentation](https://webpack.js.org/)

---

**Note**: This guide assumes you're using the same main application setup. If your main app has different configurations, adjust accordingly.

