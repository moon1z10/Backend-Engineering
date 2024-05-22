const express = require('express');
const http = require('http');
const path = require('path');
const sharp = require('sharp');

const PORT = 3000;
const imagePath = path.join(__dirname, 'images', 'large-image.jpg');

// HTTP/1.1 서버
const http1 = express();
http1.get('/', (req, res) => { res.sendFile(`${__dirname}/index.html`); });
http1.get('/tile', async (req, res) => {
    // console.log(`req : ${req.url}`);
    let { x, y } = req.query;
    x = parseInt(req.query.x, 10);
    y = parseInt(req.query.y, 10);

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
            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': data.length
            });
            res.end(data);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error generating tile');
        });
});

const server = http.createServer(http1);
server.listen(PORT, () => {
    console.log(`HTTP/1.1 server running on port ${PORT}`);
});

module.exports = server;
