import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // Load applications from localStorage on mount
  useEffect(() => {
    const savedApps = localStorage.getItem('childApplications');
    if (savedApps) {
      setApplications(JSON.parse(savedApps));
    }
  }, []);

  // Save applications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('childApplications', JSON.stringify(applications));
    // Dynamically register child applications
    registerChildApplications(applications);
  }, [applications]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Please fill in both application name and URL');
      return;
    }

    if (editingIndex !== null) {
      // Update existing application
      const updated = [...applications];
      updated[editingIndex] = { ...formData };
      setApplications(updated);
      setEditingIndex(null);
    } else {
      // Add new application
      setApplications([...applications, { ...formData }]);
    }

    setFormData({ name: '', url: '' });
  };

  const handleEdit = (index) => {
    setFormData(applications[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updated = applications.filter((_, i) => i !== index);
    setApplications(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
      setFormData({ name: '', url: '' });
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData({ name: '', url: '' });
  };

  const registerChildApplications = (apps) => {
    // Note: We're not registering with single-spa routing since we're manually mounting
    // The apps are loaded and mounted directly in ChildAppRenderer component
    console.log(`[Main App] Managing ${apps.length} child applications (manual mounting)`);
    
    // Optional: Store app metadata for reference
    apps.forEach((app, index) => {
      const appName = `child-app-${app.name.replace(/\s+/g, '-').toLowerCase()}-${index}`;
      console.log(`[Main App] Child app configured: ${appName} at ${app.url}`);
    });
  };

  // Component to render child applications dynamically
  const ChildAppRenderer = ({ appUrl, appName, index }) => {
    console.log(`[ChildAppRenderer] Component rendering for ${appName} (index: ${index}, url: ${appUrl})`);
    
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const appInstanceRef = useRef(null);
    const [containerReady, setContainerReady] = useState(false);

    // Use callback ref to know when the container is actually in the DOM
    const setContainerRef = (element) => {
      containerRef.current = element;
      if (element) {
        console.log(`[ChildAppRenderer] Container ref set for ${appName}:`, element);
        setContainerReady(true);
      }
    };

    useEffect(() => {
      if (!containerReady) {
        console.log(`[ChildAppRenderer] Container not ready yet for ${appName}, waiting...`);
        return;
      }
      
      console.log(`[ChildAppRenderer] useEffect triggered for ${appName} (index: ${index})`);
      console.log(`[ChildAppRenderer] appUrl: ${appUrl}`);
      console.log(`[ChildAppRenderer] containerRef.current:`, containerRef.current);
      
      const loadChildApp = async () => {
        try {
          console.log(`[ChildAppRenderer] Starting loadChildApp for ${appName}`);
          setLoading(true);
          setError(null);
          
          if (!containerRef.current) {
            console.error(`[ChildAppRenderer] containerRef.current is null for ${appName}`);
            setError('Container element not available');
            setLoading(false);
            return;
          }
          
          console.log(`[ChildAppRenderer] Container ref is available for ${appName}`);
          
          // Create a separate inner container for single-spa-react to mount to
          // This avoids conflicts with React-managed overlays
          const wrapperElement = containerRef.current;
          const containerId = `child-app-root-${index}-${Date.now()}`;
          
          // Find or create the inner container for the child app
          let containerElement = wrapperElement.querySelector(`#${containerId}`);
          if (!containerElement) {
            containerElement = document.createElement('div');
            containerElement.id = containerId;
            containerElement.style.width = '100%';
            containerElement.style.height = '100%';
            wrapperElement.appendChild(containerElement);
            console.log(`[ChildAppRenderer] Created inner container: ${containerId}`);
          } else {
            console.log(`[ChildAppRenderer] Using existing inner container: ${containerId}`);
          }
          
          // Ensure the container is in the DOM
          if (!document.body.contains(containerElement)) {
            console.warn('Container element not in DOM, but continuing...');
          }
          
          console.log('Container ready:', {
            id: containerId,
            inDOM: document.body.contains(containerElement),
            parent: containerElement.parentElement?.tagName,
            tagName: containerElement.tagName,
            wrapperChildren: wrapperElement.children.length,
          });
          
          // Dynamically import the child app from the provided URL
          // SystemJS can import from any URL without pre-registration in import map
          try {
            console.log(`Loading child app from: ${appUrl}`);
            
            // First, check if the URL is accessible
            try {
              const response = await fetch(appUrl, { method: 'HEAD' });
              if (!response.ok && response.status !== 0) {
                throw new Error(`File not found (${response.status}): ${appUrl}. Make sure the file exists and the server is running.`);
              }
            } catch (fetchError) {
              // If HEAD fails, try to import anyway (might be CORS issue)
              console.warn('HEAD request failed, attempting import anyway:', fetchError);
            }
            
            // Ensure SystemJS import map is available for the child app
            // Pre-load React, ReactDOM, and single-spa-react to ensure they're available
            // This is important because when loading from remote URLs, SystemJS might not
            // automatically resolve dependencies from the import map
            try {
              console.log('Pre-loading dependencies...');
              await Promise.all([
                System.import('react').catch(err => {
                  console.error('Failed to load react:', err);
                  throw new Error('React is not available in SystemJS import map');
                }),
                System.import('react-dom').catch(err => {
                  console.error('Failed to load react-dom:', err);
                  throw new Error('ReactDOM is not available in SystemJS import map');
                }),
                System.import('single-spa-react').catch(err => {
                  console.warn('Failed to load single-spa-react (might be bundled):', err);
                }),
                System.import('single-spa').catch(err => {
                  console.error('Failed to load single-spa:', err);
                  throw new Error('single-spa is not available in SystemJS import map');
                }),
              ]);
              console.log('Dependencies pre-loaded successfully');
            } catch (checkError) {
              console.error('Error pre-loading dependencies:', checkError);
              throw new Error(`Required dependencies not available: ${checkError.message}`);
            }
            
            const appModule = await System.import(appUrl);
            console.log('App module loaded:', appModule);
            console.log('App module keys:', Object.keys(appModule || {}));
            
            if (appModule && appModule.bootstrap && appModule.mount && appModule.unmount) {
              // Store the app module for cleanup
              appInstanceRef.current = { module: appModule, containerId, containerElement: containerElement };
              
              // Bootstrap the app
              console.log('Bootstrapping app...');
              try {
                await appModule.bootstrap();
                console.log('App bootstrapped successfully');
              } catch (bootstrapError) {
                console.error('Bootstrap error:', bootstrapError);
                throw new Error(`Bootstrap failed: ${bootstrapError.message}`);
              }
              
              // Mount the app to the container
              // single-spa-react expects props with name, domElement, and singleSpa
              console.log('Mounting app to container:', containerId);
              console.log('Container element:', containerElement);
              console.log('Container in DOM:', document.body.contains(containerElement));
              
              const mountProps = {
                name: `child-${appName}-${index}`,
                domElement: containerElement,
                singleSpa: window.singleSpa,
              };
              
              try {
                const mountResult = await appModule.mount(mountProps);
                console.log('Mount result:', mountResult);
                console.log('Container HTML after mount:', containerElement.innerHTML);
                
                // Wait a bit for React to render
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log('Container HTML after wait:', containerElement.innerHTML);
                
                if (!containerElement.innerHTML || containerElement.innerHTML.trim() === '') {
                  console.warn('Container is empty after mount - React may not have rendered');
                  // Check if there are any React errors
                  const reactErrors = window.console._errors || [];
                  if (reactErrors.length > 0) {
                    console.error('React errors detected:', reactErrors);
                  }
                }
                
                console.log('App mounted successfully');
              } catch (mountError) {
                console.error('Mount error:', mountError);
                console.error('Mount error stack:', mountError.stack);
                throw new Error(`Mount failed: ${mountError.message}`);
              }
              
              setLoading(false);
            } else {
              const missingExports = [];
              if (!appModule.bootstrap) missingExports.push('bootstrap');
              if (!appModule.mount) missingExports.push('mount');
              if (!appModule.unmount) missingExports.push('unmount');
              throw new Error(`Application does not export required functions: ${missingExports.join(', ')}. Available exports: ${Object.keys(appModule || {}).join(', ')}`);
            }
          } catch (importError) {
            console.error('Error loading child app:', importError);
            console.error('Error stack:', importError.stack);
            setError(`Failed to load application: ${importError.message}`);
            setLoading(false);
          }
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };

      loadChildApp();
      
      // Cleanup function - unmount the app when component unmounts
      return () => {
        if (appInstanceRef.current) {
          const { module, containerElement, containerId } = appInstanceRef.current;
          
          if (module && module.unmount && containerElement) {
            console.log(`[ChildAppRenderer] Unmounting ${appName} from container ${containerId}`);
            module.unmount({
              name: `child-${appName}-${index}`,
              domElement: containerElement,
              singleSpa: window.singleSpa,
            }).catch((err) => {
              console.error('Error unmounting app:', err);
            }).finally(() => {
              // Clean up the inner container after unmount
              if (containerElement && containerElement.parentElement) {
                try {
                  containerElement.parentElement.removeChild(containerElement);
                  console.log(`[ChildAppRenderer] Removed inner container ${containerId}`);
                } catch (removeError) {
                  // Ignore errors if element was already removed
                  console.warn(`[ChildAppRenderer] Could not remove container (may already be removed):`, removeError);
                }
              }
            });
          }
          
          appInstanceRef.current = null;
        }
      };
    }, [appUrl, appName, index, containerReady]);

    // Always render the container div so the ref can be set
    // Show loading/error as overlay or inside the container
    return (
      <div ref={setContainerRef} className="child-app-wrapper" style={{ position: 'relative', minHeight: '200px' }}>
        {/* Loading and error overlays - positioned absolutely so they don't interfere with single-spa-react */}
        {loading && !error && (
          <div className="loading-state" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.9)', zIndex: 10, pointerEvents: 'none' }}>
            Loading {appName}...
          </div>
        )}
        {error && (
          <div className="error-state" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248, 215, 218, 0.9)', zIndex: 10 }}>
            Error: {error}
          </div>
        )}
        {/* single-spa-react will mount its root here as a direct child */}
      </div>
    );
  };

  return (
    <div className="main-app">
      <div className="container">
        <h1>Microfrontend Manager</h1>
        
        <form onSubmit={handleSubmit} className="app-form">
          <div className="form-group">
            <label htmlFor="name">Application Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter application name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="url">Application URL:</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="http://localhost:9002/child.js"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingIndex !== null ? 'Update Application' : 'Add Application'}
            </button>
            {editingIndex !== null && (
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="applications-list">
          <h2>Child Applications ({applications.length})</h2>
          {applications.length === 0 ? (
            <p className="empty-state">No applications added yet. Add one above!</p>
          ) : (
            <div className="app-cards">
              {applications.map((app, index) => (
                <div key={index} className="app-card">
                  <div className="app-card-header">
                    <h3>{app.name}</h3>
                    <div className="app-card-actions">
                      <button
                        onClick={() => handleEdit(index)}
                        className="btn btn-small btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="btn btn-small btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="app-card-body">
                    <p><strong>URL:</strong> {app.url}</p>
                    <div className="child-app-container" id={`child-app-${app.name.replace(/\s+/g, '-').toLowerCase()}-${index}`}>
                      <ChildAppRenderer appUrl={app.url} appName={app.name} index={index} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

