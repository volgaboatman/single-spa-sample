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

export const bootstrap = originalBootstrap
  ? async (props?: any) => {
      const startTime = performance.now();
      console.group(`🚀 [${APP_NAME}] Bootstrap started`);
      console.log('Props:', props);
      console.log('Timestamp:', new Date().toISOString());
      
      try {
        const result = await originalBootstrap(props);
        const duration = performance.now() - startTime;
        console.log(`✅ [${APP_NAME}] Bootstrap completed in ${duration.toFixed(2)}ms`);
        console.log('Result:', result);
        console.groupEnd();
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`❌ [${APP_NAME}] Bootstrap failed after ${duration.toFixed(2)}ms`);
        console.error('Error:', error);
        console.error('Error stack:', (error as Error).stack);
        console.groupEnd();
        throw error;
      }
    }
  : undefined;

export const mount = originalMount
  ? async (props?: any) => {
      const startTime = performance.now();
      console.group(`📦 [${APP_NAME}] Mount started`);
      console.log('Props:', props);
      console.log('DOM Element:', props?.domElement);
      console.log('DOM Element ID:', props?.domElement?.id);
      console.log('DOM Element in body:', props?.domElement ? document.body.contains(props.domElement) : 'N/A');
      console.log('Timestamp:', new Date().toISOString());
      
      try {
        const result = await originalMount(props);
        const duration = performance.now() - startTime;
        console.log(`✅ [${APP_NAME}] Mount completed in ${duration.toFixed(2)}ms`);
        console.log('Result:', result);
        console.log('DOM Element after mount:', props?.domElement);
        console.log('DOM Element innerHTML:', props?.domElement?.innerHTML?.substring(0, 100) + '...');
        console.groupEnd();
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`❌ [${APP_NAME}] Mount failed after ${duration.toFixed(2)}ms`);
        console.error('Error:', error);
        console.error('Error stack:', (error as Error).stack);
        console.error('DOM Element:', props?.domElement);
        console.groupEnd();
        throw error;
      }
    }
  : undefined;

export const unmount = originalUnmount
  ? async (props?: any) => {
      const startTime = performance.now();
      console.group(`📤 [${APP_NAME}] Unmount started`);
      console.log('Props:', props);
      console.log('DOM Element:', props?.domElement);
      console.log('DOM Element ID:', props?.domElement?.id);
      console.log('DOM Element innerHTML before unmount:', props?.domElement?.innerHTML?.substring(0, 100) + '...');
      console.log('Timestamp:', new Date().toISOString());
      
      try {
        const result = await originalUnmount(props);
        const duration = performance.now() - startTime;
        console.log(`✅ [${APP_NAME}] Unmount completed in ${duration.toFixed(2)}ms`);
        console.log('Result:', result);
        console.log('DOM Element after unmount:', props?.domElement);
        console.log('DOM Element innerHTML after unmount:', props?.domElement?.innerHTML?.substring(0, 100) + '...');
        console.groupEnd();
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`❌ [${APP_NAME}] Unmount failed after ${duration.toFixed(2)}ms`);
        console.error('Error:', error);
        console.error('Error stack:', (error as Error).stack);
        console.error('DOM Element:', props?.domElement);
        console.groupEnd();
        throw error;
      }
    }
  : undefined;

