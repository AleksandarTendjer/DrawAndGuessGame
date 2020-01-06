/*
 * -----------USER------------
 * @ Aleksandar Tendjer
 *description: creation and deletion of users-by registering
 *uses: dbOperations to communicate with the database
 * -------------------------
 *
 */

  var express = require('express');
  var router = express.Router();
  var mongoose = require('mongoose');
  var ejs=require('ejs');
  var Room = require('../models/room.js');
  var db=require('../dbOperations.js')


  router.get('/', async  function(req, res, next) {
  console.log('***get users***');


    await db.allUsers(function(error, users){
  		if(error){
  			return next(error);
  		}else {
        {
          res.render('../views/players.ejs',{users:users});
        }
      }
    }) ;
    //console.log(responseList);


  } );
  router.post('/', async  function(req, res, next) {
  console.log('***post user**');
 console.log(req.body);
  req.body.userId=mongoose.Types.ObjectId();
  var data=req.body;

    await db.add(data,function(error, user){
      if(error){
        console.log(error);
        return next(error);
      }else {
        console.log("user was created with these credentials:");
          console.log(user);
          //send the created room
          res.send(user);

      }
    }) ;
    //console.log(responseList);
} );

module.exports = router;
