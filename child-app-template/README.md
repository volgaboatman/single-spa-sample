# Child Application Template

Quick-start template for creating a new child application.

## Quick Start

1. Copy this template to a new directory
2. Update `package.json` with your app name
3. Update webpack config port and filename
4. Customize `src/App.jsx` with your components
5. Run `npm install && npm start`

## Files Included

- `package.json` - Dependencies and scripts
- `webpack.config.js` - Webpack configuration
- `src/main.js` - Single-spa lifecycle exports
- `src/App.jsx` - Main React component
- `src/App.css` - Styles
- `index.html` - HTML template
- `.babelrc` - Babel configuration (optional)

## Configuration

Update these values for your app:

1. **package.json**: Change `name` field
2. **webpack.config.js**: 
   - Change `filename` in output
   - Change `port` in devServer
3. **src/main.js**: Change `APP_NAME` constant

## Adding to Main App

Once running, add to main app with:
- **Name**: Your app name
- **URL**: `http://localhost:YOUR_PORT/YOUR_FILENAME.js`

