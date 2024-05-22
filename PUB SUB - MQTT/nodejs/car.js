const amqp = require('amqplib/callback_api');

const amqpUrl = 'amqps://<your-cloudamqp-url>'; // Replace to your cloudamqp url

amqp.connect(amqpUrl, (err, connection) => {
    if (err) {
        throw err;
    }
    connection.createChannel((err, channel) => {
        if (err) {
            throw err;
        }

        const queue = 'car_location';

        setInterval(() => {
            const location = {
                lat: 37.7749 + (Math.random() - 0.5) * 0.01, // 샌프란시스코 근처 임의의 위치
                lng: -122.4194 + (Math.random() - 0.5) * 0.01
            };
            const msg = JSON.stringify(location);

            channel.assertQueue(queue, {
                durable: false
            });

            channel.sendToQueue(queue, Buffer.from(msg));
            console.log('Location sent:', location);
        }, 5000); // 5초마다 위치 전송
    });
});