const express = require('express');
const amqp = require('amqplib/callback_api');
const app = express();
const port = 3000;

let clients = [];
let currentLocation = { lat: 37.7749, lng: -122.4194 };

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

        channel.assertQueue(queue, {
            durable: false
        });

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                currentLocation = JSON.parse(msg.content.toString());
                clients.forEach(client => client.res.write(`data: ${JSON.stringify(currentLocation)}\n\n`));
                channel.ack(msg);
            }
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push({ req, res });

    req.on('close', () => {
        clients = clients.filter(client => client.res !== res);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
