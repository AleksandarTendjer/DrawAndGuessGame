var mongoose = require('mongoose');
//var config = require('../config.js');

var Schema = mongoose.Schema;

var roomSchema = new Schema({
  name: String,
  
}, {collection: 'room'});

module.exports = mongoose.model('room', roomSchema);
