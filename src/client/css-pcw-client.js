/* ----- css-pcw ----- */
{{{license}}}

;(function(){
var client = function($){
$(function(){
({
	load:function(script,callback){
		$.ajax({ async:false, type:'GET', url:script, data:null, success:callback, dataType:'script' });
	},
	init : function(){
		this.html = '{{{html}}}',
		this.css = '<style>{{{css}}}</style>';
		this.clientHead = $('head');
		this.googleFonts = '<link href="http://fonts.googleapis.com/css?family=Ubuntu+Mono" rel="stylesheet" type="text/css"/>';
		this.clientHead.append(this.googleFonts);
		this.clientHead.append(this.css);
		this.clientID = $('#css-pcw');
		this.clientID.html(this.html);
		// storage
		this.curSite = (window.SITE_FOLDER_NAME) ? window.SITE_FOLDER_NAME : (window.location.protocol + "//" + window.location.host + "/" + window.location.pathname);
		this.minify = "--yui-compress";
		this.disabled = false;
		this.storage.par = this;
		this.storage.get();
		// setup
		this.setup(this);
	},
	storage : {
		get : function(){
			if(localStorage){
				var sRet = localStorage.getItem('css-pcw'),
					par = this.par,
					radB = $('.css-pcw-radio'),
					chB = $('.css-pcw-disable');
				if(sRet != null){
					par.localSettings = JSON.parse(sRet);
					var storLen = par.localSettings.site.length,
						i;
					for(i=0;i<storLen;i++){
						if(par.localSettings.site[i] == par.curSite){
							var rad = $('.css-pcw-radio[value="' + par.localSettings.minify[i] + '"]');
							rad.prop('checked',true);
							chB.attr('checked',par.localSettings.disable[i]);
							par.minify = par.localSettings.minify[i];
							par.disabled = par.localSettings.disable[i];
						}
					}
				}else{
					par.localSettings = {site:[par.curSite],minify:[par.minify],disable:[par.disabled]};
					$('.css-pcw-radio[value="--yui-compress"]').prop('checked',true);
					chB.attr('checked',false);
					this.set();
				}
				radB.on('change',function(e){par.storage.set();});
				chB.on('change',function(e){par.storage.set();});
			}
		},
		set : function(){
			if(localStorage){
				var par = this.par;
				var storAdd = function(){
					var minify = $('.css-pcw-radio:checked').val(),
						disable = ($('.css-pcw-disable').attr('checked') === undefined) ? false : true,
						storLen = par.localSettings.site.length,
						i;
					for(i=0;i<storLen;i++){
						if(par.localSettings.site[i] == par.curSite){
							par.localSettings.minify[i] = minify;
							par.localSettings.disable[i] = disable;
							par.minify = minify;
							par.disabled = disable;
						}else if(i+1 == storLen){
							par.localSettings.site.push(par.curSite);
							storAdd();
						}
					}
				};
				storAdd();
				localStorage.setItem('css-pcw', JSON.stringify(par.localSettings));
			}
		}
	},
	setup : function(par){
		this.compileMessage = $(".css-pcw-message-compile");
		this.compileTimer = $(".css-pcw-message-timer");
		this.compileMultiplier = $(".css-pcw-message-multiplier");
		this.compileCount = 0;
		this.sI=0;
		this.errorMessage = $(".css-pcw-message-error");
		this.errorText = $(".css-pcw-message-error-text");
		this.compileContainer = $(".css-pcw-output-container");
		this.compileLog = $(".css-pcw-output-log");
		this.buttonPop = $(".css-pcw-button-pop");
		this.buttonError = $(".css-pcw-button-error");
		this.buttonCompile = $(".css-pcw-button-compile");
		this.buttonRefresh = $(".css-pcw-button-refresh");
		this.buttonOptions = $(".css-pcw-button-options");
		this.buttonSubmit = $(".css-pcw-button-submit");
		this.buttonInput = $(".css-pcw-input");
		this.optionsContainer = $(".css-pcw-options-container");
		this.load('{{{url}}}/socket.io/socket.io.js',function() {
			par.socket = io.connect('{{{url}}}');
			par.socketEvents(par);
		});
	},
	socketEvents : function(par){
		$('script').each(function(){
			var lessPath = $(this).attr('data-css-pcw');
			if(lessPath){
				par.buttonRefresh.show();
				par.buttonPop.show();
				par.lessPath = lessPath;
				par.startWatch();
			}
		});
		this.socket.on("css-pcw-compile", function(){par.lessCompiled();});
		this.socket.on("css-pcw-compile-error", function(data){par.lessError(data);});
		this.socket.on("css-pcw-err", function(data){par.genError(data);});
		this.buttonEvents(this);
	},
	startWatch : function(){
		this.buttonRefresh.show();
		this.buttonPop.show();
		if(!this.disabled) this.socket.emit("css-pcw-start", this.lessPath, this.minify);
	},
	buttonEvents : function(par){
		this.buttonPop.on("click",function(e){
			e.preventDefault();
			var winWid = 'width=' + par.compileContainer.width() + ',';
			var winHeight = 'height=' + par.compileContainer.height() + ',';
			var winOpt = winWid + winHeight + 'toolbar=no,titlebar=no,location=no,menubar=no,status=no';
			var newWin = window.open("","css-pcw",winOpt);
			var popUpHead = $(newWin.document.head);
			popUpHead.append(par.googleFonts);
			popUpHead.append(par.css);
			var popUpBody = $(newWin.document.body);
			popUpBody.css({margin:0,padding:0});
			popUpBody.html('<div class="css-pcw-output-container" style="display:block"><div class="css-pcw-output-log"></div></div>');
			par.popUp = popUpBody.find('.css-pcw-output-log');
			par.popUp.html(par.compileLog.html());
		});
		this.buttonError.on("click",function(e){
			e.preventDefault();
			par.compileContainer.toggle();
		});
		this.buttonCompile.on("click",function(e){
			e.preventDefault();
			par.compileContainer.toggle();
		});
		this.compileMessage.on("click",function(e){
			e.preventDefault();
			par.compileContainer.toggle();
		});
		this.errorMessage.on("click",function(e){
			e.preventDefault();
			par.compileContainer.toggle();
		});
		this.buttonRefresh.on("click",function(e){
			e.preventDefault();
			if(!par.disabled) par.socket.emit("css-pcw-compile", par.lessPath, par.minify);
		});
		this.buttonOptions.on("click",function(e){
			e.preventDefault();
			par.optionsContainer.toggle();
		});
		this.buttonSubmit.on('click',function(e){
			e.preventDefault();
			par.lessPath = par.buttonInput.val();
			par.startWatch();
			par.buttonOptions.trigger('click');
		});
	},
	lessCompiled : function(){
		this.buttonRefresh.show();
		this.buttonPop.show();
		this.compileMessage.show();
		this.errorMessage.hide();
		this.buttonCompile.show();
		this.buttonError.hide();
		this.compileLog.empty();
		this.timer();
		this.compileCount++;
		this.compileMultiplier.html(this.compileCount + "x");
		this.compileLog.append('compiled ' + this.lessPath);
		this.compileLog.append(' ' + this.compileCount + "x");
		this.add2PopUp();
	},
	lessError : function(data){
		var	errLineRegex = /on line ([0-9]+) in/gi,
			errLine = errLineRegex.exec(data.error),
			errLineNum = (errLine) ? 'error on line ' + errLine[1] : 'parse error';
		this.buttonRefresh.show();
		this.buttonPop.show();
		this.compileMessage.hide();
		this.errorMessage.show();
		this.buttonCompile.hide();
		this.buttonError.show();
		this.errorText.html(errLineNum);
		this.compileLog.empty();
		this.compileLog.append(data.error);
		this.add2PopUp();
	},
	genError : function(data){
		this.compileMessage.hide();
		this.errorMessage.show();
		this.buttonCompile.hide();
		this.buttonError.show();
		this.errorText.html(data);
		this.compileLog.empty();
		this.compileLog.html(data);
		this.add2PopUp();
	},
	timer : function(){
		var i = 0,
			par = this;
		clearInterval(this.sI);
		this.sI = setInterval(function(){
			i++;
			var h = Math.floor(i / 3600);
			var m = Math.floor(i % 3600 / 60);
			var s = Math.floor(i % 3600 % 60);
			var t = ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "00:") + (s < 10 ? "0" : "") + s);
			par.compileTimer.html(t);
		},1000);
	},
	add2PopUp : function(){
		if(this.hasOwnProperty('popUp')) this.popUp.html(this.compileLog.html());
	},
	htmlEncode : function(value){
		if(value) return $("<div />").text(value).html();
		else return "";
	}
}).init();
});
};

(function(window, document, version, callback) {
    var j = window.jQuery,
		d = '',
		loaded = false;
    if (typeof j === 'undefined' || version > j.fn.jquery) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js";
        script.onload = script.onreadystatechange = function() {
            if (!loaded && (!(d = this.readyState) || d === "loaded" || d === "complete")) {
				loaded = true;
                callback((j = window.jQuery).noConflict(1));
                j(script).remove();
            }
        };
        document.documentElement.childNodes[0].appendChild(script);
    }else{
		client(jQuery);
	}
})(window, document, "1.8.3", function($) {
	client($);
});

}());
