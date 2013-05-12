#!/usr/bin/env node

var	fs = require('fs'), 
	commander = require('commander'),
	npmPackage = require('../package.json'),
	server = require('../src/css-pcw-server'),
	jsonReq = '../css-pcw.json';
	jsonWri = __dirname + '/../css-pcw.json';

var writeConfig = function(def,exit){
	if(def){
		config = {'port':'8080', 'url':'http://localhost:8080'};
	}
	fs.writeFile(jsonWri, JSON.stringify(config), function(e){
		if(e) throw err;
		if(exit){
			process.exit();
		}
	});
};

try {
	config = require(jsonReq);
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
			writeConfig(false,true);
			// server.start();
		});
	});
};

commander
	.version(npmPackage.version)
	.option('-s, --setup', 'setup css-pcw with port/url')
	.option('-r, --reset', 'reset to default port/url')
	.parse(process.argv);

commander.on('--help', function(){
	process.stdout.write('\n\n' + '\033[1;33m------ css-pcw ------' + '\033[0m\n\n');
});

if(commander.reset){
	writeConfig(true,true);
}else if(commander.setup){
	setupConfig();
}else{
	server.start();
}
