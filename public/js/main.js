



define(function(require, exports, module){
	var $ =require("jquery"),
		io = require("socket"),
		JSON = require("json2"),
		socket = io.connect(),
		//Effect = require("effect"),
		EJS = require("ejs");

	//timer definitions
	var _timer = {
		tipTimer1: null,
		tipTimer2: null,
		sixtyTimer: null,
		toolTimer1: null,
		toolTimer2: null,
		scoreTimer1: null,
		scoreTimer2: null
	}

	// game var defining
	var GameData = {
		start: false,
		word: [],
		drawer: "",
		bindDraw: false
	}


	// start the first game
	function startGame(data){

		$(".room_wrapper").remove();//hide the room

		normalGameStart(data);
	}

	// Game start common operation functions-time 60s, keywords, toolbar, canvas and other unified control
	function normalGameStart(data){
		GameData.start = true;
		GameData.word = data.word;
		GameData.drawer = data.drawer;
			//SHOW CANVAS

		$("canvas").show();		//canvas tag
		timeControl(59);		//one round time control
		if(GameData.drawer != $(".player .name").text()){
			// if the current player is not a drawer
			drawToolShow(false);
			tipControl(GameData.word, false);

		}else{
			// the current player is a painter
			drawToolShow(true);
			tipControl(GameData.word, true);
		}
	}

	// show paint tools
	function drawToolShow(flag){
		$(".draw_tool").css("opacity", "1");
		if(flag){
			// drawer
			$(".draw_controller").fadeIn(200)
			$(".draw_turn").hide();
			GameData.bindDraw = true;
		}else{
			$(".draw_controller").fadeOut(100);
			$(".draw_turn").show();
			GameData.bindDraw = false;
		}
	}

	// keywords and displaying
	function tipControl(word, flag){
		var tip1 = "game keywords：";
		var tip2 = "game tips ：";
		var gameTip = $(".game_tip");
		setTimeout(_timer.tipTimer1);
		setTimeout(_timer.tipTimer2);
		if(flag){
			 tip1 += word[0];
			gameTip.text(tip1);
		}else{
			_timer.tipTimer1 = setTimeout(function(){
				tip2 += word[1];
				gameTip.text(tip2);
				playAudio(2);
			}, 10000);
			_timer.tipTimer2 = setTimeout(function(){
				tip2 += "、" + word[2];
				gameTip.text(tip2);
				playAudio(2);
			}, 20000);
		}
	}

	// 时间60s
	function timeControl(time){
		var countTime = time || 59,
			text = "";
		_timer.sixtyTimer = setInterval(function(){
			if(countTime < 10){
				text = "0" + countTime;
				playAudio(3);
			}else{
				text = "" + countTime;
			}
			$(".game_time").text(text);
			countTime--;

			if(countTime < 0){
				clearInterval(_timer.sixtyTimer);
				console.log("time up");
				countTime = 59;
			}
		}, 1000);
	}

	// 显示游戏结果
	function showAnswer(data){
		Draw.normalHandle.resetCanvas();	// empty canvas
		GameData.bindDraw = false;			// stop drawing
		drawToolShow(false);				// hide painting tools
		clearInterval(_timer.sixtyTimer);
		$(".game_tip").text("game tips ");
		$(".game_time").text("60");

		playAudio(5);
		setTimeout(function(){
			playAudio(6);
		}, 1400);

		console.log(data);
		console.log("tool js ");
		// show results
		var html = new EJS({url: "./views/tool.ejs"}).render({score: data});
		$(".canvas_container").append(html);

		// countown close interface-5sec
		var restTime = 4;
		_timer.toolTimer1 = setInterval(function(){
			$(".canvas_container .result_time_to_close").text("倒计时：" + restTime);
			restTime--;
		}, 1000);
		_timer.toolTimer2 = setTimeout(hideTool, 5000);
	}

	// hide each result manually
	function hideTool(){
		$(".canvas_container .result").remove();
		clearInterval(_timer.toolTimer1);
		clearTimeout(_timer.toolTimer2);
		restTime = 4;
	}

	// start the next game
	function nextGame(data){
		normalGameStart(data);
		playAudio(7);
	}

	// end the game
	function endGame(data){
		clearInterval(_timer.toolTimer1);
		clearTimeout(_timer.toolTimer2);
		clearTimeout(_timer.tipTimer1);
		clearTimeout(_timer.tipTimer2);
		clearInterval(_timer.sixtyTimer);

		playAudio(4);

		console.log(data);
		console.log("score ejs");

		// show scores
		var html = new EJS({url: "./views/score.ejs"}).render({player: data});
		$("body").append(html);

		// coundown close
		var restTime = 4;
		_timer.scoreTimer1 = setInterval(function(){
			$(".score_wrapper .score_time").text("倒计时：" + restTime);
			restTime--;
		}, 1000);
		_timer.scoreTimer2 = setTimeout(function(){
			$(".score_wrapper").remove();
			clearInterval(_timer.scoreTimer1);
			clearTimeout(_timer.scoreTimer2);
			restTime = 4;
		}, 5000);
	}

	// show room information
	function showRoom(list){
		debugger;
		var html = new EJS({url: "./views/room.ejs"}).render({user: list});
		$(".room_wrapper").remove();
		$(".canvas_container").append(html);
		$(".room_wrapper").fadeIn(200);
	}


	// detect all audio supported formats
	function checkAudioCompat(){
        var myAudio = document.createElement('audio');
        var msg = "";
        if (myAudio.canPlayType){
            // CanPlayType returns maybe, probably, or an empty string.
            var playMsg = myAudio.canPlayType('audio/mpeg');
            playMsg = myAudio.canPlayType('audio/ogg; codecs="vorbis"');
            if ("" != playMsg){
                return msg="ogg";
            }
            if ("" != playMsg){
                return msg="mp3";
            }
        }
    }

    // play the audio
    function playAudio(i){
		try{
			// if(i != 3){
				$("body").find(".audio").eq(i).get(0).currentTime=0;
				$("body").find(".audio").eq(i).get(0).play();
			// }else{
				// var timer = 0;
				// $("body").find(".audio").eq(i).get(0).currentTime=0;
				// $("body").find(".audio").eq(i).get(0).play();

				// var Timer = setInterval(function(){
				// 	timer++;
				// 	console.log(timer);
				// 	$("body").find(".audio").eq(i).get(0).currentTime=0;
				// 	$("body").find(".audio").eq(i).get(0).play();
				// 	if(timer == 9){
				// 		clearInterval(Timer);
				// 	}
				// }, 1000);
			// }
		}catch(e){
			console.log(e);
		}
    }

	// 游戏音效
	function audioInit(){
		// 获取格式
		var audio_msg = checkAudioCompat(),
			audio = ["egg", "shoe", "flower", "time", "end", "score", "hand", "giveup", "right"];
		// 0-鸡蛋 1-拖鞋 2-鲜花 3-计时 4-结束 5-结果 6-掌声 7-放弃 8-答对
		var data = {
			type: audio_msg,
			audio: audio
		}
		//var html = new EJS({url: "./views/audio.ejs"}).render({media: data});
		//$("body").append(html);
	}

	function correctAnswer(){
		playAudio(8);
	}

	// event binding
	var eventInit = function(){
		debugger;
		// 点击开始游戏-每一局的入口
		$(".canvas_container").on("click", ".room_game_start", function(){
			socket.emit("start game", function(){
				// 回调函数-人数不足2人
				$(".room_game_start").text("人数不足").css("background", "#E7AB12");
				setTimeout(function(){
					$(".room_game_start").text("开始游戏").css("background", "#6e8a14");
				}, 2000);
			});
		});

		// 退出-右上角图标
		$(".exit").click(function(){
			if(confirm("确定离开房间？")){
				socket.emit("offline");
				$.removeCookie("nickname");
				$.removeCookie("avatorId");
				location.href = "http://127.0.0.1:3000/login";
			}
		});

		// 放弃绘画-手动结束游戏
		$(".give_up").click(function(){
			// socket.emit("next game");
			socket.emit("give up");
			// socket.emit("end once", GameData.drawer, GameData.word[0]);
			socket.emit("system message", $(".name").text()+"放弃绘画！", "focus");
		});


		// 道具点评
		// 0-鸡蛋 1-拖鞋 2-鲜花 3-计时 4-结束 5-结果 6-掌声 7-放弃 8-答对
		$(".canvas_container").on("click", ".result_flower", function(){
			socket.emit("score", {
				type: "flower",
				name: $(".name").text()
			});
		});
		$(".canvas_container").on("click", ".result_egg", function(){
			socket.emit("score", {
				type: "egg",
				name: $(".name").text()
			});
		});
		$(".canvas_container").on("click", ".result_shoe", function(){
			socket.emit("score", {
				type: "shoe",
				name: $(".name").text()
			});
		});

		$(".media li").each(function(i){
			$(this).click(function(){
				console.log(i);
				playAudio(i);
			});
		});
	}

	function test(){
		console.log("tool ejs");
		var html = new EJS({url: "./views/tool.ejs"}).render({score: {num: 1, word: "歪密"}});
		$(".canvas_container").append(html);
	}

	function flower(){
		hideTool();
		new Effect.Flower();
		playAudio(2);
	}

	function egg(){
		hideTool();
		new Effect.Egg();
		playAudio(0);
	}

	function shoe(){
		hideTool();
		new Effect.Shoe();
		playAudio(1);
	}


	var Main = {
		init: function(){
			debugger;
			eventInit();
			// test();
			audioInit();
		},
		startGame: startGame,	// 开始首场游戏
		showAnswer: showAnswer,	// 显示游戏结果
		nextGame: nextGame,		// 自动开始游戏
		endGame: endGame,
		GameData: GameData,
		showRoom: showRoom,
		correctAnswer: correctAnswer,
		flower: flower,
		egg: egg,
		shoe: shoe
	}
	module.exports = Main;
});
