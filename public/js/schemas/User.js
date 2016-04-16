/**
 * Created by alemjc on 3/29/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  username:String,
  password:String,
  twitterRequestToken:String,
  twitterRequestTokenSecret:String,
  twitterAccessToken:String,
  twitterAccessTokenSecret:String,
  slackToken:String,
  gmailAccessToken:String,
  gmailRefreshToken:String
});

var user = mongoose.model('user', User);

module.exports = user;