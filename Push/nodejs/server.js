const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (ws, req) => {
    // 클라이언트 정보 얻기
    const ip = req.socket.remoteAddress, port = req.socket.remotePort;
    console.log(`Client connected. ${ip}:${port}`);

    // 클라이언트에게 메시지를 푸쉬하는 함수
    const sendMessage = (message) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };

    // 클라이언트에게 환영 메시지 푸쉬
    sendMessage({ type: 'welcome', content: 'Welcome to the WebSocket server!' });

    // 주기적으로 메시지를 푸쉬 (예: 5초마다)
    const interval = setInterval(() => {
        const currentTime = new Date().toLocaleString();
        sendMessage({ type: 'update', content: `This is a periodic update at ${currentTime}` });
    }, 5000);

    // 클라이언트로부터 메시지를 받았을 때 처리
    ws.on('message', (message) => {
        console.log('Received from client:', message);
    });

    // 클라이언트 연결 종료 시 처리
    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
