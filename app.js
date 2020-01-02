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
	gameDao = require("./dbOperations");

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
	threeMinTimer: null
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






// 5. listen on the port
server.listen(app.get("port"), function(){
	console.log("Express server listening on port " + app.get("port"));
});
