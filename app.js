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
  user=require('./routes/user.js'),
  room=require('./routes/room.js'),
  dag=require('./socketLogic'),
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
	app.set("views", __dirname + "/public/views");
	app.set("view engine", "ejs");

	//app.use(express.logger("dev"));
//	app.use(express.bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//  app.use(express.cookieParser())
app.use(logger('dev'));
app.use(cookieParser("draw"));

//adding routes for user and room operations
app.use('/users', user);
app.use('/rooms', room);

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
    console.log("******connected*****");
    //in-game socket logic
    dag.initGame(io,socket);


});
/*********************************************/
/*******************URL SECTION************************/
/*********************************************/

app.get("/", function(req, res){
  //if no cookies redirect to login page
	if(!req.headers.cookie){
		res.redirect("/login");
		return false;
	}
  //if there are cookies
	console.log(req.headers.cookie);
  //split cookie info by ;
	var cookies = req.headers.cookie.split("; ");
	var isSign = false;
  //if length of cookies
	for(var i=0; i<cookies.length; i++){
		cookie = cookies[i].split("=");
		console.log(cookie[i]);
    //if username is not empty
		if(cookie[0]=="username" && cookie[1]!=""){
      //already signed in
      isSign = true;
			break;
		}
	}
  //if not signed in
	if(!isSign){
    //set him on login
		res.redirect("/login");
		return false;
	}
	res.redirect("/index");
});


//the one that is used after the login
app.get("/index", function(req, res){
	console.log("entered the index");

	if(!req.headers.cookie){
		res.redirect("/login");
		return false;
	}
	var cookies = req.headers.cookie.split("; ");
		console.log(cookies);
	var isSign = false;
	for(var i=0; i<cookies.length; i++){
		cookie = cookies[i].split("=");
		if(cookie[0]=="username" && cookie[1]!=""){
			isSign = true;
			break;
		}
	}

	if(!isSign){
		res.redirect("/login");
		return false;
	}
	console.log("about to send the index");
//	res.render(path.resolve("public/views/index.html"),{rooms:rooms})
	res.sendfile(path.resolve("public/views/index.html"));
});




app.get("/login", function(req, res){
	//res.sendfile(path.resolve("views/login.html"));
//  res.render('public/views/index.html');

  res.render('login');
});

//other actions are added in routes !



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
