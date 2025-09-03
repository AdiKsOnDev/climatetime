// Simple compilation test
console.log('Testing basic imports...');

try {
  // Test basic React import
  const React = require('react');
  console.log('✅ React import successful');
  
  // Test Chart.js import
  const Chart = require('chart.js');
  console.log('✅ Chart.js import successful');
  
  // Test Lucide React import
  const LucideReact = require('lucide-react');
  console.log('✅ Lucide React import successful');
  
  console.log('🎉 All basic imports successful!');
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  process.exit(1);
}