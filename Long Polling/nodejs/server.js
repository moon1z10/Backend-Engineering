const express = require('express');
const app = express();
const port = 3000;

let messages = []; // 메시지를 저장할 배열
let clients = []; // 대기 중인 클라이언트 요청을 저장할 배열

// 클라이언트로부터 메시지를 받을 엔드포인트
app.post('/send', express.json(), (req, res) => {
    const message = req.body.message;
    if (message) {
        messages.push({ message, timestamp: new Date().toISOString() });
        // 대기 중인 클라이언트들에게 메시지 전송
        clients.forEach(client => client.res.json(messages));
        clients = []; // 대기 중인 클라이언트 초기화
        res.status(200).send('Message received and sent to clients');
    } else {
        res.status(400).send('No message provided');
    }
});

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

// 클라이언트가 메시지를 폴링하는 엔드포인트
app.get('/poll', (req, res) => {
    if (messages.length > 0) {
        res.json(messages);
        messages = []; // 메시지를 반환 후 초기화
    } else {
        // 메시지가 없으면 대기 중인 클라이언트에 추가
        clients.push({ req, res });
    }
});

app.listen(port, () => {
    console.log(`Long polling server running on http://localhost:${port}`);
});
