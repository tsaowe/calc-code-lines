/**
 * support
 *
 * calc -h
 * calc [src]
 * calc src/index.js
 */
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);

console.log(argv);
