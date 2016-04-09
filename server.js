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
var sorts = require(__dirname+"/public/js/sortAlgorithms/sorts.js");
var app = express();
var PORT = process.env.PORT || 3000;
var RtmClient = require('@slack/client').RtmClient;
var SLACK_RTM_EVENTS = require("@slack/client").RTM_EVENTS;
var SLACK_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var rtm;

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var urlshortener = google.urlshortener('v1');

var oauth2Client = new OAuth2("984356963831-0pfq9l1t3mnnlr0i2lec28pmvdhdmm2k.apps.googleusercontent.com", "VgS92n51AtwiYQCimdUYw9B2", "https://fast-gorge-90415.herokuapp.com/oauthcallback");
var slackUsers = [];




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

function startRTM(accessToken){
  console.log("startRTM");
  console.log("accessToken is: "+accessToken);
  rtm = new RtmClient(accessToken,{logLevel:'error'});
  rtm.start();

  rtm.on(SLACK_RTM_EVENTS.MESSAGE, function(message){
    //console.log(message);
  });

  rtm.on(SLACK_CLIENT_EVENTS.RTM.AUTHENTICATED, function(startdata){
    console.log("authenticated");
    //console.log(startdata.users);
    for(var i = 0; i < startdata.users.length; i++){
      slackUsers.push({id:startdata.users[i].id, name: startdata.users[i].name});
    }
    console.log("slackUsers: ", JSON.stringify(slackUsers));
    slackUsers = sorts.mergeSort(slackUsers);
    console.log("slackUsers: ", JSON.stringify(slackUsers));
    console.log("authenticated done");
  });

  rtm.on(SLACK_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function(){
    console.log("slack rtm connection opened");
  });

}


app.get("/slackAuth", function(req, res){

  console.log("/slackAuth");
  console.log(req.query);
  if(req.query.state === req.user.username){
    request("https://slack.com/api/oauth.access?client_id="+"9328545702.31568401990&"+
      "client_secret=09490261d44c791db569237175161947&code="+req.query.code,
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          var slackBody = JSON.parse(body);
          console.log(slackBody);
          User.findOneAndUpdate({username:req.user.username},{slackToken:slackBody.access_token},{new:true},
          function(err, doc){
            if(err){
              console.log(err);
              return res.redirect("/");
            }
            else{
              console.log(doc);

              req.user.slackToken = slackBody.access_token;
              startRTM(req.user.slackToken);
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



app.get("/gmailAuth", function(req, res){


  //after oauth save the token in the database, just return res.redirect("/");
  //and make sure you req.user.gmailToken = data.access_token;
  console.log("/gmailAuth");
  console.log(req.query);


  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: 'https://www.googleapis.com/auth/gmail.readonly' // If you only need one scope you can pass it as string
  });

  console.log(url);
  res.send(url);

  //var url = "https://www.googleapis.com/oauth2/v4/token";
  //var oauth = {
  //  code: req.query.code,
  //  client_id: "984356963831-0pfq9l1t3mnnlr0i2lec28pmvdhdmm2k.apps.googleusercontent.com",
  //  client_secret: "VgS92n51AtwiYQCimdUYw9B2",
  //  grant_type: 'authorization_code',
  //  redirect_uri: "https://fast-gorge-90415.herokuapp.com/gmailAuth"
  //}
  //
  //request.post(url, {form: oauth},
  //  function (error, response, data){
  //    console.log(response.statusMessage);
  //
  //    if(!error && response.statusCode == 200) {
  //      console.log("DATA: " + data);
  //
  //      var gmailBody = JSON.parse(data);
  //      console.log(gmailBody["access_token"]);
  //      User.findOneAndUpdate({username:req.user.username},{gmailToken:gmailBody.access_token},{new:true},
  //        function(err, doc){
  //          if(err){
  //            console.log(err);
  //            return res.redirect("/");
  //          }
  //          else{
  //            console.log(doc);
  //            req.user.gmailToken = data.access_token;
  //            return res.redirect("/");
  //          }
  //        });
  //
  //    }
  //
  //  });

});



app.get('/oauthcallback', function(req, res){

  console.log('/oauthcallback');
  console.log(req.query.code);

  oauth2Client.getToken(req.query.code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.

    if(req.user.gmailToken !== ''){
      console.log("HELLO2");
      res.redirect("/");
    }else{
      if(!err) {
        oauth2Client.setCredentials(tokens);
        console.log(tokens);
        console.log(tokens.access_token);
        User.findOneAndUpdate({username:req.user.username},{gmailToken:tokens.refresh_token},{new:true},
          function(err, doc){
            if(err){
              console.log(err);
              return res.redirect("/");
            }
            else{
              console.log(doc);
              req.user.gmailToken = tokens.refresh_token;
              return res.redirect("/");
            }
          });
      }
    }
  });

});




app.get("/faceBookAuth", function(req, res){

  console.log("/faceBookAuth");
  console.log(req.query);

  if(req.query.state === req.user.username){
    request("https://graph.facebook.com/v2.3/oauth/access_token?client_id=597182890448198&redirect_uri=https://fast-gorge-90415.herokuapp.com/faceBookAuth&client_secret=f8090cc7be5e3b79f77e118eb8920a58&code="+req.query.code,
      function(error, response, body){

        console.log(error)
        console.log(response.statusCode)
        if(!error && response.statusCode == 200) {

          console.log("DATA: " + body);
          var faceBookBody = JSON.parse(body);
          console.log(faceBookBody["access_token"]);

          User.findOneAndUpdate({username:req.user.username},{faceBookToken:faceBookBody.access_token},{new:true},
            function(err, doc){
              if(err){
                console.log(err);
                return res.redirect("/");
              }
              else{
                console.log(doc);
                req.user.faceBookToken = body.access_token;
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
