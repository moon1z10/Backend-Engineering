const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PORT2 = 3001;
const imagePath = path.join(__dirname, 'images', 'large-image.jpg');

const serverOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.crt'))
};

const http2Server = http2.createSecureServer(serverOptions);
http2Server.on('stream', (stream, headers) => {
    const reqPath = headers[':path'];

    if (reqPath === '/') {
        stream.respondWithFile(path.join(__dirname, 'index2.html'), {
            'content-type': 'text/html; charset=utf-8'
        });
    } else if (reqPath.startsWith('/tile')) {
        handleTileRequest(stream, headers);
    } else {
        stream.respond({
            ':status': 404,
            'content-type': 'text/plain'
        });
        stream.end('Not Found');
    }
});

function handleTileRequest(stream, headers) {
    const url = new URL(headers[':scheme'] + '://' + headers[':authority'] + headers[':path']);
    const params = url.searchParams;
    let x = parseInt(params.get('x'), 10);
    let y = parseInt(params.get('y'), 10);

    sharp(imagePath)
        .metadata()
        .then(metadata => {
            const tileWidth = Math.floor(metadata.width / 5);
            const tileHeight = Math.floor(metadata.height / 5);
            return sharp(imagePath)
                .extract({
                    left: x * tileWidth,
                    top: y * tileHeight,
                    width: tileWidth,
                    height: tileHeight
                })
                .toBuffer();
        })
        .then(data => {
            stream.respond({
                ':status': 200,
                'content-type': 'image/jpeg'
            });
            stream.end(data);
        })
        .catch(err => {
            console.error('Error processing tile:', err);
            stream.respond({
                ':status': 500,
                'content-type': 'text/plain'
            });
            stream.end('Error generating tile');
        });
}

http2Server.listen(PORT2, () => {
    console.log(`HTTP/2 server running on port ${PORT2}`);
});

module.exports = http2Server;
