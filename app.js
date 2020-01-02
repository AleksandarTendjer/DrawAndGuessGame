//Draw and guess server logic

//Var definitions
// modules
var express = require("express"),
//all routes
//	routers = require("./routes"),
//words for drawing
	gameWord = require("./words"),
	http = require("http"),
	path = require("path"),
  bodyParser=require("body-parser"),
  cookieParser=require("cookie-parser"),
  methodOverride=require("method-override"),
  logger=require("morgan"),

  //game = require("./controller"),
	gameDbO = require("./dbOperations");

var app = express(),
	server = http.createServer(app),
	io = require("socket.io").listen(server, {log: true});

var clients = [],	//all registered users
	users = [];		//online users

var name = "",
	userId = 0;//userID

  var router = express.Router();


//variable of game
var GameVariable = {
	error: false,	//if somethin isnt right
	start: false,	//start of the game
	word: [],		//word to guess and its descriptions [bannana, fruit,6 letters]
	drawer: "",		//current user that draws
	correctGuess: 0,//number of the user whi correctly guesed
	lastOne: false,	//is the current drawer the last user in the room
	endScore: []	// 2D array-[name, userId, word, flower, egg, shoe, me]
}

//timer for the round
var _timer = {
	sixtyTimer: null
}


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

// 2. app configuratiion
var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);
	app.set("views", __dirname + "public/views");
	app.set("view engine", "ejs");

	//app.use(express.logger("dev"));
//	app.use(express.bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//  app.use(express.cookieParser())
app.use(logger('dev'));
app.use(cookieParser("draw"));

	//app.use(methodOverride());
  // override with the X-HTTP-Method-Override header in the request
  app.use(methodOverride('X-HTTP-Method-Override'));

  //app.use(app.router);	// handler for post methods
app.use(router);

  app.use(express.static(path.join(__dirname, "public")));

/*****************************************************/
/********************SOCKET CONTROLS*************************/
/*****************************************************/

  io.sockets.on("connection", function(socket){

  	// when a user connects to websockets
  	 socket.on("online", function(data){
      		var data = JSON.parse(data);
      		name = data.username;
      		userId = data.userId;
      		//updating user list to client
      		users.push(data.username);

      		//Initialization points of the game  for users
      		GameVariable.endScore.push([name, userId, 0, 0, 0, 0, 0]);

      		// socke for user that is online
      		clients[data.username] = socket;

      		// send to everzone that the user is online
      		socket.broadcast.emit("system message", "【" + name + "】已经进入房间", "add");

      		// update data of users in the room
          // and u
      		getOnline();
      		getPlayer();

      		// update on sixty secconds
      		// clear tieout will be on 60 secconds
      		clearTimeout(_timer.sixtyTimer);
  	});

  	// get user data on the network
  	function getOnline(){
  		 game.online(users, function(list){
  			for(var index in clients){
  				clients[index].emit("online list", list);
  				clients[index].emit("room member", list);
  			}
  		});
  	}

  	// get player data
  	function getPlayer(){
  		var data = {"name": name, "userId": userId};
  		clients[name].emit("player data", data);
  	}

    /*********************CHAT SECTION******************************/
    	//PUBLIC INFO
    	socket.on("public message", function(avatorId, name, msg, callback){
    		callback(true);

    		if(msg != GameVariable.word[0]){
    			// can send mesgs to everyone except myself
    			socket.broadcast.emit("public message", userId, name, msg);
    		}else{
    			msg = "Congratulations" + name + "has answered the question correctly!";
    			GameVariable.correctGuess++;

    			// statistics
    			scoreCount({
    				type: "word",
    				name: name,
    				userId: userId
    			});

    			// send msg to everyone including myself
    			for(var index in clients){
    				clients[index].emit("correct answer", name, msg);
    			}
    			// everyone has correctly guessed
    			if(GameVariable.correctGuess == users.length-1){
    				console.log("everyoe is correct");
    				scoreSend();
    				// start the game automaticcally(next round)
            //start the game and set the timeout to 5000 ms
    				setTimeout(function(){
    					startGame("next game");
    				}, 5000);

    				GameVariable.correctGuess = 0;
    			}
    		}
    	});

    	//PRIVATE MESSAGE
    	socket.on("private message",function(to, avatorId, msg, callback){
    		var target = clients[to];
    		if (target) {
    			target.emit("private message", name+"[private message]", avatorId, msg);
    			callback(true);
    		}
    		else {
    			socket.emit("message error", to, msg);
    			callback(false);
    		}
    	});

    	// systen message
    	socket.on("system message", function(msg, detail){
    		for(var index in clients){
    			clients[index].emit("system message", msg, detail);
    		}
    	});









    	// going offline
    	socket.on("offline", function(user){
    		socket.disconnect();
    	});

});

gameDbO.connect(function(error){
  if(error) throw error;
});

//when exiting the app close the connection
app.on("close", function(error){
  gameDbO.disconnect(function(err){});
});

// 5. listen on the port
server.listen(app.get("port"), function(){
	console.log("Express server listening on port " + app.get("port"));
});
