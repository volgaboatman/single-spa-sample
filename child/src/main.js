import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

const APP_NAME = 'child-app';

// Log when the module is first loaded
console.log(`📥 [${APP_NAME}] Module loaded at ${new Date().toISOString()}`);
console.log(`📥 [${APP_NAME}] React version: ${React.version}`);
console.log(`📥 [${APP_NAME}] ReactDOM version: ${ReactDOM.version}`);
console.log(`📥 [${APP_NAME}] Module location: ${window.location.href}`);

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    console.error(`[${APP_NAME}] Error Boundary triggered:`, err);
    console.error(`[${APP_NAME}] Error Info:`, info);
    console.error(`[${APP_NAME}] Error Props:`, props);
    return <div>Error: {err.message}</div>;
  },
});

// Wrap lifecycle functions with detailed logging
const originalBootstrap = lifecycles.bootstrap;
const originalMount = lifecycles.mount;
const originalUnmount = lifecycles.unmount;

export const bootstrap = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`🚀 [${APP_NAME}] Bootstrap - ${timestamp}`);
  console.log('Bootstrap Props:', props);
  console.log('App Name:', props?.name || 'unknown');
  console.log('Single-SPA Instance:', props?.singleSpa ? 'available' : 'not available');
  console.log('React Version:', React.version);
  console.log('ReactDOM Version:', ReactDOM.version);

  try {
    console.log('Starting bootstrap...');
    const startTime = performance.now();

    const result = await originalBootstrap(props);

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`✅ Bootstrap completed successfully in ${duration.toFixed(2)}ms`);
    console.log('Bootstrap Result:', result);
    console.groupEnd();

    return result;
  } catch (error) {
    console.error(`❌ Bootstrap failed:`, error);
    console.error('Error Stack:', error.stack);
    console.error('Error Details:', {
      message: error.message,
      name: error.name,
      cause: error.cause,
    });
    console.groupEnd();
    throw error;
  }
};

export const mount = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`📦 [${APP_NAME}] Mount - ${timestamp}`);
  console.log('Mount Props:', props);
  console.log('App Name:', props?.name || 'unknown');
  console.log('DOM Element:', props?.domElement);
  console.log('DOM Element ID:', props?.domElement?.id);
  console.log('DOM Element Tag:', props?.domElement?.tagName);
  console.log('DOM Element Classes:', props?.domElement?.className);
  console.log('DOM Element in Document:', props?.domElement ? document.contains(props.domElement) : false);
  console.log('DOM Element Parent:', props?.domElement?.parentElement?.tagName);
  console.log('DOM Element InnerHTML Before:', props?.domElement?.innerHTML?.substring(0, 100) || 'empty');
  console.log('Single-SPA Instance:', props?.singleSpa ? 'available' : 'not available');

  // Check if React and ReactDOM are available
  console.log('React Available:', typeof React !== 'undefined');
  console.log('ReactDOM Available:', typeof ReactDOM !== 'undefined');

  try {
    console.log('Starting mount...');
    const startTime = performance.now();

    const result = await originalMount(props);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Check DOM after mount
    console.log('DOM Element InnerHTML After:', props?.domElement?.innerHTML?.substring(0, 200) || 'empty');
    console.log('DOM Element Children Count:', props?.domElement?.children?.length || 0);
    console.log('DOM Element First Child:', props?.domElement?.firstChild?.nodeName);

    console.log(`✅ Mount completed successfully in ${duration.toFixed(2)}ms`);
    console.log('Mount Result:', result);
    console.groupEnd();

    return result;
  } catch (error) {
    console.error(`❌ Mount failed:`, error);
    console.error('Error Stack:', error.stack);
    console.error('Error Details:', {
      message: error.message,
      name: error.name,
      cause: error.cause,
    });
    console.error('DOM Element State:', {
      id: props?.domElement?.id,
      innerHTML: props?.domElement?.innerHTML?.substring(0, 100),
      inDocument: props?.domElement ? document.contains(props.domElement) : false,
    });
    console.groupEnd();
    throw error;
  }
};

export const unmount = async (props) => {
  const timestamp = new Date().toISOString();
  console.group(`🗑️ [${APP_NAME}] Unmount - ${timestamp}`);
  console.log('Unmount Props:', props);
  console.log('App Name:', props?.name || 'unknown');
  console.log('DOM Element:', props?.domElement);
  console.log('DOM Element ID:', props?.domElement?.id);
  console.log('DOM Element InnerHTML Before Unmount:', props?.domElement?.innerHTML?.substring(0, 100) || 'empty');
  console.log('DOM Element Children Count Before:', props?.domElement?.children?.length || 0);

  try {
    console.log('Starting unmount...');
    const startTime = performance.now();

    const result = await originalUnmount(props);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Check DOM after unmount
    console.log('DOM Element InnerHTML After Unmount:', props?.domElement?.innerHTML?.substring(0, 100) || 'empty');
    console.log('DOM Element Children Count After:', props?.domElement?.children?.length || 0);

    console.log(`✅ Unmount completed successfully in ${duration.toFixed(2)}ms`);
    console.log('Unmount Result:', result);
    console.groupEnd();

    return result;
  } catch (error) {
    console.error(`❌ Unmount failed:`, error);
    console.error('Error Stack:', error.stack);
    console.error('Error Details:', {
      message: error.message,
      name: error.name,
      cause: error.cause,
    });
    console.groupEnd();
    throw error;
  }
};

