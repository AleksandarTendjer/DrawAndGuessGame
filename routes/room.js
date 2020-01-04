/*
 * -----------ROOM------------
 * @ Aleksandar Tendjer
 *description: creation and deletion of rooms
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
 console.log('***get rooms**');


   await db.allRooms(function(error, rooms){
 		if(error){
 			return next(error);
 		}else {
       {
         res.render('../views/rooms.ejs',{rooms:rooms});
       }
     }
   }) ;
   //console.log(responseList);


 } );
 router.post('/', async  function(req, res, next) {
 console.log('***post rooms**');
 console.log(req.body);
  var data=req.body;
   await db.addRoom(data,function(error, room){
     if(error){
       return next(error);
     }else {
       {
         //send the created room
         res.send(room);
       }
     }
   }) ;
   //console.log(responseList);


 });
 module.exports = router;
