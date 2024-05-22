/**
 * 이 짧은 예제는 메시지를 특정 클라이언트가 독점할 수 있다는 문제점이 있습니다.
 * 클라이언트가 메시지를 독점하지 않도록 방지하기 위한 다양한 방법들이 있습니다.
 * 이 문제를 해결하기 위한 몇 가지 접근 방법을 설명해드리겠습니다.
1. 라운드 로빈 방식
라운드 로빈 방식은 각 클라이언트가 순차적으로 메시지를 받을 수 있도록 하는 방법입니다. 서버는 각 클라이언트를 식별하고, 클라이언트 리스트를 유지합니다. 메시지가 도착할 때마다 다음 순번의 클라이언트에게 메시지를 전달합니다.

2. 브로드캐스트 방식
브로드캐스트 방식은 모든 클라이언트에게 동일한 메시지를 전송하는 방법입니다. 모든 클라이언트가 동일한 메시지를 받을 수 있기 때문에 특정 클라이언트가 메시지를 독점하는 문제를 방지할 수 있습니다.

3. 메시지 큐 분배
메시지 큐를 각 클라이언트별로 분리하는 방식입니다. 각 클라이언트에게 고유한 큐를 할당하여, 각 클라이언트가 자신의 큐에서만 메시지를 읽도록 합니다. 이를 통해 각 클라이언트가 공정하게 메시지를 받을 수 있습니다.

4. 공정 큐잉 (Fair Queuing)
공정 큐잉은 메시지를 각 클라이언트에게 공정하게 분배하는 알고리즘을 사용합니다. 서버는 메시지를 수신한 클라이언트의 상태를 기록하고, 각 클라이언트가 일정한 비율로 메시지를 받을 수 있도록 조절합니다.

5. 메시지 레디스 분산 (Redis Pub/Sub)
Redis의 Pub/Sub 기능을 사용하여 메시지를 분산하는 방법입니다. 각 클라이언트는 특정 채널을 구독하고, 서버는 메시지를 해당 채널에 게시합니다. 클라이언트는 자신의 구독 채널에서 메시지를 받아볼 수 있습니다.

6. WebSocket 사용
WebSocket을 사용하여 서버와 클라이언트 간의 실시간 통신을 구현합니다. 서버는 모든 클라이언트와 지속적인 연결을 유지하고, 새로운 메시지가 도착할 때마다 모든 클라이언트에게 메시지를 전송할 수 있습니다.

7. 세션 기반 큐
각 클라이언트가 서버에 접속할 때 세션을 생성하고, 세션별로 메시지 큐를 유지하는 방법입니다. 클라이언트가 메시지를 요청할 때 해당 세션의 메시지 큐에서 메시지를 제공합니다. 이를 통해 각 클라이언트가 고유한 메시지 큐를 가질 수 있습니다.
 */
const express = require('express');
const app = express();
const port = 3000;

let messages = []; // 메시지를 저장할 배열

// 클라이언트로부터 메시지를 받을 엔드포인트
app.post('/send', express.json(), (req, res) => {
    const message = req.body.message;
    console.log(`/send called ${req.socket.remoteAddress}:${req.socket.remotePort}, msg: ${message}`);
    
    if (message) {
        messages.push({ message, timestamp: new Date().toISOString() });
        res.status(200).send(`Server received a message(${message})`);
    } else {
        res.status(400).send('No message provided');
    }
});

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

// 클라이언트가 메시지를 폴링하는 엔드포인트
app.get('/poll', (req, res) => {
    // console.log(`/poll called ${req.socket.remoteAddress}:${req.socket.remotePort}`);

    if (messages.length > 0) {
        res.json(messages);
        messages = []; // 메시지를 반환 후 초기화
    } else {
        res.json([]);
    }
});

app.listen(port, () => {
    console.log(`Short polling server running on http://localhost:${port}`);
});
