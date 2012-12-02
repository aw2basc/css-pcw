var express = require('express'),
	http = require('http'),
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	config = require('./css-pcw.json'),
	client = require('./src/css-pcw-build'),
	compile = require('./src/css-pcw-compile');

process.stdout.write('\n\n' + '------ css-pcw ------' + '\n\n');
process.stdout.write('listening: ' + config.port + '\n');
process.stdout.write('url: ' + config.url + '\n\n');
process.stdout.write('------ css-pcw ------' + '\n\n');

server.listen(parseInt(config.port, 10));

var setupServer = function(newJS){
	app.get('/css-pcw/', function(req,res){
		res.type('text/javascript');
		res.send(newJS);
	});
};
client.build(config.url, setupServer);


io.sockets.on('connection', function (socket) {
	socket.on('css-pcw-start', function (path) {
		compile.setup(socket, path);
	});
	socket.on('css-pcw-compile', function (path) {
		compile.file(socket, path);
	});
});

