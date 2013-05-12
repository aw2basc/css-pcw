var	express = require('express'),
	http = require('http'),
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	client = require('./css-pcw-build'),
	compile = require('./css-pcw-compile');

exports.start = function(){
	process.stdout.write('\n\033[1m\033[33m------ started ------\033[0m' + '\n\n');
	process.stdout.write('listening: \033[1;32m' + config.port + '\033[0m\n');
	process.stdout.write('url: \033[1;32m' + config.url + '\033[0m\n\n');
	process.stdout.write('\033[1m\033[33m------ css-pcw ------\033[0m' + '\n\n');

	server.listen(parseInt(config.port, 10));

	var setupServer = function(newJS){
		app.get('/css-pcw/', function(req,res){
			res.type('text/javascript');
			res.send(newJS);
		});
	};
	client.build(config.url, setupServer);


	io.sockets.on('connection', function (socket) {
		socket.on('css-pcw-start', function (path, opt) {
			compile.setup(socket, path, opt);
		});
		socket.on('css-pcw-compile', function (path, opt) {
			compile.file(socket, path, opt);
		});
	});
};
