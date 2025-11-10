# Pure JavaScript Child Application (No Webpack)

This is a complete example of a single-spa child application written in **pure JavaScript** without any build tools, bundlers, or frameworks.

## Features

- ✅ **Zero build configuration** - No webpack, no babel, no build step
- ✅ **Single file** - Everything in one `app.js` file
- ✅ **No dependencies** - Pure vanilla JavaScript
- ✅ **SystemJS compatible** - Works with single-spa's SystemJS loader
- ✅ **Shows location information** - Displays host, protocol, hostname, port, and origin

## Project Structure

```
pure-js/
├── app.js          # Complete application (single file)
├── package.json     # Minimal package.json
└── README.md       # This file
```

## Quick Start

### 1. Serve the File

You can serve `app.js` using any simple HTTP server. Here are some options:

**Option A: Using Python (if installed):**
```bash
cd pure-js
# Python 3
python -m http.server 9004

# Python 2
python -m SimpleHTTPServer 9004
```

**Option B: Using Node.js http-server:**
```bash
npm install -g http-server
cd pure-js
http-server -p 9004 --cors
```

**Option C: Using any static file server**

The file will be available at:
```
http://localhost:9004/app.js
```

### 2. Add to Main Application

1. Open your main single-spa application (usually `http://localhost:9000`)
2. In the form, enter:
   - **Application Name**: `Pure JS App` (or any name)
   - **Application URL**: `http://localhost:9004/app.js` (adjust port if needed)
3. Click **Add Application**

The app should now appear in your main application and display the location information!

## How It Works

### SystemJS Module Format

The `app.js` file uses SystemJS's `System.register()` format to export the single-spa lifecycle functions:

- `bootstrap()` - Called once when the app is first loaded
- `mount()` - Called when the app should be displayed
- `unmount()` - Called when the app should be removed

### No Build Step Required

Since this is pure JavaScript with no JSX, TypeScript, or other transpilation needs, you can serve it directly. The file:

- Uses standard ES5/ES6 JavaScript
- Injects CSS via `<style>` tags
- Uses direct DOM manipulation
- Shows location information (host, protocol, hostname, port, origin)

### CORS Headers

Make sure your HTTP server sets proper CORS headers so the main app can load this child app from a different origin/port. Most simple servers (like Python's http.server) don't set CORS by default, so you may need to use a server that supports it (like `http-server` with `--cors` flag).

## Customization

### Modify the Application

Edit `app.js` to customize:

- App name (change `APP_NAME` constant)
- UI components (modify `createApp` function)
- Styles (modify `injectStyles` function)
- Behavior (add event handlers, state management, etc.)

### Add More Files

If you want to split into multiple files, you can:

1. Create additional `.js` files
2. Use ES6 modules (if your server supports it)
3. Or keep everything in one file (simpler for small apps)

## Comparison with Webpack Approach

| Feature | This (No Webpack) | With Webpack |
|---------|------------------|--------------|
| Setup | Just `npm start` | Need webpack config |
| Dependencies | None | Many npm packages |
| Build Step | None | Required |
| File Size | Raw size | Optimized |
| Hot Reload | Manual refresh | Automatic |
| Best For | Simple apps, learning | Complex apps, production |

## Troubleshooting

### "Failed to load application"

- Make sure your HTTP server is running
- Check the URL is correct (e.g., `http://localhost:9004/app.js`)
- Verify CORS headers are set (use `http-server --cors` or similar)

### "Module does not export bootstrap/mount/unmount"

- Check browser console for errors
- Verify the file is being served with correct MIME type (`application/javascript`)
- Make sure SystemJS is available in the main app

### App doesn't appear

- Check browser console for errors
- Verify the container element exists
- Check that single-spa is properly configured in the main app

## Development Tips

1. **Keep it simple**: Start with one file, split later if needed
2. **Use console.log**: Great for debugging lifecycle functions
3. **Test standalone**: You can open `app.js` directly in browser (though it won't work without SystemJS)
4. **Manual refresh**: Since there's no hot reload, refresh the browser after changes

## Next Steps

- Add more interactive features
- Split into multiple files if it grows
- Add routing if needed
- Deploy to a static file server or CDN

## License

ISC

