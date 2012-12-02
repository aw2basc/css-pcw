var fs = require('fs'),
	mustache = require('mustache'),
	clientPath = './src/client/',
	clientJS = '',
	newJS = '',
	view = {};
 
exports.build = function(url, callback){
	view['url'] = url;
	setupJS(callback);
};

var setupJS = function(callback){
	getHTML(function(){
		getCSS(function(){
			getJS(function(){
				renderJS(callback);
			});
		});
	});
};

var getHTML = function(callback){
	fs.readFile('LICENSE', 'utf8', function(err,data){
		if (err) console.log(err);
		view['license'] = '/*' + data + '*/';
	});
	fs.readFile(clientPath + 'css-pcw-client.html','utf8',function(err,data) {
		if (err) console.log(err);
		view['html'] = data.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/g, ' ').replace(/<!--[\s\S]*?-->/g,'');
		callback();
	});
};

var getCSS = function(callback){
	fs.readFile(clientPath + 'css-pcw-client.css','utf8',function(err,data) {
		if (err) console.log(err);
		view['css'] = data;
		callback();
	});
};

var getJS = function(callback){
	fs.readFile(clientPath + 'css-pcw-client.js','utf8',function(err,data) {
		if (err) console.log(err);
		// clientJS = data.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/g, ' ');
		clientJS = data;
		callback();
	});
};

var renderJS = function(callback){
	newJS = mustache.render(clientJS,view);
	callback(newJS);
};
