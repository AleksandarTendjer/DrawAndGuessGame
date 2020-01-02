var mongoose = require('mongoose');
var config = require('../config.js');

var Schema = mongoose.Schema;

var roomSchema = new Schema({
    pCount: {type: Number, default: 1, mix: 1, max: 8},
    players: [mongoose.Schema.Types.ObjectId],
    roundtime: {type: Number, default: config.roundtime},
    status: {type: String, default: 'waiting'},
    answers: [String]
}, {collection: 'room'});

module.exports = mongoose.model('room', roomSchema);
