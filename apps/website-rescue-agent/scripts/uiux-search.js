#!/usr/bin/env node
/**
 * UI UX Pro Max Search Wrapper
 * 
 * Wrapper um die Python-Scripts für Node.js/npm Nutzung.
 * 
 * Usage:
 *   npm run uiux:search -- "luxury brand" --domain color
 *   npm run uiux:style -- "glassmorphism"
 *   npm run uiux:colors -- "spa wellness"
 *   npm run uiux:fonts -- "elegant serif"
 *   npm run uiux:design -- "beauty spa" -p "Serenity Spa"
 */

const { spawn } = require('child_process');
const path = require('path');

const PYTHON_SCRIPT = path.join(__dirname, '../src/ui-ux-pro-max/scripts/search.py');

// Alle Argumente nach dem Skript-Namen weitergeben
const args = process.argv.slice(2);

console.log('🔍 UI UX Pro Max Search');
console.log('───────────────────────');

const pythonProcess = spawn('python', [PYTHON_SCRIPT, ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

pythonProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Process exited with code ${code}`);
    console.error('Make sure Python 3 is installed and the CSV files exist in src/ui-ux-pro-max/data/');
    process.exit(code);
  }
});
