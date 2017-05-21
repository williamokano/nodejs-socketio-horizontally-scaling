const app   = require('express')();
const http  = require('http').Server(app);
const io    = require('socket.io')(http);
const redis = require('redis');
const path  = require('path');

const pub = redis.createClient('6379', 'redis');
const sub = redis.createClient('6379', 'redis');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

let connectedSockets = {};
let id = 0;

sub.subscribe('global');

sub.on('message', (channel, msg) => {
    io.emit('chat message', msg);
});

io.on('connection', socket => {
    socket.id = id++;
    connectedSockets[socket.id] = socket;

    console.log(`User connected with id ${socket.id}`);

    socket.on('chat message', msg => {
        pub.publish('global', msg);
    });

    socket.on('disconnected', () => {
        delete connectedSockets[socket.id];
        console.log(`User ${socket.id} disconnected`);
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
