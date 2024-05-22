/**
 * 이 프로젝트는 Server-Sent Events(SSE)를 사용하여 주식 시세를 실시간으로 업데이트하는 예제입니다.
 * 주식의 가격은 +- 10% 내외로 랜덤하게 변동되며, 이를 SSE를 통해 클라이언트에게 전송합니다.
 */
const express = require('express');
const app = express();
const port = 3000;

let clients = [];
let stockPrice = 100; // 초기 주식 가격

// 클라이언트 연결을 관리하는 함수
function eventsHandler(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // 클라이언트에 헤더 전송

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
}

// SSE를 통해 주식 가격을 모든 클라이언트에 전송하는 함수
function sendStockPriceToAll() {
    clients.forEach(client =>
        client.res.write(`data: ${JSON.stringify({ price: stockPrice })}\n\n`)
    );
}

// 주식 가격을 랜덤하게 변경하는 함수
function updateStockPrice() {
    const change = (Math.random() * 0.2 - 0.1) * stockPrice; // -10% ~ +10%
    stockPrice = Math.round((stockPrice + change) * 100) / 100; // 소수점 두 자리까지
    sendStockPriceToAll();
}

setInterval(updateStockPrice, 2000); // 2초마다 주식 가격 업데이트

// SSE 엔드포인트
app.get('/events', eventsHandler);

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(port, () => {
    console.log(`SSE stock server running on http://localhost:${port}`);
});
