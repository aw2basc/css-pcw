exports.setup = function(){

};
exports.compile = function(){

};

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

