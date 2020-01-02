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
	userEntity.userId = data.userId;

	// if somebody is registered with this username, it should not be used yet again
	exports.findByusername(data.username, function(error, gamer){
	    if(error){
	    	console.log(error);
	    }else{
	    	if(!gamer){
	    		userEntity.save(function(error){
					if(error){
						console.log("error in registering" + error);
					}else{
						console.log("*****************");
						console.log(userEntity.username);
						console.log(userEntity.password);
						console.log(userEntity.userId);
						console.log("*****************");
						callback(null);
					}
				});
	    	}else{

	    		callback("same gamer");
	    	}
	    }
	});

}

// enter username get id(username is also unique)
exports.getuserId = function(username, callback){
	exports.findByusername(username, function(error, gamer){
	    if(error) {
	        // console.log("FATAL " + error);
	        callback("error", error);
	    } else {
	    	// console.log("id"+gamer);
	    	callback(null, gamer.userId)
	    }
	});
}
exports.online = function(username, callback){
	exports.findByusername(username, function(error, gamer){
	    if(error) {
	        callback("error", error);
	    } else {
	    	callback(null, {
	    		userId: gamer.userId,
	    		username: gamer.username,
	    		score: gamer.score
	    	});
	    }
	});
}


// verification of login
exports.login = function(data, callback){
	exports.findByusername(data.username, function(error, gamer){
	    if(error) {
	        console.log("FATAL " + error);
	        callback("error", error);
	    } else {
	    	console.log(gamer);
	    	callback(null, gamer.password);
	    }
	});
}

// delete the user
exports.delete = function(id, callback){
	exports.findGamerById(id, function(error, gamer){
		if(error){
			callback(error)
		}else{
			console.log("delete success");
			gamer.remove();
			callback(null);
		}
	});
}

// add a score
exports.saveScore = function(id, score, callback){
	exports.findGamerById(id, function(error, gamer){
		if(error){
			callback(error);
		}else{
			gamer.modifydate = new Date();
			gamer.score = score;
			gamer.save(function(error){
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


exports.allGamers = function(callback){
	User.find({}, callback);
}


//finding data by id
var findGamerById = exports.findGamerById = function(id, callback){
    User.findOne({_id: id}, function(error, gamer){
        if(error){
            console.log('FATAL ' + error);
            callback(error, null);
        }
        callback(null, gamer);
    });
}

// finding data by name
exports.findByusername = function(username, callback) {
    User.findOne({username: username}, function(error, gamer){
        if(error){
            console.log('FATAL ' + error);
            callback(error, null);
        }
        callback(null, gamer);
    });
}
