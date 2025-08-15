#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getBackendPort() {
  try {
    const configPath = path.join(__dirname, '..', 'backend', 'config.env');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const portMatch = configContent.match(/PORT=(\d+)/);
      if (portMatch) {
        return parseInt(portMatch[1]);
      }
    }
  } catch (error) {
    console.error('❌ Error reading backend config:', error.message);
  }
  
  // Default port
  return 5000;
}

// Main execution
if (require.main === module) {
  const port = process.argv[2] || getBackendPort();
  updateEnvFile(port);
}

module.exports = { updateEnvFile, getBackendPort }; 