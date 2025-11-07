# Single-SPA Microfrontend Application

This project contains a single-spa microfrontend setup with:
1. **Main Application**: Manages and displays child applications
2. **Child Application**: Displays host information where the app is hosted

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start all applications:
```bash
npm start
```

This will start:
- Root config on port 9000
- Main application on port 9001
- Child application on port 9002

3. Open your browser and navigate to:
```
http://localhost:9000
```

## Usage

### Main Application
- Enter an application name and URL
- Click "Add Application" to add a new child application
- Edit existing applications by clicking "Edit"
- Delete applications by clicking "Delete"
- You can add unlimited child applications
- **Dynamic Registration**: Child applications can be added dynamically without being listed in `index.html` or any configuration files. Simply provide the URL to the child application's JavaScript bundle (e.g., `http://localhost:9002/child.js`)

### Child Application
- Displays the host information where the application is running
- Shows: Host, Protocol, Hostname, Port, and Origin

## Dynamic Application Registration

This implementation supports **fully dynamic registration** of child applications:

- ✅ No hardcoding required: Child apps don't need to be listed in `index.html` or `root-config.js`
- ✅ Runtime registration: Applications are registered when you add them through the UI
- ✅ Any URL: You can add applications from any URL (local or remote)
- ✅ SystemJS dynamic imports: Uses `System.import()` to load applications from any URL without pre-registration

### How It Works

1. The main app uses `window.singleSpa.registerApplication()` to dynamically register child apps
2. SystemJS's `System.import()` can load modules from any URL without requiring them to be in the import map
3. Each child app is loaded, bootstrapped, and mounted into its own container
4. Applications are stored in localStorage and persist across page reloads

## Project Structure

```
.
├── root-config.js          # Single-spa root configuration
├── index.html              # Root HTML file
├── main/                   # Main application
│   ├── src/
│   │   ├── main.js        # Single-spa lifecycle
│   │   ├── App.jsx        # Main app component
│   │   └── App.css        # Main app styles
│   └── index.html
├── child/                  # Child application
│   ├── src/
│   │   ├── main.js        # Single-spa lifecycle
│   │   ├── App.jsx        # Child app component
│   │   └── App.css        # Child app styles
│   └── index.html
├── child-app-template/     # Template for creating new child apps
├── webpack.config.*.js     # Webpack configurations
└── CHILD_APP_GUIDE.md      # Complete guide for creating child apps
```

## Creating New Child Applications

See **[CHILD_APP_GUIDE.md](./CHILD_APP_GUIDE.md)** for a complete guide on creating independent child applications.

Quick start: Use the `child-app-template/` directory as a starting point for new child apps.

