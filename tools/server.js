const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const ROOT = path.resolve(__dirname, "..");

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg"
};

const server = http.createServer((req, res) => {

    let requestPath = req.url.split("?")[0];

    if (requestPath === "/") {
        requestPath = "/src/index.html";
    }

    const filePath = path.resolve(ROOT, "." + requestPath);

    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, data) => {

        if (error) {
            res.writeHead(404);
            res.end("Not found");
            return;
        }

        const extension = path.extname(filePath);
        const contentType = mimeTypes[extension] || "application/octet-stream";

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(data);
    });
});

server.listen(PORT, "127.0.0.1", () => {
    console.log(`HOOPS running at http://127.0.0.1:${PORT}`);
});