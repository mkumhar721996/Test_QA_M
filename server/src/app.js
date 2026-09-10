const { defectsSeed } = require("./data/defects.seed");
const { handleGetDefects } = require("./routes/defects");

/**
 * Creates the request listener for the defects API.
 * @returns {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => void}
 */
function createApp() {
  return function requestListener(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/api/defects") {
      const defects = handleGetDefects(defectsSeed, url.searchParams);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(defects));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  };
}

module.exports = { createApp };
