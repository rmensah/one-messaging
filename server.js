/**
 * Created by alemjc on 3/26/16.
 */

var express = require('express');
var bodyparser = require('body-parser');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var bcrypt = require('bcryptjs');
var app = express();
var PORT = process.env.PORT||3000;


app.use(express.static(__dirname+"/public"));
app.use(bodyparser);
app.use(express.session({secret:'5cc36237fef6d88c39476da6b5e9a2f7'}));
app.use(passport.initialize());
app.use(passport.session());

var User = require(__dirname+"/public/js/User.js");

passport.use(new LocalStrategy({
    usernameField:"username",
    passwordField:"password"
  },

  function(username, password, done){

    User.findOne({username:username}, function(err, user){
      if(err){
        return done(err);
      }
      else if(!user){
        return done(null, false, {message:'Incorrect username.'});

      }
      else{
        var authenticates = bcrypt.compareSync(password, user.password);
        if(authenticates){
          return done(null,user);
        }
        else{
          return return done(null, false, {message:'Incorrect password.'});
        }
      }


    })
  }

));

passport.serializeUser(function(user, done){
  done(null, user._id);
});

passport.desializeUser(function(id, done){
  User.findOne({_id:id}, function(err, user){
    done(err,user);
  })
});


app.get("/", function(req,res){

  res.sendFile(__dirname+"/public/view/loginregistration.html");
});

app.post("/login", passport.authenticate('local', {successRedirect:'/index', failureRedirect:'/'}));

app.listen(PORT, function(){
  console.log("listening on ", PORT);
});

