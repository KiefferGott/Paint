var http    = require('http');
var url     = require('url');
var fs      = require('fs');

var server = http.createServer(function(req, res) {
    var page = url.parse(req.url).pathname;
    if (page === '/') {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(fs.readFileSync('views/index.html'));
        res.end();
    }
    else if (/\/public\//.test(page)) {
        try {
            res.write(fs.readFileSync('.' + page));
            res.end();
        } catch(e) {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write('Bonsoir.');
            res.end();
            console.log(e);
        }
    }
});

var io        = require('socket.io').listen(server);
var room      = {};
var roomData  = {};
var roomPassword = {};
var roomCount = 0;
io.sockets.on('connection', function (socket) {

    socket.emit('room', room);

    socket.on('askRoomList', function (data) {
        socket.emit('room', room);
    });
    socket.on('newRoom', function (data) {
        var roomID = roomCount++;
        room[roomID] = {name: data.name};
        roomData[roomID] = {data: null, image: null};
        if (data.password) {
            roomPassword[roomID] = {password: data.password};
        }
    });
    socket.on('roomClientIn', function (data) {
        socket.join(data.room);
        socket.room = data.room;
        socket.emit('roomData', roomData[data.room]);
        socket.on('draw', function (data) {
            socket.broadcast.to(socket.room).emit('brushed', data);
        }).on('rect', function (data) {
            socket.broadcast.to(socket.room).emit('rekt', data);
        }).on('circle', function (data) {
            socket.broadcast.to(socket.room).emit('circled', data);
        }).on('erase', function (data) {
            socket.broadcast.to(socket.room).emit('erased', data);
        }).on('image', function (data) {
            roomData[socket.room].image = data;
            socket.broadcast.to(socket.room).emit('imageData', data);
        }).on('deleteImage', function (data) {
            roomData[socket.room].image = null;
            socket.broadcast.to(socket.room).emit('imageDeleted');
        });
    });
    socket.on('roomClientOut', function (data) {
        socket.leave(socket.room);
        socket.room = null;
    });
    socket.on('roomClientData', function (data) {
        roomData[socket.room].data = data;
    });

    socket.on('requestAccess', function (roomID) {
        socket.emit('passwordRequested', (roomID in roomPassword) ? true : false);
        socket.on('passwordAnswer', function (data) {
            if (roomPassword[roomID].password === data) {
                socket.emit('accessGranted');
            }
            else {
                socket.emit('accessDenied', 'Mot de passe incorrect');
            }
        });
    });

    socket.on('disconnect', function() {
        if (socket.room) {
            socket.leave(socket.room);
            socket.room = null;
        }
    });
});

server.listen(8080);

/*var ws = require('websocket').server;
wss = new WebSocketServer({httpServer: server});
var count = 0;
var clients = {};

wss.on('request', function (req) {
    var connection = req.accept('echo-protocol', req.origin);
    var id = count++;
    clients[id] = connection;
});*/