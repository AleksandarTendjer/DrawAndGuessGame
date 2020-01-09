define(function(require, exports, module){
	var $ = require("jquery"),
		io = require("socket"),
		socket = io.connect(),
        cookie = require("jquery.cookie"),
		scrollBar = require("scrollbar"),
        Main = require("main"),
        EJS = require("ejs");

	var sendBtn = $(".chat_btn"),				// send message button
        avatorId = $.cookie("avatorId") || 1,							// id of the user
        msgTxt = $(".message_input");			// text of the message to send

	// format message
    var _formatHTML = function(html){
        return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // date formatting
    var _timeFormat = function(time){
			//if its less than 9 add "0" before the number
		return time <= 9 ? "0"+time : time;
	}

	// display chat information
	var showMessage = function(data, type){
		// data={avatorId: , from: , msg: }
		// type={item: , detail: }
		// var from = from ? _formatHTML(data.from) : ",
		var	msg = data.from != "system" ? _formatHTML(data.msg) : data.msg,
			date = new Date(),
			dateH = _timeFormat(date.getHours()),
			dateM = _timeFormat(date.getMinutes()),
			dateS = _timeFormat(date.getSeconds()),
			time = dateH + ":" + dateM + ":" + dateS,
			msgTpl;


		// type = !type.item ? " : "type_" + type.detail;
		var from = type.detail==="private" ? data.from+"[private chat ]" : data.from;

        var Msg = {
            detail: type.detail,
            avatorId: data.avatorId,
            from: from,
            time: time,
            msg: msg
        }

		if(type.item == "normal"){
			// normal chat
			msgTpl = new EJS({url: "./views/message.ejs"}).render({data: Msg, type: "normal"});
		}else{
			// private
			msgTpl = new EJS({url: "./views/message.ejs"}).render({data: Msg, type: "private"});
		}

        // correct answer
        if(from != "system" && type.detail!="private"){
            socket.emit("score", {
                type: "answer",
                name: from
            });
        }

		$(".chat_content_inner").append(msgTpl);


	//	scrollBar.changeScroll();
	}



    // send event
    sendBtn.on("click", function() {
        sendMsg();
    });




    // send chat to server
    function sendMsg(){
        var msg = msgTxt.val();

      	// empty content
        if($.trim(msg) == ""){
            msgTxt.val("").stop(false, true)
                .css("background","#f5cfcf")
                .animate({opacity: 0.3}, 300, function(){
                    msgTxt.css("background","#ffffff").css("opacity", "1");
            });
            msgTxt.focus();
            return false;
        }

        //private message or group
    	if (msg.substr(0, 1) == "@") {
    		// private message if it starts with the @
    		var space = msg.indexOf(" ");
    		if (space > 0) {
    			// send private message
    			var to = msg.substr(1, space-1);
    			msg = msg.substr(space + 1);
					//emit a private message 
    			socket.emit("private message", to, avatorId, msg, function(ok){
    				// callback
    				if (ok) {
    					// Send a private message successfully, then show your own speech
    					var data = {"avatorId": avatorId, "from": $(".name").text()+"[Correct\""+to+"\"private messae]", "msg": msg},
    						type = {"item": "normal", "detail": "private"};
    					showMessage(data, type);
    				}
    			});
    		}
    	}else{
    		// send public message
    		socket.emit("public message", avatorId, $(".name").text(), msg, function(ok){
    			if (ok){
    				var data = {"avatorId": avatorId, "from": $(".name").text(), "msg": msg},
    					type = {"item": "normal", "detail": "me"};
    				showMessage(data, type);
    			}
    		});
    	}

    	msgTxt.val("");
        msgTxt.focus();
    }



	// show online members
    var showOnline = function(list){
        var html = new EJS({url: "./views/online.ejs"}).render({user: list});
        $(".online_list").html(html);
    }

    // switch to see online list
    $(".show_online").on("click", function(){
        var $this = $(this),
            $chat = $("#online");
        $this.toggleClass("close_online");

        if($this.hasClass("close_online")){
            // display
            $chat.animate({
                right: 4,
                opacity: 1
            }, 400);
        }else{
            // display
            $chat.animate({
                right: -220,
                opacity: 0
            }, 200);
        }
    });



    // clear chat history
    $(".clear_chat").on("click", function(){
        $(".chat_content_inner").empty().removeAttr("style");
        var data = {"avatorId": avatorId, "msg": "the history is clear"},
    		type = {"item": "notice", "detail": "focus"};
    	showMessage(data, type);
    });



    // private message when online member click
    $("#online").on("click", ".online_member", function(){
        var nickname = $(this).find(".nickname").text();
        _privateMessage(nickname);
    });

    // @nickname in the message box
    var _privateMessage = function(nickname){
        $(".message_input").val("@" + nickname + " " + $(".message_input").val()).focus();
        _setCaretPosition("message_input");
    }

    // error
    var _setCaretPosition = function(elemId){
        var elem = document.getElementById(elemId);
        var caretPos = elem.value.length;
        if (elem != null) {
            if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.move("character", caretPos);
                range.select();
            }
            else {
                // chrome
                elem.setSelectionRange(caretPos, caretPos);
                elem.focus();
                //空格键
                // var evt = document.createEvent("KeyboardEvent");
                // evt.initKeyEvent("keypress", true, true, null, false, false, false, false, 0, 32);
                // elem.dispatchEvent(evt);
                // 退格键
                // evt = document.createEvent("KeyboardEvent");
                // evt.initKeyEvent("keypress", true, true, null, false, false, false, false, 8, 0);
                // elem.dispatchEvent(evt);
            }
        }
    }



	exports.showMessage = showMessage;
	exports.showOnline = showOnline;
})
