const http = require("http");
const fs = require("fs");
const path = require("path");


const PORT = 3000;

const publicFolder = path.join(__dirname, "public");


const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json"
};


const server = http.createServer((request, response) => {
    let requestedFile = request.url.split("?")[0];

    if (requestedFile === "/") {
        requestedFile = "/index.html";
    }

    requestedFile = requestedFile.replace(/^\/+/, "");

    const filePath = path.join(
        publicFolder,
        requestedFile
    );

    if (!filePath.startsWith(publicFolder)) {
        response.writeHead(403, {
            "Content-Type": "text/plain"
        });

        response.end("Access denied.");

        return;
    }

    const fileExtension = path.extname(filePath);

    const contentType =
        contentTypes[fileExtension] || "text/plain";

    fs.readFile(filePath, (error, fileContent) => {
        if (error) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });

            response.end("File not found.");

            return;
        }

        response.writeHead(200, {
            "Content-Type": contentType
        });

        response.end(fileContent);
    });
});


server.listen(PORT, () => {
    console.log(
        `Queensland Traffic Analyser running at:`
    );

    console.log(
        `http://localhost:${PORT}`
    );

    console.log(
        "Press Ctrl + C to stop the server."
    );
});