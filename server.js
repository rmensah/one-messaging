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
var Pusher = require('pusher');
var sorts = require(__dirname+"/public/js/sortAlgorithms/sorts.js");
var search = require(__dirname+"/public/js/searchAlgorithms/search.js");
var app = express();
var PORT = process.env.PORT || 3000;
var RtmClient = require('@slack/client').RtmClient;
var SLACK_RTM_EVENTS = require("@slack/client").RTM_EVENTS;
var SLACK_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var rtm;

var tweetPollingInterval;
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
  consumerKey: 'k7HeFGmemKJUbCKGndCjtZ6rO',
  consumerSecret: 'KRc1ctuhqmWkB2iLKb8qCRmBSANpEbylReJ4xS90imfj95Eyf2',
  callback: 'https://fast-gorge-90415.herokuapp.com/twitterAuthCallback'
});

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var urlshortener = google.urlshortener('v1');

var oauth2Client = new OAuth2("984356963831-0pfq9l1t3mnnlr0i2lec28pmvdhdmm2k.apps.googleusercontent.com", "VgS92n51AtwiYQCimdUYw9B2", "https://fast-gorge-90415.herokuapp.com/oauthcallback");
var pollingInterval;
var gmail = google.gmail({ version: 'v1', auth: oauth2Client });

var slackUsers;
var slackChannels;
var userSlackId;

var pusher = Pusher.forURL(process.env.PUSHER_URL);



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

        if(user.gmailAccessToken !== ""){
          oauth2Client.setCredentials({
            access_token: user.gmailAccessToken,
            refresh_token: user.gmailRefreshToken
          });

          pollingInterval = setInterval(gmailMessagePull, 30000, req);
        }

        if(user.twitterAccessToken !== ""){

          setTimeout(function() {
            console.log('first 10 secs');
            twitterPull(req);

            tweetPollingInterval = setInterval(twitterPull, 90000, req);

          }, 10000);
        }


        if(user.slackToken !== ""){
          startRTM(user.slackToken);
        }
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
  req.body.gmailAccessToken="";
  req.body.gmailRefreshToken="";

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

function stopSlackRTM(){
  console.log(SLACK_RTM_EVENTS.MESSAGE);
  console.log(SLACK_CLIENT_EVENTS.RTM.AUTHENTICATED);
  console.log(rtm);
  rtm.removeAllListeners(SLACK_RTM_EVENTS.MESSAGE);
  rtm.removeAllListeners(SLACK_CLIENT_EVENTS.RTM.AUTHENTICATED);
  rtm.removeAllListeners(SLACK_CLIENT_EVENTS.RTM_CONNECTION_OPENED);
  rtm.removeAllListeners(SLACK_RTM_EVENTS.CHANNEL_CREATED);
  rtm.disconnect('', undefined);
  rtm = undefined;
}

app.post("/logoutSlack", function(req, res){

  console.log("in logoutSlack");
  console.log(req.body.user);
  User.findOneAndUpdate({_id:req.body.user._id}, {slackToken:""}, {new:true},
    function(err, doc){
      if(err){
        console.log("there was an error");
        return res.status(404).send(err);
      }
      else{
        console.log("user logged out of slack");
        console.log(doc);
        stopSlackRTM();
        req.user.slackToken = "";
        return res.send(doc);
      }

    }
  );

});

function startRTM(accessToken){
  //console.log("startRTM");
  //console.log("accessToken is: "+accessToken);
  rtm = new RtmClient(accessToken,{logLevel:'error'});
  rtm.start();

  rtm.on(SLACK_RTM_EVENTS.MESSAGE, function(message){
    console.log(message);
    if(message.type==="message" && (userSlackId !== undefined && userSlackId !== message.user)){

      var user = search.binarySearch(slackUsers, message.user);
      var channel = search.binarySearch(slackChannels, message.channel);
      pusher.trigger('slack','message', {user:user,channel:channel,text:message.text});
    }

  });

  rtm.on(SLACK_RTM_EVENTS.CHANNEL_CREATED, function(message){
    console.log("channel created");
    console.log(message);
    if(message.type=== "channel_created" && message.channel.is_channel){
      slackChannels.push({id:message.channel.id,name:message.channel.name});
      console.log(slackChannels);
      slackChannels = sorts.insertionSort(slackChannels);
      console.log(slackChannels);
    }
  });


  rtm.on(SLACK_CLIENT_EVENTS.RTM.AUTHENTICATED, function(startdata){
    console.log("authenticated");
    //console.log(startdata.users);
    slackUsers = [];
    slackChannels = [];
    userSlackId = startdata.self.id;
    for(var i = 0; i < startdata.users.length; i++){
      if(!startdata.users[i].deleted){
        slackUsers.push({id:startdata.users[i].id, name: startdata.users[i].name});
      }
    }

    for(var j = 0; j < startdata.channels.length; j++){
      if(startdata.channels[j].is_member){
        slackChannels.push({id:startdata.channels[j].id, name: startdata.channels[j].name});
      }
    }
    //console.log("slackUsers: ", slackUsers.length);
    slackUsers = sorts.mergeSort(slackUsers);
    //console.log("slackUsers: ", slackUsers.length);

    //console.log("slackUsers: ", slackChannels.length);
    slackChannels = sorts.mergeSort(slackChannels);
    //console.log("slackUsers: ", slackChannels.length);

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
    scope: 'https://www.googleapis.com/auth/gmail.readonly', // If you only need one scope you can pass it as string
    approval_prompt: 'force'
  });

  console.log(url);
  res.send(url);

});


function gmailMessagePull(req){

  gmail.users.messages.list({
    q: "is:unread",
    userId: 'me'
  }, function(err, response) {

    console.log("AFTER MESSAGE REQUEST");
    if(err){
      console.log(err);
      if(err.code == 401){
        oauth2Client.refreshAccessToken(function(err, tokens) {
          // your access_token is now refreshed and stored in oauth2Client
          // store these new tokens in a safe place (e.g. database)

          User.findOneAndUpdate({username:req.user.username},{gmailRefreshToken:tokens.refresh_token, gmailAccessToken:tokens.access_token},{new:true},
            function(err, doc){
              if(err){
                console.log(err);
              }
              else{
                console.log(doc);
                req.user.gmailRefreshToken = tokens.refresh_token;
                req.user.gmailAccessToken = tokens.access_token;
              }
            });
        });
      }
    }else{
      console.log(response);

      var counter = 0;
      var messageArray = [];

      if(response.messages === undefined){
        messageArray.push({
          snippet: 'No unread emails..',
          fromEmail: ''
        });

        pusher.trigger('gmail','unreadMail', messageArray);
      }else{
        var len = response.messages.length;

        console.log(len);
        for(var i = 0; i < len; i++){

          console.log("in for loop %s", i);
          gmail.users.messages.get({
            'userId': 'me',
            'id': response.messages[i].id
          }, function(err, response){

            console.log("AFTER MESSAGE ID REQUEST");
            if(err){
              console.log(err);
            }else {
              console.log(response.snippet);

              for(var j = 0; j < response.payload.headers.length; j++){
                if(response.payload.headers[j].name === "From"){
                  console.log("FROM");
                  console.log(response.payload.headers[j].value);

                  messageArray.push({
                    snippet: response.snippet,
                    fromEmail: response.payload.headers[j].value
                  });
                }
              }

              counter++;
              if(counter >= len){
                console.log("PUSH TO ANGULAR");
                pusher.trigger('gmail','unreadMail', messageArray);
              }
            }
          });
        }
      }

    }
  });
}




app.get('/oauthcallback', function(req, res){

  console.log('/oauthcallback');
  console.log(req.query.code);

  oauth2Client.getToken(req.query.code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    console.log("HELLO");


    if(req.user.gmailAccessToken !== ""){
      res.redirect("/");
    }else{
      if(!err) {
        oauth2Client.setCredentials(tokens);

        console.log(tokens);
        console.log(tokens.access_token);
        User.findOneAndUpdate({username:req.user.username},{gmailRefreshToken:tokens.refresh_token, gmailAccessToken:tokens.access_token},{new:true},
          function(err, doc){
            if(err){
              console.log(err);
              return res.redirect("/");
            }
            else{
              console.log(doc);
              req.user.gmailRefreshToken = tokens.refresh_token;
              req.user.gmailAccessToken = tokens.access_token;

              pollingInterval = setInterval(gmailMessagePull, 30000, req);

              return res.redirect("/");
            }
          });
      }
    }


  });

});



app.get('/gmailLogout', function(req, res){
  User.findOneAndUpdate({username:req.user.username},{gmailRefreshToken:"", gmailAccessToken:""},{new:true},
    function(err, doc){
      if(err){
        console.log(err);
        return res.redirect("/");
      }
      else{
        console.log(doc);
        req.user.gmailRefreshToken = "";
        req.user.gmailAccessToken = "";

        clearInterval(pollingInterval);
        res.status(200).send(doc);
      }
    });
});


app.get('/twitterAuth', function(req, res){

  console.log("/twitterAuth");

  if(req.user.twitterRequestToken !== ""){
    console.log("twitter already has a token");
    res.redirect("/");
  }else{
    console.log("twitter getrequesttoken");
    twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
      if (error) {
        console.log("Error getting OAuth request token : " + error);
      } else {
        console.log("getting twitter access token");

        //store token and tokenSecret somewhere, you'll need them later; redirect user
        User.findOneAndUpdate({username:req.user.username},{twitterRequestToken: requestToken, twitterRequestTokenSecret: requestTokenSecret},{new:true},
          function(err, doc){
            if(err){
              console.log(err);
              return res.redirect("/");
            }
            else{
              console.log(doc);
              req.user.twitterRequestToken = requestToken;
              req.user.twitterRequestTokenSecret = requestTokenSecret;

              var url2 = twitter.getAuthUrl(req.user.twitterRequestToken);
              res.send(url2);

            }
          });
      }
    });
  }
});


function twitterPull(req){

  var twitterArray = [];
  var counter = 0;

  console.log("Twitter Pull");
  twitter.getTimeline('home_timeline', {
    count: 5
  }, req.user.twitterAccessToken, req.user.twitterAccessTokenSecret, function(error, data, response) {
    if (error) {
      // something went wrong
      console.log("ERRRRRRROOOORRRRRR in get timeline");
      console.log(error);
    } else {
      console.log("SUCCESSSSSSSSSSSSS in get timeline");
      // data contains the data sent by twitter

      var len = data.length;
      for(var i = 0; i < len; i++){

        console.log("//////////////////////////////////////////////////////////");
        twitterArray.push({
          name: data[i].user.name,
          screen_name: '@'+data[i].user.screen_name,
          text: data[i].text,
          image: data[i].user.profile_image_url_https,
          created_at: data[i].created_at
        });

        counter++;
        if(counter >= len){
          console.log("PUSH TO ANGULAR");
          console.log(twitterArray);
          pusher.trigger('twitter','tweets', twitterArray);
        }
      }
    }
  });


}

app.get('/twitterAuthCallback', function(req, res){
  console.log('/twitterAuthCallback');

  console.log(req.query);

  twitter.getAccessToken(req.user.twitterRequestToken, req.user.twitterRequestTokenSecret, req.query.oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
    if (error) {
      console.log(error);
    } else {
      //store accessToken and accessTokenSecret somewhere (associated to the user)
      //Step 4: Verify Credentials belongs here
      User.findOneAndUpdate({username:req.user.username},{twitterAccessToken: accessToken, twitterAccessTokenSecret: accessTokenSecret},{new:true},
        function(err, doc){
          if(err){
            console.log(err);
            return res.redirect("/");
          }
          else{
            console.log(doc);
            req.user.twitterAccessToken = accessToken;
            req.user.twitterAccessTokenSecret = accessTokenSecret;


            console.log("------------BEFORE GETTIMELINE");
            twitter.getTimeline('home_timeline', {
              count: 5
            }, req.user.twitterAccessToken, req.user.twitterAccessTokenSecret, function(error, data, response) {
                if (error) {
                  // something went wrong
                  console.log("ERRRRRRROOOORRRRRR in get timeline");
                  console.log(error);
                  return res.redirect("/");
                } else {
                  console.log("SUCCESSSSSSSSSSSSS in get timeline");
                  // data contains the data sent by twitter


                  console.log("in twitter callback with firstCall = 1");
                  //twitterPull(req);

                  setTimeout(function() {
                    console.log('first 10 secs');
                    twitterPull(req);

                    tweetPollingInterval = setInterval(twitterPull, 90000, req);

                  }, 10000);

                  return res.redirect("/");
                }
              })
          }
        });

    }
  });

});


app.get('/twitterLogout', function(req, res){

  console.log('/twitterLogout');
  User.findOneAndUpdate({username:req.user.username},{twitterAccessToken:"", twitterAccessTokenSecret:"",twitterRequestToken:"", twitterRequestTokenSecret:""},{new:true},
    function(err, doc){
      if(err){
        console.log(err);
        return res.redirect("/");
      }
      else{
        console.log(doc);
        console.log("Clearing all user twitter tokens");
        req.user.twitterAccessToken = "";
        req.user.twitterAccessTokenSecret = "";
        req.user.twitterRequestToken = "";
        req.user.twitterRequestTokenSecret = "";

        clearInterval(tweetPollingInterval);
        res.status(200).send(doc);
      }
    });
});









app.post('/logout',function(req, res){
  console.log("@#$%^&*&^%$#^&*(*&^%$$&^%$#######################");
  if(rtm !== undefined){
    stopSlackRTM();
  }
  req.logout();
  req.user = undefined;
  console.log("req.user is: ",req.user);
  res.status(200).send("logout success");
});


app.listen(PORT, function(){
  console.log("listening on ", PORT);
  mongoose.connect('mongodb://heroku_80c4pl5t:1pkn0mmchnqm34rf4c6lgkruf7@ds051720.mlab.com:51720/heroku_80c4pl5t');
  //mongoose.connect('mongodb://localhost/onemessaging');
});
