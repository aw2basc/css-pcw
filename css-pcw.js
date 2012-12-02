var express = require('express'),
	http = require('http'),
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	fs = require('fs'),
	less = require('less'),
	spawn = require('child_process').spawn,
	config = require('./css-pcw.json'),
	client = require('./src/css-pcw-build');
	// mustache = require('mustache');
	// jsp = require('uglify-js').parser,
	// pro = require('uglify-js').uglify;

server.listen(8080);

// console.log
process.stdout.write('\n' + '------LESS COMPILER------' + '\n\n');
process.stdout.write(config.url + '\n\n');
process.stdout.write('path: ' + config.rootPath + '\n');
process.stdout.write('extraPath: ' + config.extraPath + '\n');
process.stdout.write('fileName: ' + config.fileName + config.fileType + '\n');

var setupServer = function(newJS){
	app.get('/css-pcw/', function(req,res){
		res.type('text/javascript');
		res.send(newJS);
	});
};
client.build(config.url, setupServer);


io.sockets.on('connection', function (socket) {
	socket.on('css-pcw-start', function (path) {
		lessCompiler(socket, path);
	});
	socket.on('css-pcw-compile', function (path) {
		compileFile(socket, path);
	});
});

var lessCompiler = function(socket, path){
	console.log('path: ' + path);
	try {
		fs.exists(path, function(exists){
			if(exists){
				if(path.substr(-5) == '.less'){
					fs.watchFile(path, { persistent:true, interval:500 }, function(c,p){
						if(p.mtime < c.mtime){
							compileFile(socket, path);
						};
					});
					compileFile(socket, path);
				}else{
					compErr(socket, 'not less file');
				}
			}else{
				compErr(socket, 'file does not exist');
			}
		});
	}catch(err){
		compErr(socket, err);
	};
	socket.on('disconnect',function(){
		fs.unwatchFile(path);
	});
};

var compErr = function(socket, err){
	console.log("COMP ERR: " + err);
	socket.emit('css-pcw-err', err);
};

var compileFile = function(socket, path){
	var cssFile = path.substring(0,path.length - 4) + 'css',
		logCount = 0,
		logObj = {},
		errCount = 0;
		lessc = spawn('lessc', ['--no-color', '--yui-compress', path, cssFile]);
	lessc.stderr.setEncoding('utf8');
	lessc.stderr.on('data', function(data){
		if(errCount === 0){
			logObj.error = data;
		}else{
			logObj.lines = data;
		}
		errCount += 1;
		console.log("err: " + data);
	});
	lessc.stdout.on('data', function(data){
		console.log("data: " + data);
		logObj.out = data;
	});
	lessc.stdout.on('end', function(data){
		console.log("end: " + data);
		results(socket, logObj);
	});
};

var results = function(socket, logObj){
	if(logObj.hasOwnProperty('error')){
		if(logObj.lines){
			socket.emit('css-pcw-compile-error', logObj);
		}else{
			var addBr = logObj.error.replace(/\n/g, "<br/>");
			logObj.error = addBr.replace(/\t/g, "&#160;");
			socket.emit('css-pcw-compile-error', logObj);
			console.log(logObj);
		}
		// console.log(logObj.error);
	}else{
		socket.emit('css-pcw-compile');
	}
};
