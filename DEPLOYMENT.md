# GitHub Pages Deployment

This repository is configured for GitHub Pages hosting. The Resource Runners AI Evolution Simulation can be accessed directly through GitHub Pages once enabled.

## Automatic Deployment

The game is deployed automatically from the main branch using GitHub Actions. All necessary files are included:

- `index.html` - Main entry point with optimized meta tags
- `*.js` - Game logic and AI components  
- `style.css` - Styling
- `matter.min.js` - Physics engine
- `favicon.svg` - Site icon
- `robots.txt` - SEO optimization
- `sitemap.xml` - Search engine sitemap
- `.nojekyll` - Ensures all files are served correctly
- `README.md` - Documentation

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Automatically triggers on pushes to the main branch
2. Builds and deploys the site to GitHub Pages
3. Handles permissions and deployment configurations
4. Provides the live URL once deployed

## Enabling GitHub Pages

To enable GitHub Pages hosting for this repository:

### Method 1: Automatic (Recommended)
1. Push code to the main branch
2. The GitHub Actions workflow will automatically deploy
3. Check the Actions tab to monitor deployment progress
4. Once complete, the site will be available at: `https://obieda-hussien.github.io/The_thief/`

### Method 2: Manual
1. Go to the repository Settings tab
2. Scroll down to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The workflow will handle the rest automatically

## Local Development

For local testing:
```bash
# Clone the repository
git clone https://github.com/obieda-hussien/The_thief.git
cd The_thief

# Start local server
python3 -m http.server 8000
# or use npm script:
npm run serve
```
Then visit `http://localhost:8000`

## Browser Compatibility

The game works in modern browsers with:
- HTML5 Canvas support
- ES6 JavaScript features
- WebGL for optimal performance

## SEO Features

The deployment includes:
- Optimized meta tags for search engines
- Open Graph tags for social media sharing
- Twitter Card support
- Structured sitemap.xml
- Robots.txt for crawler guidance

## Performance Optimizations

- Resource preloading for critical assets
- Optimized asset loading order
- Compressed and minified Matter.js physics engine
- Efficient CSS and JavaScript structure