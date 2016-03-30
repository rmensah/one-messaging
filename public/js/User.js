/**
 * Created by alemjc on 3/29/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  username:String,
  password:String,
  faceBookToken:String,
  slackToken:String,
  gmailToken:String
});

var user = mongoose.model('user', User);

module.exports = user;