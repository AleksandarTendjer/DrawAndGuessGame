/*
 * @ 客户端入口文件
 * @ Aleksandar Tendjer
 * @ 4/1/2020
 * */
define(function(require, exports, module){
	var $ = require("jquery"),
		Connect = require("connect");
		// Effect = require("effect"),
		Main = require("main"),
		EJS = require("ejs");
		//first we will use the connect module to listen to what the socket sends
	exports.init = function(){

		Connect.listen();
		//after that we initialize the main module
		Main.init();
		debugger;
		// Effect.init();
	}

});
