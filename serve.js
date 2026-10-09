/**
 * Lightweight HTTP server with CORS for Nuvio local plugin development.
 * Run with: node serve.js [port]
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.env.PORT || process.argv[2] || "8080", 10);
const DIR = __dirname;

const MIME_TYPES = {
  ".json": "application/json; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  // Add CORS headers for Nuvio
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = decodeURI(req.url.split("?")[0]);
  if (reqPath === "/") reqPath = "/manifest.json";

  const filePath = path.join(DIR, reqPath);

  // Security check
  if (!filePath.startsWith(DIR)) {
    res.writeHead(403);
    res.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found: " + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": mime,
      "Content-Length": stats.size
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Nuvio Eklenti Sunucusu Başlatıldı!`);
  console.log(`📡 Manifest URL: http://localhost:${PORT}/manifest.json`);
  console.log(`📲 Nuvio'ya eklenecek bağlantı: http://<CIHAZ_IP_ADRESINIZ>:${PORT}/manifest.json`);
  console.log(`Durdurmak için Ctrl+C tuşlayabilirsiniz.\n`);
});
