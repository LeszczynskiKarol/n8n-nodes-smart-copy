// Kopiuje SVG ikon do dist (tsc przenosi tylko .ts).
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "nodes", "SmartCopy", "smartcopy.svg");
const destDir = path.join(__dirname, "..", "dist", "nodes", "SmartCopy");
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, path.join(destDir, "smartcopy.svg"));
console.log("icons copied");
