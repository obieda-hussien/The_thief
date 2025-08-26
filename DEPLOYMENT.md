# GitHub Pages Deployment

This repository is configured for GitHub Pages hosting. The Resource Runners AI Evolution Simulation can be accessed directly through GitHub Pages once enabled.

## Automatic Deployment

The game is deployed automatically from the main branch using GitHub Pages. All necessary files are included:

- `index.html` - Main entry point
- `*.js` - Game logic and AI components  
- `style.css` - Styling
- `matter.min.js` - Physics engine
- `README.md` - Documentation

## Enabling GitHub Pages

To enable GitHub Pages hosting for this repository:

1. Go to the repository Settings tab
2. Scroll down to "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

The game will be available at: `https://obieda-hussien.github.io/The_thief/`

## Local Development

For local testing:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000`

## Browser Compatibility

The game works in modern browsers with:
- HTML5 Canvas support
- ES6 JavaScript features
- WebGL for optimal performance