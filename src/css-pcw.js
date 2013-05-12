#!/usr/bin/env node

var	fs = require('fs'), 
	commander = require('commander'),
	npmPackage = require('../package.json'),
	server = require('./css-pcw-server'),
	jsonPath = '../css-pcw.json';

var writeConfig = function(def,exit){
	if(def){
		config = {'port':'8080', 'url':'http://localhost:8080'};
	}
	fs.writeFile(jsonPath, JSON.stringify(config), function(e){
		if(e) throw err;
		if(exit){
			process.exit();
		}
	});
};

try {
	config = require('./css-pcw.json');
}catch(err){
	writeConfig(true,false);
};

var setupConfig = function(){
	process.stdout.write('\n\n' + '\033[1;33m------ css-pcw ------' + '\n\n');
	process.stdout.write('------- setup -------\033[0m' + '\n');
	process.stdout.write('keep blank for current setting' + '\n');
	process.stdout.write('--help for more info' + '\n\n');
	process.stdout.write('\033[1m\033[33m------- :port -------\033[0m' + '\n');
	process.stdout.write('current = \033[1;32m' + config.port + '\033[0m\n');
	commander.prompt('new port -> ', function(port){
		if(port !== ''){
			config.port = port;
		};
		// url
		process.stdout.write('\n\033[1m\033[33m-------- url --------\033[0m' + '\n');
		process.stdout.write('current = \033[1;32m' + config.url + '\033[0m\n');
		commander.prompt('new port -> ', function(url){
			if(url !== ''){
				config.url = url;
			}
			writeConfig(false,false);
			// process.exit();
			server.start();
		});
	});
};

commander
	.version(npmPackage.version)
	.option('-r, --reset', 'reset to default port/url')
	.parse(process.argv);

commander.on('--help', function(){
});

if(commander.reset){
	writeConfig(true,true);
}else{
	setupConfig();
}

function start(){

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
