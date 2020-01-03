var mongoose = require('mongoose');
//var config = require('../config.js');

var Schema = mongoose.Schema;

var roomSchema = new Schema({
  name: String,
  createdBy: String //username of the user that created the room-he can only delete it
}, {collection: 'room'});

module.exports = mongoose.model('room', roomSchema);
