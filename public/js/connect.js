 define(function(require, exports, module){
	var $ = require("jquery"),
		io = require("socket"),
		socket = io.connect(),
		JSON = require("json2"),
		Chat = require("chat"),
		cookie = require("jquery.cookie"),
		Draw = require("draw"),
		Main = require("main");

	var listener = function(){

		var from = $.cookie("nickname"),
			avatorId = $.cookie("avatorId");

		// 1. 消息管理
		// 上线
		socket.emit("online", JSON.stringify({nickname: from, avatorId: avatorId}));

		// successfully connected to the server
		socket.on("connect", function(){
      //change
      debugger;
			console.log("success");
			$(".loader").hide();
			$("#container").fadeIn();
			$(".chat_content_inner").empty();
			$(".logo").css({"left": 0});
		});

		// receive a public message
		socket.on("public message", function(avatorId, name, msg){
			var data = {"userId": userId, "from": name, "msg": msg},
				type = {"item": "normal", "detail": "other"};
			Chat.showMessage(data, type);
		});

		// receve a private message
		socket.on("private message", function(from, avatorId, msg){
			var data = {"userId": userId, "from": from, "msg": msg},
				type = {"item": "normal", "detail": "other"};
			Chat.showMessage(data, type);
		});

		// receive a system message
		socket.on("system message", function(msg, detail){
			var data = {"userId": 1, "from": "system", "msg": msg},
				type = {"item": "notice", "detail": detail};
			Chat.showMessage(data, type);
		});

		// when somebody answers correctly
		socket.on("correct answer", function(name, msg){
			var data = {"userId": 1, "from": name, "msg": msg},
				type = {"item": "notice", "detail": "right"};
			Chat.showMessage(data, type);
			Main.correctAnswer();
		});

		// send message failed
		socket.on("message error", function(to, msg){
			var data = {"userId": userId, "from": "system, "msg": "sending message 【" + to + "】was“" + msg + "”unsucsesfull！"},
				type = {"item": "notice", "detail": "sub"};
			Chat.showMessage(data, type);
		});


		// 2. 绘画
		// 更改画笔类型
		socket.on("graphType", function(graphType){
			Draw.dataChange.typeChange(graphType);
		});

		//  更改绘画数据：color、size
		socket.on("graphData", function(praphData){
			switch(praphData.name){
				case "color":
					Draw.dataChange.colorChange(praphData.value);
					break;
				case "size":
					Draw.dataChange.sizeChange(praphData.value);
					break;
				default:
					break;
			}
		});

		// 更新绘画操作及位置
		socket.on("graphHandle", function(graphHandle){
			var graphHandleType = graphHandle.type,
				clientX = graphHandle.x || 0,
				clientY = graphHandle.y || 0,
				graphHandleData = {
					x: clientX,
					y: clientY
				};

			switch(graphHandleType){
				case "mousedown":
					Draw.drawHandleRecive.mousedown(graphHandleData);
					break;
				 case "mousemove":
					Draw.drawHandleRecive.mousemove(graphHandleData);
					break;
				case "mouseup":
					Draw.drawHandleRecive.mouseup(graphHandleData);
					break;
				case "mouseout":
					Draw.drawHandleRecive.mouseout();
					break;
				default:
					break;
			}

		});

		// 普通操作-命令模式
		socket.on("graphCmd", function(graphCmd){
			switch(graphCmd){
				case "fill":
					// 填充
					Draw.normalHandle.fill();
					break;
				case "cancel":
					// 上一步
					Draw.normalHandle.cancel();
					break;
				case "next":
					// 下一步
					Draw.normalHandle.next();
					break;
				case "clearContext":
					// 参数true，清空画布
					Draw.normalHandle.clearContext(true);
					break;
				default:
					break;
			}
		});


		// 3. Game operations

		// get player data when entering the room
		socket.on("player data", function(data){
			$(".player").find("span").text(data.name).end().find("img").attr("src", "img/user.png" /*"images/avator_"+data.avatorId+".jpg"*/);
			$(".player").fadeIn(200);
		});

		// refresh online list
		socket.on("online list", function(list){
			Chat.showOnline(list);
		});

		//show room
		socket.on("room member", function(list){
			Main.showRoom(list);
		});

		// first game
		socket.on("start game", function(data){
      //call the main module for the method
			Main.startGame(data);
		});

		// show result
		socket.on("show answer", function(data){
			Main.showAnswer(data);
		});

		// start game-not the first iteration
		socket.on("next game", function(data){
			Main.nextGame(data);
		});


		// end the game
		socket.on("end game", function(data){
			Main.endGame(data);
			alert("the game is ended");
		});

	};

	exports.listen = listener;
});
