/**
 * Created by alemjc on 3/26/16.
 */

var express = require('express');
var bodyparser = require('body-parser');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var bcrypt = require('bcryptjs');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var express = require('express');
var request = require('request');
var app = express();
var PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

app.use(expressSession({
  secret: '5cc36237fef6d88c39476da6b5e9a2f7',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));

app.use(passport.initialize());
app.use(passport.session());

var User = require(__dirname + "/public/js/schemas/User.js");

passport.use(new LocalStrategy({
    usernameField:"username",
    passwordField:"password"
  },

  function(username, password, done){

    console.log("in password strategy callback");
    console.log(username);
    console.log(password);

    User.findOne({username:username}, function(err, user){

      console.log(user);
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
          return done(null, false, {message:'Incorrect password.'});
        }
      }


    })
  }

));


passport.serializeUser(function(user, done){
  done(null, user._id);
});


passport.deserializeUser(function(id, done){
  User.findOne({_id:id}, function(err, user){
    done(err,user);
  })
});


app.get("/", function(req,res){

  console.log("at index");
  console.log("cookie: "+JSON.stringify(req.user));
  res.sendFile(__dirname + "/public/view/index.html");
});

app.get("/loginStatus", function(req, res){
  console.log("getting logging status");
  console.log(req.user);
  res.send(req.user);
});


app.post("/login", function(req, res, next){
  passport.authenticate('local', function(err, user){

    console.log("in the login");
    console.log(user);

    if(err){
      console.log("error happened at login");
      console.log(err);
      return res.status(404).send(err);
    }

    if(!user){
      console.log("user might have entered wrong parameters");
      return res.status(200).send(user);

    }

    req.logIn(user, function(err1){
      if(err1){
        console.log("error happened at setting session");
        return res.status(404).send(err1);
      }
      else{

        return res.status(200).send(user);
      }
    })


  })(req, res, next);
});


app.post('/register', function(req, res){

  //console.log("in register");
  //console.log(req.body);
  req.body.faceBookToken="";
  req.body.slackToken="";
  req.body.gmailToken="";

  bcrypt.genSalt(10, function(err, salt){

    if(err){
      return res.status(404).send(err);
    }
    else{
      bcrypt.hash(req.body.password,salt,function(err2, hash){

        if(err2){
          return res.status(404).send(err2);
        }
        else{
          req.body.password = hash;

          var user = new User(req.body);
          user.save(function(err, user1){
            console.log("saving user");
            console.log(user1);
            if(err){
              //console.log("error registering user");
              //console.log(err);
              res.status(500).send(err);
            }
            else{
              req.logIn(user1, function(err1){
                if(err1){
                  //console.log("error happened at setting session");
                  return res.status(404).send(err1);
                }
                else{
                  return res.status(200).send(user1);
                }
              })
            }

          });

        }

      });
    }

  });

});

app.post("/updateUser", function(req, res){

  User.findOneAndUpdate(req.body.user._id, req.body.user, {new:true},
    function(err, doc){
      if(err){
        return res.status(404).send(err);
      }
      else{
        console.log(doc);
        return res.send(doc);
      }

    }
  );

});

app.get("/slackAuth", function(req, res){

  console.log("/slackAuth");
  console.log(req.query);
  if(req.query.state === req.user.username){
    request("https://slack.com/api/oauth.access?client_id="+"9328545702.31568401990&"+
      "client_secret=09490261d44c791db569237175161947&code="+req.query.code,
      function(error, response, body){
        if (!error && response.statusCode == 200) {
          console.log(body);
          console.log(body.access_token);
          User.findOneAndUpdate({username:req.user.username},{slackToken:body.access_token},{new:true},
          function(err, doc){
            if(err){
              console.log(err);
              return res.redirect("/");
            }
            else{
              console.log(doc);
              req.user.slackToken = body.access_token;
              return res.redirect("/");
            }
          });

        }
        else{
          console.log(error);
          res.redirect("/");
        }
      })
  }


});

app.listen(PORT, function(){
  console.log("listening on ", PORT);
  mongoose.connect('mongodb://heroku_80c4pl5t:1pkn0mmchnqm34rf4c6lgkruf7@ds051720.mlab.com:51720/heroku_80c4pl5t');
  //mongoose.connect('mongodb://localhost/onemessaging');
});
