# TypeScript Support for Single-SPA Applications

This guide explains how to use TypeScript in both the main and child applications.

## Overview

TypeScript is fully supported in this single-spa setup. You can use TypeScript (`.ts` and `.tsx` files) in:
- Root configuration
- Main application
- Child applications

## Setup

### 1. Install TypeScript Dependencies

The required dependencies are already added to `package.json`:
- `typescript` - TypeScript compiler
- `@types/react` - React type definitions
- `@types/react-dom` - ReactDOM type definitions
- `ts-loader` - Webpack loader for TypeScript
- `@babel/preset-typescript` - Babel preset for TypeScript (alternative to ts-loader)

### 2. TypeScript Configuration

A root `tsconfig.json` is provided. You can also create app-specific configs if needed.

## Converting Existing Apps to TypeScript

### Main Application

#### Step 1: Rename Files

```bash
# Rename JavaScript files to TypeScript
mv main/src/main.js main/src/main.tsx
mv main/src/App.jsx main/src/App.tsx
```

#### Step 2: Update webpack.config.main.js

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './main/src/main.tsx',  // Changed to .tsx
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'system',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,  // Changed to handle .ts and .tsx
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'  // Added TypeScript preset
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './main/index.html',
      filename: 'main.html',
      inject: false,
    }),
  ],
  devServer: {
    port: 9001,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  externals: ['react', 'react-dom', 'single-spa'],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],  // Added .ts and .tsx
  },
};
```

#### Step 3: Update main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    return <div>Error: {err.message}</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
```

#### Step 4: Update App.tsx

```typescript
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface Application {
  name: string;
  url: string;
}

interface FormData {
  name: string;
  url: string;
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // ... rest of your component code
}

export default App;
```

### Child Application

#### Step 1: Rename Files

```bash
mv child/src/main.js child/src/main.tsx
mv child/src/App.jsx child/src/App.tsx
```

#### Step 2: Update webpack.config.child.js

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './child/src/main.tsx',  // Changed to .tsx
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'child.js',
    libraryTarget: 'system',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,  // Changed to handle .ts and .tsx
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'  // Added TypeScript preset
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
    extensions: ['.js', '.jsx', '.ts', '.tsx'],  // Added .ts and .tsx
  },
};
```

#### Step 3: Update child/src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import { LifeCycleFn } from 'single-spa';
import App from './App';

const APP_NAME = 'child-app';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    console.error(`[${APP_NAME}] Error Boundary triggered:`, err);
    return <div>Error: {err.message}</div>;
  },
});

export const bootstrap: LifeCycleFn = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`🚀 [${APP_NAME}] Bootstrap - ${timestamp}`);
  console.log('Bootstrap Props:', props);
  
  try {
    const startTime = performance.now();
    await lifecycles.bootstrap(props);
    const duration = performance.now() - startTime;
    
    console.log(`✅ Bootstrap completed in ${duration.toFixed(2)}ms`);
    console.groupEnd();
  } catch (error) {
    console.error(`❌ Bootstrap failed:`, error);
    console.groupEnd();
    throw error;
  }
};

export const mount: LifeCycleFn = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`📦 [${APP_NAME}] Mount - ${timestamp}`);
  console.log('Mount Props:', props);
  
  try {
    const startTime = performance.now();
    await lifecycles.mount(props);
    const duration = performance.now() - startTime;
    
    console.log(`✅ Mount completed in ${duration.toFixed(2)}ms`);
    console.groupEnd();
  } catch (error) {
    console.error(`❌ Mount failed:`, error);
    console.groupEnd();
    throw error;
  }
};

export const unmount: LifeCycleFn = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`🗑️ [${APP_NAME}] Unmount - ${timestamp}`);
  console.log('Unmount Props:', props);
  
  try {
    const startTime = performance.now();
    await lifecycles.unmount(props);
    const duration = performance.now() - startTime;
    
    console.log(`✅ Unmount completed in ${duration.toFixed(2)}ms`);
    console.groupEnd();
  } catch (error) {
    console.error(`❌ Unmount failed:`, error);
    console.groupEnd();
    throw error;
  }
};
```

#### Step 4: Update child/src/App.tsx

```typescript
import React from 'react';
import './App.css';

function App(): JSX.Element {
  const host = window.location.host;
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  const origin = window.location.origin;

  return (
    <div className="child-app">
      <div className="host-info">
        <h2>Host Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Host:</span>
            <span className="info-value">{host}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Protocol:</span>
            <span className="info-value">{protocol}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Hostname:</span>
            <span className="info-value">{hostname}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Port:</span>
            <span className="info-value">{port || 'default'}</span>
          </div>
          <div className="info-item full-width">
            <span className="info-label">Origin:</span>
            <span className="info-value">{origin}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

### Root Configuration

#### Step 1: Rename root-config.js

```bash
mv root-config.js root-config.ts
```

#### Step 2: Update webpack.config.root.js

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './root-config.ts',  // Changed to .ts
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'root-config.js',
    libraryTarget: 'system',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,  // Changed to handle .ts
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript'  // Added TypeScript preset
            ],
          },
        },
      },
    ],
  },
  // ... rest of config
  resolve: {
    extensions: ['.js', '.ts'],  // Added .ts
  },
};
```

#### Step 3: Update root-config.ts

```typescript
import { registerApplication, start, getAppNames, getAppStatus, getMountedApps } from 'single-spa';

// Make single-spa available globally for dynamic registration and debugging
(window as any).singleSpa = { 
  registerApplication, 
  start, 
  getAppNames,
  getAppStatus: typeof getAppStatus !== 'undefined' ? getAppStatus : undefined,
  getMountedApps: typeof getMountedApps !== 'undefined' ? getMountedApps : undefined,
};

// ... rest of your root config
```

## TypeScript Features

### Type Safety

TypeScript provides type checking for:
- Component props
- State management
- Function parameters and return types
- Single-spa lifecycle functions
- Event handlers

### Example: Typed Props

```typescript
interface ChildAppRendererProps {
  appUrl: string;
  appName: string;
  index: number;
}

const ChildAppRenderer: React.FC<ChildAppRendererProps> = ({ 
  appUrl, 
  appName, 
  index 
}) => {
  // Component implementation
};
```

### Example: Typed Single-SPA Lifecycle

```typescript
import { LifeCycleFn, AppProps } from 'single-spa';

export const mount: LifeCycleFn<AppProps> = async (props) => {
  // props is now typed as AppProps
  const { name, domElement, singleSpa } = props;
  // TypeScript knows the structure of props
};
```

## Benefits of TypeScript

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Autocomplete, refactoring, navigation
3. **Self-Documenting**: Types serve as documentation
4. **Refactoring**: Safer refactoring with type checking
5. **Single-SPA Types**: Full type support for single-spa APIs

## Migration Strategy

You can migrate gradually:

1. **Start with new files**: Use `.tsx` for new components
2. **Convert incrementally**: Convert one file at a time
3. **Use `allowJs: true`**: Mix TypeScript and JavaScript during migration
4. **Enable strict mode gradually**: Start with `strict: false`, then enable strict checks

## Common TypeScript Patterns

### Typing React Components

```typescript
import React from 'react';

interface Props {
  title: string;
  count?: number;
  onAction: (id: string) => void;
}

const MyComponent: React.FC<Props> = ({ title, count = 0, onAction }) => {
  return <div>{title}</div>;
};
```

### Typing State

```typescript
interface AppState {
  applications: Application[];
  loading: boolean;
  error: string | null;
}

const [state, setState] = useState<AppState>({
  applications: [],
  loading: false,
  error: null,
});
```

### Typing Event Handlers

```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  // Handle submit
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  setValue(e.target.value);
};
```

## Troubleshooting

### Issue: "Cannot find module 'react'"

**Solution**: Install type definitions:
```bash
npm install --save-dev @types/react @types/react-dom
```

### Issue: "JSX element implicitly has type 'any'"

**Solution**: Ensure `jsx` is set to `"react-jsx"` in `tsconfig.json`

### Issue: "Property does not exist on type"

**Solution**: Add proper type definitions or use type assertions:
```typescript
(window as any).singleSpa = { ... };
```

### Issue: Type errors in single-spa lifecycle

**Solution**: Import types from single-spa:
```typescript
import { LifeCycleFn, AppProps } from 'single-spa';
```

## Next Steps

- Enable strict mode for better type safety
- Add ESLint with TypeScript support
- Set up type checking in CI/CD
- Create shared type definitions between apps

