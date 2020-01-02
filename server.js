/*
 * @ Aleksandr Tendjer
 ************************
 * @ DESCRITION: file that creates the websockets and initializes connection with
 * socket.io
 ************************
 */
//1. get all modules and create a session

// mudules
var express = require("express"),
	sio = require("socket.io"),
	fs = require("fs"),
	path = require("path"),
	url = require("url"),
	parseCookie = require("connect").utils.parseCookie,
	MemoryStore = require("connect/middleware/session/memory");

//session
var usersWS = {},  //websocket

	storeMemory = new MemoryStore({
		reapInterval: 60000*10
	}); //session store


// 2. app export and creating a server
var app = module.export = express.createServer();

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.cookieParser());
  //setting a keywoard for session and setting it in session storage
	app.use(express.session({
		secret: '',
		store: storeMemory
	}));

	app.use(express.methodOverride());
	app.use(app.router);
  //setting views and static services directory
	app.set('views', __dirname + '../public');
	app.set('view engine', 'ejs');
	app.use(express.static(__dirname + '../public'));
});


// 3. socket.io
var io = sio.listen(app);

//session setting
io.set('authorization', function(handshakeData, callback){
	// cookie session grabbing with the handshake
	handshakeData.cookie = parseCookie(handshakeData.headers.cookie)
	var connect_sid = handshakeData.cookie['connect.sid'];

	if (connect_sid) {
		storeMemory.get(connect_sid, function(error, session){
			if (error) {
				// if we cannot grab a session, turn down the connection
				callback(error.message, false);
			}
			else {
				// save the session data and accept the connection
				handshakeData.session = session;
				callback(null, true);
			}
		});
	}
	else {
		callback('nosession');
	}
});


// 3. URL
/**
  *
 * @param {Object} req
 * @param {Object} res
 */
//on entering the  localhost , if there is an open session redirect to index
//if not redirect to loginpage
app.get("/", function(req, res){
	console.log(req.session.name)
 	if(req.session.name && req.session.name!==""){
    //this is the legit session of the user
 		res.redict("/index")
 	}else{
 		// if not connected(no sessions open) go to the login page 
 		//var loginPath = __dirname + "../public/" + url.parse("login.html").pathname;
    var loginPath = __dirname + "public/" + url.parse("login.html").pathname;

    var loginTxt = fs.readFileSync(loginPath);
 		res.end(loginTxt);
  //  res.render(loginPath);
 	}
});

//get data from session
app.get("/index", function(req, res){
	console.log(req.session.name)
	if(req.session.name && req.session.name!==""){
		// res.render("index", {name: req.session.name});
		var indexPath = __dirname + "public/" + url.parse("index.html").pathname;
 		var indexTxt = fs.readFileSync(indexPath);
 		res.end(indexTxt);
	}else{
		res.redict("/");
	}
});

app.post("/index", function(req, res){
	var avatorId = req.body.avatorId,
		nickname = req.body.nickname,
		password = req.body.password;

	if(nickname && nickname!==""){
		req.session.name = nickname;	//设置session
		req.session.avatorId = avatorId;	//设置session
		console.log(req.session.name+"--------------")
		console.log(req.session.avatorId+"--------------")
		// res.render("index", {nickname: nickname});
		var indexPath = __dirname + "public" + url.parse("index.html").pathname;
 		var indexTxt = fs.readFileSync(indexPath);
 		res.end(indexTxt);
    //res.render(indexpath);
	}else{
    //no session for the user, check the database and create the  session
		res.end("error");
	}
});


//===================socket connection monitor for Players=================
/**
 *    start monitoring the session
 * @param {Object} socket
 */
io.sockets.on('connection', function (socket){
	var session = socket.handshake.session;  //session
	var name = session.name;
	usersWS[name] = socket;

	console.log("connect------------success+++++++++")
	console.log(session+"-----------------session")
	console.log(name+"----------------name")
	console.log(session.avatorId+"----------------id")


	// SYSTEM SENDS A MESSAGE WHEN A NEW USER IS connected
	function getOnline(){
		var allUser = [];
		for (var i in usersWS){
			allUser.push(i);
		}
		io.sockets.emit('online list', allUser);  //send all online user sockets
	}

	getOnline();
	// send the data of a player
  //go to the session
	function getPlayer(){
		console.log("id"+session.avatorId)
		var data = {"name": name, "avatorId": session.avatorId};
		usersWS[name].emit("player data", data);
	}
	getPlayer();

	// notification of a new entry to the room
	socket.broadcast.emit('system message', '【'+name + '】 enetered the room', 'add');

	//sending in chat message to everyone
	socket.on('public message', function(msg, fn){
		socket.broadcast.emit('public message', name, msg);
		fn(true);
	});

	//send message to a specific user
	socket.on('private message',function(to, avatorId, msg, fn){
		var target = usersWS[to];
		if (target) {
			fn(true);
			target.emit('private message', name+'[private nessage]', avatorId, msg);
		}
		else {
			fn(false)
			socket.emit('message error', to, msg);
		}
	});

	//disconecting
	socket.on('disconnect', function(){
		delete usersWS[name];
		session = null;
		socket.broadcast.emit('system message', '【'+name + '】went offline', "sub");
		getOnline();
	});

});

// begin listenning
app.listen(3000, function(){
	var address = app.address();
	console.log("Draw&Guess listening on http://127.0.0.1:"+ address.port);
});
