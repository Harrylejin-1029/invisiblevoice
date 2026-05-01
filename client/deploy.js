#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Sign2Viet for web deployment...');

// Clean previous build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
  console.log('✅ Cleaned previous build');
}

// Install dependencies
console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Build the application
console.log('🔨 Building application...');
execSync('npm run build', { stdio: 'inherit' });

// Create .nojekyll file for GitHub Pages
fs.writeFileSync('dist/.nojekyll', '');

// Create 404.html for SPA routing
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
fs.writeFileSync('dist/404.html', indexHtml);

console.log('✅ Build completed successfully!');
console.log('\n📋 Deployment Instructions:');
console.log('1. The built files are in the "dist" folder');
console.log('2. Upload the contents of "dist" to your web server');
console.log('3. For GitHub Pages: Push to gh-pages branch');
console.log('4. For Netlify/Vercel: Connect the repository and deploy');
console.log('\n🌐 The application will work entirely in the browser!');
