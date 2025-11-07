import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

const APP_NAME = 'my-child-app';  // Change this to your app name

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

// Export lifecycle functions
export const { bootstrap, mount, unmount } = lifecycles;

