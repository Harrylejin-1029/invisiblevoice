# Deploy Sign2Viet Web App

## 🚀 Quick Deployment Guide

### Option 1: Static Hosting (Recommended)

#### Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `client/dist`
   - Node version: 18+

#### Vercel
1. Import project from GitHub
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `client/dist`
   - Install command: `npm install`

#### GitHub Pages
```bash
# Build
npm run build

# Deploy to gh-pages
cd client
git checkout --orphan gh-pages
git --work-tree add dist
git --work-tree commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force
```

### Option 2: Traditional Web Server

1. Build the application:
```bash
npm run build
```

2. Upload contents of `client/dist/` to your web server

3. Configure server to handle SPA routing (nginx example):
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 🔧 Build Configuration

The application is already configured for optimal web deployment:

- **Code splitting**: Dependencies are split into chunks
- **Asset optimization**: Images and fonts are optimized
- **Browser compatibility**: Supports modern browsers
- **Service Worker**: Optional for offline functionality

## 📋 Requirements

- **Node.js** 18+ (for build only)
- **Modern browser** with:
  - WebGL support
  - MediaPipe API support
  - IndexedDB support
  - Camera access

## 🌐 HTTPS Requirement

Camera access requires HTTPS in production. Most hosting providers provide HTTPS automatically.

## 📱 Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

## 🔍 Testing Before Deploy

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build and test locally
npm run build
npm run preview
```

## 📊 Performance Tips

1. **Enable Gzip/Brotli** compression on your server
2. **Set up CDN** for static assets
3. **Use HTTP/2** if available
4. **Enable browser caching** for static assets

## 🚨 Troubleshooting

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

### Runtime Errors
- Check browser console for errors
- Ensure HTTPS is enabled in production
- Verify camera permissions are granted

### Performance Issues
- Check network tab for large assets
- Monitor memory usage in browser dev tools
- Consider lazy loading for heavy components

## 📈 Analytics (Optional)

Add Google Analytics or similar by updating `client/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 Security Notes

- All processing happens client-side
- No server-side data storage
- Camera data never leaves the browser
- Only training data uploads are stored locally

---

**Ready to deploy! 🎉**
