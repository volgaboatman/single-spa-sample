// SystemJS module format - exports directly to SystemJS
// Pure JavaScript child application without webpack
(function() {
  'use strict';

  const APP_NAME = 'pure-js-app';

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
        min-height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      .host-info {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 600px;
        width: 100%;
      }
      .host-info h2 {
        margin: 0 0 25px 0;
        color: #333;
        text-align: center;
        font-size: 2em;
        border-bottom: 3px solid #764ba2;
        padding-bottom: 15px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .info-item {
        display: flex;
        flex-direction: column;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #764ba2;
      }
      .info-item.full-width {
        grid-column: 1 / -1;
      }
      .info-label {
        font-weight: 600;
        color: #666;
        margin-bottom: 8px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .info-value {
        color: #333;
        font-size: 18px;
        word-break: break-all;
        font-family: 'Courier New', monospace;
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

    // Get location information
    const host = window.location.host;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const origin = window.location.origin;

    // Create app structure
    const appRoot = document.createElement('div');
    appRoot.className = 'pure-js-app';

    // Create host info container
    const hostInfo = document.createElement('div');
    hostInfo.className = 'host-info';

    // Create header
    const header = document.createElement('h2');
    header.textContent = 'Host Information';
    hostInfo.appendChild(header);

    // Create info grid
    const infoGrid = document.createElement('div');
    infoGrid.className = 'info-grid';

    // Helper function to create info item
    function createInfoItem(label, value) {
      const item = document.createElement('div');
      item.className = 'info-item';

      const labelEl = document.createElement('span');
      labelEl.className = 'info-label';
      labelEl.textContent = label + ':';

      const valueEl = document.createElement('span');
      valueEl.className = 'info-value';
      valueEl.textContent = value;

      item.appendChild(labelEl);
      item.appendChild(valueEl);
      return item;
    }

    // Create info items
    infoGrid.appendChild(createInfoItem('Host', host));
    infoGrid.appendChild(createInfoItem('Protocol', protocol));
    infoGrid.appendChild(createInfoItem('Hostname', hostname));
    infoGrid.appendChild(createInfoItem('Port', port || 'default'));

    // Origin spans full width
    const originItem = createInfoItem('Origin', origin);
    originItem.classList.add('full-width');
    infoGrid.appendChild(originItem);

    hostInfo.appendChild(infoGrid);
    appRoot.appendChild(hostInfo);

    // Mount to container
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
    const timestamp = new Date().toISOString();
    console.group(`🚀 [${APP_NAME}] Bootstrap - ${timestamp}`);
    console.log('Bootstrap Props:', props);

    try {
      const startTime = performance.now();
      // Optional: perform one-time initialization
      const duration = performance.now() - startTime;
      console.log(`✅ Bootstrap completed in ${duration.toFixed(2)}ms`);
      console.groupEnd();
    } catch (error) {
      console.error(`❌ Bootstrap failed:`, error);
      console.groupEnd();
      throw error;
    }
  }

  // Mount function
  async function mount(props) {
    const timestamp = new Date().toISOString();
    console.group(`📦 [${APP_NAME}] Mount - ${timestamp}`);
    console.log('Mount Props:', props);
    console.log('DOM Element:', props?.domElement);

    try {
      const startTime = performance.now();

      if (!props || !props.domElement) {
        throw new Error('No DOM element provided');
      }

      createApp(props.domElement, props);

      const duration = performance.now() - startTime;
      console.log(`✅ Mount completed in ${duration.toFixed(2)}ms`);
      console.groupEnd();
    } catch (error) {
      console.error(`❌ Mount failed:`, error);
      console.groupEnd();
      throw error;
    }
  }

  // Unmount function
  async function unmount(props) {
    const timestamp = new Date().toISOString();
    console.group(`🗑️ [${APP_NAME}] Unmount - ${timestamp}`);
    console.log('Unmount Props:', props);

    try {
      const startTime = performance.now();

      if (props && props.domElement) {
        destroyApp(props.domElement);
      }

      const duration = performance.now() - startTime;
      console.log(`✅ Unmount completed in ${duration.toFixed(2)}ms`);
      console.groupEnd();
    } catch (error) {
      console.error(`❌ Unmount failed:`, error);
      console.groupEnd();
      throw error;
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
        root['pure-js-app'] = factory();
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

