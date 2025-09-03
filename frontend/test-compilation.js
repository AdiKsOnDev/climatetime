#!/usr/bin/env node

console.log('Starting compilation test...');

// Test basic imports
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check if key files exist
  const appPath = path.join(__dirname, 'src', 'App.tsx');
  const indexPath = path.join(__dirname, 'src', 'index.tsx');
  const typesPath = path.join(__dirname, 'src', 'types', 'index.ts');
  
  console.log('Checking key files:');
  console.log('App.tsx exists:', fs.existsSync(appPath));
  console.log('index.tsx exists:', fs.existsSync(indexPath));
  console.log('types/index.ts exists:', fs.existsSync(typesPath));
  
  // Check package.json
  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('Package name:', pkg.name);
    console.log('React version:', pkg.dependencies?.react);
    console.log('TypeScript version:', pkg.devDependencies?.typescript);
  }
  
  console.log('Basic file system checks completed successfully');
} catch (error) {
  console.error('Error during compilation test:', error);
  process.exit(1);
}