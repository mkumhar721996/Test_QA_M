const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");

const CONTENT_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
};

/**
 * Creates a request listener that serves the defect list web app's static
 * files (public/index.html, public/main.js, and the src/ modules it loads
 * directly as plain scripts).
 */
function createApp() {
  return function requestListener(req, res) {
    const url = new URL(req.url, "http://localhost");
    const relativePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const isSrcFile = relativePath.startsWith("/src/");
    const filePath = path.join(ROOT, isSrcFile ? "." : "public", relativePath);

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream" });
      res.end(data);
    });
  };
}

module.exports = { createApp };
