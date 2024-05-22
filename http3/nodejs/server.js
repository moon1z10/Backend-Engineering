const express = require('express');
const axios = require('axios');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();
const PORT = 3000;

// HTTP/1.1 서버 설정
const http1Agent = new http.Agent({
    keepAlive: true,
    maxSockets: 1,
});

// HTTP/3 서버 설정 (이 예제에서는 클라우드플레어를 사용하여 HTTP/3를 테스트합니다)
const http3Agent = new https.Agent({
    keepAlive: true,
    maxSockets: 1,
    rejectUnauthorized: false,
});

app.get('/', (_, res) => { res.sendFile(`${__dirname}/index.html`); });

// HTTP/1.1
app.get('/http1', async (req, res) => {
    try {
        const start = Date.now();
        const response = await axios.get('http://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.js', {
            responseType: 'arraybuffer',
            httpAgent: http1Agent,
            headers: {
                'Cache-Control': 'no-store'
            }
        });
        const end = Date.now();
        res.send(`HTTP/1.1 - Time taken: ${end - start} ms`);
    } catch (error) {
        res.status(500).send('Error fetching image with HTTP/1.1');
    }
});

// HTTP/3
app.get('/http3', async (req, res) => {
    try {
        const start = Date.now();
        const response = await axios.get('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.0/jquery.js', {
            responseType: 'arraybuffer',
            httpsAgent: http3Agent,
            headers: {
                'Cache-Control': 'no-store'
            }
        });
        const end = Date.now();
        res.send(`HTTP/3 - Time taken: ${end - start} ms`);
    } catch (error) {
        res.status(500).send('Error fetching image with HTTP/3');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
