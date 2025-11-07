import { registerApplication, start, getAppNames, getAppStatus, getMountedApps } from 'single-spa';

// Extend Window interface for global single-spa utilities
declare global {
  interface Window {
    singleSpa: {
      registerApplication: typeof registerApplication;
      start: typeof start;
      getAppNames: typeof getAppNames;
      getAppStatus?: typeof getAppStatus;
      getMountedApps?: typeof getMountedApps;
    };
    debugSingleSpa: {
      logAppState: () => void;
      getRegisteredApps: () => string[];
      getAppStatus: (appName: string) => string | null;
      getAllAppStatuses: () => Record<string, string>;
    };
    System: {
      import: (module: string) => Promise<any>;
    };
  }
}

// Make single-spa available globally for dynamic registration and debugging
window.singleSpa = { 
  registerApplication, 
  start, 
  getAppNames,
  getAppStatus: typeof getAppStatus !== 'undefined' ? getAppStatus : undefined,
  getMountedApps: typeof getMountedApps !== 'undefined' ? getMountedApps : undefined,
};

// Setup comprehensive lifecycle event handlers for debugging
function setupSingleSpaEventHandlers() {
  const eventTypes = [
    // Routing events
    'single-spa:before-routing-event',
    'single-spa:routing-event',
    'single-spa:before-mount-routing-event',
    'single-spa:before-first-mount',
    'single-spa:first-mount',
    'single-spa:no-app-change',
    'single-spa:app-change',
    
    // App lifecycle events (these are dispatched with app name in detail)
    'single-spa:before-app-change',
    'single-spa:app-change',
    
    // Bootstrap events
    'single-spa:before-bootstrap',
    'single-spa:after-bootstrap',
    'single-spa:before-bootstrap-error',
    'single-spa:bootstrap-error',
    
    // Mount events
    'single-spa:before-mount',
    'single-spa:after-mount',
    'single-spa:before-mount-error',
    'single-spa:mount-error',
    
    // Unmount events
    'single-spa:before-unmount',
    'single-spa:after-unmount',
    'single-spa:before-unmount-error',
    'single-spa:unmount-error',
    
    // Update events (for apps that support it)
    'single-spa:before-update',
    'single-spa:after-update',
    'single-spa:before-update-error',
    'single-spa:update-error',
  ];

  eventTypes.forEach(eventType => {
    window.addEventListener(eventType, (event: Event) => {
      const customEvent = event as CustomEvent;
      const timestamp = new Date().toISOString();
      const eventData = {
        type: eventType,
        timestamp,
        detail: customEvent.detail || {},
        target: event.target,
      };

      // Format console output based on event type
      const isError = eventType.includes('error');
      const isBefore = eventType.includes('before-');
      const isAfter = eventType.includes('after-');
      
      const logMethod = isError ? 'error' : isBefore ? 'info' : 'log';
      const emoji = isError ? '❌' : isBefore ? '⏳' : isAfter ? '✅' : '📋';
      
      console.group(`${emoji} [${timestamp}] ${eventType}`);
      console[logMethod]('Event Details:', eventData);
      
      // Log app-specific information if available
      if (customEvent.detail && (customEvent.detail as any).appName) {
        console[logMethod](`App Name: ${(customEvent.detail as any).appName}`);
      }
      
      if (customEvent.detail && (customEvent.detail as any).activeApps) {
        console[logMethod](`Active Apps:`, (customEvent.detail as any).activeApps);
      }
      
      if (customEvent.detail && (customEvent.detail as any).mountingApps) {
        console[logMethod](`Mounting Apps:`, (customEvent.detail as any).mountingApps);
      }
      
      if (customEvent.detail && (customEvent.detail as any).unmountingApps) {
        console[logMethod](`Unmounting Apps:`, (customEvent.detail as any).unmountingApps);
      }
      
      if (customEvent.detail && (customEvent.detail as any).originalEvent) {
        console[logMethod](`Original Event:`, (customEvent.detail as any).originalEvent);
      }
      
      if (customEvent.detail && (customEvent.detail as any).error) {
        console.error(`Error:`, (customEvent.detail as any).error);
        console.error(`Error Stack:`, (customEvent.detail as any).error?.stack);
      }
      
      if (customEvent.detail && (customEvent.detail as any).domElement) {
        console[logMethod](`DOM Element:`, (customEvent.detail as any).domElement);
        console[logMethod](`DOM Element ID:`, (customEvent.detail as any).domElement?.id);
        console[logMethod](`DOM Element in body:`, document.body.contains((customEvent.detail as any).domElement));
      }
      
      // Log all registered apps on routing events
      if (eventType.includes('routing') || eventType.includes('app-change')) {
        try {
          const registeredApps = window.singleSpa?.getAppNames?.() || [];
          console[logMethod](`Registered Apps:`, registeredApps);
        } catch (e) {
          console.warn('Could not get registered apps:', e);
        }
      }
      
      console.groupEnd();
    });
  });

  // Add a catch-all handler for any single-spa events we might have missed
  // This uses event capturing to catch all single-spa events
  window.addEventListener('single-spa:before-routing-event', () => {
    // This will be handled by the specific handler above
  }, true);
  
  // Log helper function to track app state
  function logAppState() {
    try {
      const registeredApps = window.singleSpa?.getAppNames?.() || [];
      const mountedApps = window.singleSpa?.getMountedApps?.() || [];
      
      const appStatuses: Record<string, string> = {};
      registeredApps.forEach(appName => {
        try {
          if (window.singleSpa?.getAppStatus) {
            appStatuses[appName] = window.singleSpa.getAppStatus(appName) || 'UNKNOWN';
          } else {
            appStatuses[appName] = mountedApps.includes(appName) ? 'MOUNTED' : 'UNKNOWN';
          }
        } catch (e) {
          appStatuses[appName] = 'ERROR';
        }
      });
      
      console.group('📊 Current App State');
      console.log('Registered Apps:', registeredApps);
      console.log('Mounted Apps:', mountedApps);
      console.log('App Statuses:', appStatuses);
      console.log(`Total: ${registeredApps.length} registered, ${mountedApps.length} mounted`);
      console.groupEnd();
    } catch (e) {
      console.warn('Could not get app state:', e);
    }
  }
  
  // Expose debugging utilities globally for manual debugging
  window.debugSingleSpa = {
    logAppState,
    getRegisteredApps: () => window.singleSpa?.getAppNames?.() || [],
    getAppStatus: (appName: string) => {
      try {
        return window.singleSpa?.getAppStatus?.(appName) || null;
      } catch (e) {
        console.warn(`Could not get status for ${appName}:`, e);
        return null;
      }
    },
    getAllAppStatuses: () => {
      const apps = window.singleSpa?.getAppNames?.() || [];
      const statuses: Record<string, string> = {};
      apps.forEach(appName => {
        try {
          statuses[appName] = window.singleSpa?.getAppStatus?.(appName) || 'UNKNOWN';
        } catch (e) {
          statuses[appName] = 'ERROR';
        }
      });
      return statuses;
    },
  };
  
  console.log('🛠️ Debug utilities available at window.debugSingleSpa');
  console.log('   - debugSingleSpa.logAppState() - Log current app state');
  console.log('   - debugSingleSpa.getRegisteredApps() - Get all registered apps');
  console.log('   - debugSingleSpa.getAppStatus(appName) - Get status of specific app');
  console.log('   - debugSingleSpa.getAllAppStatuses() - Get status of all apps');

  console.log('🔧 Single-SPA lifecycle event handlers registered');
  console.log(`📊 Monitoring ${eventTypes.length} event types`);
  
  // Log a summary of what we're monitoring
  console.group('📋 Event Types Being Monitored:');
  eventTypes.forEach((type, index) => {
    console.log(`${index + 1}. ${type}`);
  });
  console.groupEnd();
}

// Setup event handlers before starting single-spa
setupSingleSpaEventHandlers();

registerApplication({
  name: 'main',
  app: () => window.System.import('main'),
  activeWhen: ['/'],
});

start({
  urlRerouteOnly: true,
});

console.log('🚀 Single-SPA started');

