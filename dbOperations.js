/*
 * -----------DAO------------
 * @ Aleksandar Tendjer
 * -------------------------
 *
 */


var dburl = 'mongodb://localhost:27017/ToDoDatabase' // link  to MongoDB


var mongoose = require('mongoose');
//user scheme
var User = require('./models/user.js');
//room scheme
var Room = require('./models/room.js');

exports.connect = function(){
	mongoose.connect(dburl)
	  .then(() =>  console.log('connection succesful'))
	  .catch((err) => console.error(err));
}

exports.disconnect = function(callback){
	mongoose.disconnect(callback);
}

exports.setup = function(callback){
	callback(null);
}





//working entity(addidng input items in this function
var userEntity = new User();

exports.emptyData = {}

// add user
exports.add = function(data, callback){
	userEntity.username = data.username;
	userEntity.password = data.password;
//	userEntity.userId = data.userId;
	console.log("data to insert");
	console.log(data);
	console.log("User entity");
	console.log(userEntity);

	// if somebody is registered with this username, it should not be used yet again
	exports.findByusername(data.username, function(error, user){
	    if(error){
	    	console.log(error);
	    }else{
	    	if(!user){
	    		userEntity.save(function(error){
					if(error){
						console.log("error in registering" + error);
					}else{
						console.log("*****************");
						console.log(userEntity.username);
						console.log(userEntity.password);
	//					console.log(userEntity.userId);
						console.log("*****************");
						callback(null);
					}
				});
	    	}else{

	    		callback("same user");
	    	}
	    }
	});

}

// enter username get id(username is also unique)
exports.getuserId = function(username, callback){
	exports.findByusername(username, function(error, user){
	    if(error) {
	        // console.log("FATAL " + error);
	        callback("error", error);
	    } else {
	    	// console.log("id"+user);
	    	callback(null, user.userId)
	    }
	});
}
exports.online = function(username, callback){
	exports.findByusername(username, function(error, user){
	    if(error) {
	        callback("error", error);
	    } else {
	    	callback(null, {
	    		userId: user.userId,
	    		username: user.username,
	    		score: user.score
	    	});
	    }
	});
}


// verification of login
exports.login = function(data, callback){
	exports.findByusername(data.username, function(error, user){
	    if(error) {
	        console.log("FATAL " + error);
	        callback("error", error);
	    } else {
	    	console.log(user);
	    	callback(null, user.password);
	    }
	});
}

// delete the user
exports.delete = function(id, callback){
	exports.findUserById(id, function(error, user){
		if(error){
			callback(error)
		}else{
			console.log("delete success");
			user.remove();
			callback(null);
		}
	});
}

// add a score
exports.saveScore = function(id, score, callback){
	exports.findUserById(id, function(error, user){
		if(error){
			callback(error);
		}else{
			user.modifydate = new Date();
			user.score = score;
			user.save(function(error){
				if(error){
					console.log("FATAL " + error);
					callback(error);
				}else{
					callback(null);
				}
			});
		}
	})
}


exports.allUsers = function(callback){
	User.find({}, callback);
}


//finding data by id
var findUserById = exports.findUserById = function(id, callback){
    User.findOne({_id: id}, function(error, user){
        if(error){
            console.log('FATAL ' + error);
            callback(error, null);
        }
        callback(null, user);
    });
}

// finding data by name
exports.findByusername = function(username, callback) {
    User.findOne({username: username}, function(error, user){
        if(error){
            console.log('FATAL ' + error);
            callback(error, null);
        }
        callback(null, user);
    });
}
/***************ROOM OPERATIONS***********************/

var roomEntity=new Room();

exports.addRoom=function(data,callback){
	roomEntity.name = data.name;
	roomEntity.createdBy = data.createdBy;
	// if somebody is registered with this username, it should not be used yet again
	exports.findByRoomName(data.name, function(error, room){
			if(error){
				console.log(error);
			}
			if(!room){
				roomEntity.save(function(error){
			if(error){
				console.log("error in creating room" + error);
			}else{
				console.log("*****************");
				console.log(roomEntity.name);
				console.log(userEntity.createdBy);
				console.log("*****************");
				callback(null);
			}
		});
}
});
}

exports.allRooms = function(callback){
	Room.find({}, callback);
}
