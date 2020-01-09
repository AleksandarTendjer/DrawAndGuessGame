var io;

/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
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

 var clients = [],	//all registered users
 	users = [];		//online users

 var name = "",
 	userId = 0;//userID


exports.initGame = function(sio, socket){
    io = sio;
  //  gameSocket = socket;
    socket.emit('connected', { message: "You are connected!" });

    // when a user connects to websockets
     socket.on("online", function(data){
          console.log("i am online");
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
          socket.broadcast.emit("system message", "【" + name + "] is online", "add");

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

    /**********************ROOM SECTION**********************/
    /**



    * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
    */
    socket.on('createRoom', function(){
      // Create a unique Socket.IO Room
      var thisGameId = ( Math.random() * 100000 ) | 0;
      //add to database
      //	gameDbo.addRoom();

      // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
      this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

      // Join the Room and wait for the players
      this.join(thisGameId.toString());
    });


    /*********************CHAT SECTION******************************/
      //PUBLIC INFO
      socket.on("public message", function(userId, name, msg, callback){
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


      //DISCONNECT THE USER
      socket.on("disconnect", function(){
        console.log("disconnect");
        setTimeout(function(){
          for(var index in clients){
            if(clients[index] == socket){
              // remove the score if the client is found
              var gameScore = GameVariable.endScore;
              for(var i=0; i<gameScore.length; i++){
                if(index == gameScore[i][0]){
                  GameVariable.endScore.splice(i, 1);
                  break;
                }
              }

              // delete the offline user
              users.splice(users.indexOf(index), 1);

              // delete the socket that went offline
              delete clients[index];
              socket.broadcast.emit("system message", "【"+name + "left", "sub");
              game.online(users, function(list){
                for(var index_online in clients){
                  clients[index_online].emit("online list", JSON.stringify(list));
                  clients[index_online].emit("room member", JSON.stringify(list));
                }

              });
              break;
            }
          }
        }, 100);
      });
      // start the first game-it was not played before
      socket.on("start game", function(callback){
        if(users.length == 1){
          callback();
          return false;
        }
        // callback();
        startGame("start game");
      });
    /*******************GAME LOGIC************************/
      //method that is called on every round
      function startGame(method){
        //start the first game or the next round
        var _method = method || "next game";
        var data = dataBuild();
        //if the method is start game it is most definitelly
        //the 1st round
        if(method == "start game"){
          GameVariable.lastOne = false;
        }

        if(!GameVariable.lastOne){
          // not the last one(means that the method is not start game)
          for(var index in clients){
            clients[index].emit(_method, data);
          }
        }else{
          //the last user finished with the drawing
          GameVariable.start = false;
          // setTimeout(function(){
            // show the table
            for(var index in clients){
              clients[index].emit("end game", GameVariable.endScore);
            }
            // for  every user that was in the room give the
            for(var i=0; i<GameVariable.endScore.length; i++){
              GameVariable.endScore[i].splice(2, 4, 0, 0, 0, 0, 0);
            }
            // initialization
            extend(GameVariable, {
              error: false,
              start: false,
              word: [],
              drawer: "",
              correctGuess: 0,
              lastOne: false
            });

            // clearing the timeout
            clearTimeout(_timer.sixtyTimer);
          // }, 5000);
          setTimeout(function(){
            // 5s timeout
            getOnline();
          }, 5000);
        }
        // send score after timeout
        clearTimeout(_timer.sixtyTimer);
        _timer.sixtyTimer = setTimeout(function(){
          // return to results
          scoreSend();
          // start the next game
          setTimeout(function(){
            startGame("next game");
          }, 5000);
        }, 60000);





      }

      // set the data for session
      function dataBuild(){
        GameVariable.start = true;
        GameVariable.word = getWord();
        console.log("current user to draw "+GameVariable.drawer);
        console.log("currently online users "+users.length);
        console.log("first user"+users);

        // current drawer set
        if(GameVariable.drawer == ""){
          // if there was no drawer before set it to the first element
          GameVariable.drawer = users[0];
          console.log("first drawer-----------"+GameVariable.drawer);
        }else{
          console.log("currentDrawer:"+GameVariable.drawer);
          var currentDrawer = GameVariable.drawer;
          for(var i=0; i<users.length; i++){
            if(currentDrawer == users[i] && i != users.length-1){
              console.log("next drawer->usres[i+1]"+users[i+1]);
              GameVariable.drawer = users[i+1];
              break;
            }
            //we got to the last element
            if(i == users.length-1){
              console.log("the last drawer for this game")
              GameVariable.lastOne = true;
              break;
            }
          }
        }
        console.log("go ahead-------------------------")
        console.log(GameVariable)
        return GameVariable;
      }

      // get the random word to draw
      function getWord(){
        var pos = Math.floor(Math.random() * gameWord.word.length);
        return gameWord.word[pos];
      }

      // next game
      socket.on("next game", function(){
        //   show answer
        scoreSend();

        setTimeout(function(){
          startGame("next game");
        }, 5100);
      });

      // send score on every round
      function scoreSend(){
        var pos = 0;
        for(var i=0; i<GameVariable.endScore.length; i++){
          if(GameVariable.drawer == GameVariable.endScore[i][0]){
            pos = i;
            break;
          }
        }

        var scoreData = {
          num: GameVariable.endScore[pos][2],
          word: GameVariable.word[0]
        }
        console.log(GameVariable.endScore);
        for(var index in clients){
          clients[index].emit("show answer", scoreData);
        }
        // set sixty timer
        clearTimeout(_timer.sixtyTimer);
      }



      // statistics for the right answer
      socket.on("score", function(data){
        scoreCount(data);
      });

      function scoreCount(data){
        var drawer = GameVariable.drawer;	//drawing
        console.log("score statistics：drawer "+drawer);
        console.log("score statistics：name "+data.name);

        for(var i=0; i<GameVariable.endScore.length; i++){
          // additional scores for room members
          if(data.name == GameVariable.endScore[i][0]){
            console.log("user: "+GameVariable.endScore[i][0]);
            GameVariable.endScore[i][6] += 1;
            continue;
          }

          /*if(drawer == GameVariable.endScore[i][0]){
            GameVariable.endScore[i][type] += 1;
            continue;
          } */
        }

        console.log("result ！！！！！！！！！！！- "+GameVariable.endScore);
      }


      // going offline
      socket.on("offline", function(user){
        socket.disconnect();
      });
}
