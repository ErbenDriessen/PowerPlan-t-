/**
 * Draai dit script één keer voor je Expo en de backend start:
 *   node set-ip.js
 *
 * Het detecteert automatisch je huidige IP en schrijft het naar de app config.
 */
const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const configPath = path.join(__dirname, 'powerplant', 'config.ts');

fs.writeFileSync(configPath, `// Auto-gegenereerd door set-ip.js — niet handmatig aanpassen
export const API_BASE = 'http://${ip}:3000';
`);

console.log(`✅ IP ingesteld op: http://${ip}:3000`);
console.log('Start nu: npm run dev (in /backend) en npx expo start (in /powerplant)');
