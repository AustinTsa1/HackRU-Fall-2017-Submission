var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');

var User = require('./user');
var Recording = require('./recording');

var passport = require('passport');
var flash    = require('connect-flash');

app.use(express.static('public'));

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database');

var twilio = require('twilio');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./localStrategy')(passport); // pass passport for configuration

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'callrecorder' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.get('/', function(req, res) {
    res.render('index.ejs', {loggedIn: req.isAuthenticated()}); // load the index.ejs file
});

app.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') }); 
});

app.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
});

app.get('/profile', isLoggedIn, function(req, res) {

    res.render('profile.ejs', {
        user : req.user
    });
});

// RECORDINGS
app.get('/recordings', isLoggedIn, function(req, res) {
   Recording.find({
        number: req.user.local.phone
    }, function(err, recordings) {
        res.render('recordings.ejs', {
            user : req.user,
            recordings
        });
	});
});

app.get('/logout', function(req, res) {
    req.logout();
    if (!req.user) 
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.redirect('/');
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.post('/signup', passport.authenticate('local-signup', {
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}), function(req, res) {
  if (req.isAuthenticated()) {
    User.findOne({
      "local.email": req.user.local.email
    }, function(err, user) {
      if (err) {
        console.log("Err: " + err);
        return;
      }
      user.local.phone = req.body["phone"];
      user.save(function(err) {
                    if (err)
                        throw err;
                });
      res.redirect('/');
    });
  }
});

// Returns TwiML which prompts the caller to record a message 
app.post('/record', (request, response) => {
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.twiml.VoiceResponse();

  /*console.log("Dialing...");
  var dial = twiml.dial();
  dial.conference({waitUrl: "", record: "record-from-start", recordingStatusCallback: "/recordDone", "endConferenceOnExit": true}, "test");
*/

  twiml.record({action: '/recordDone', timeout: 20, maxLength: 3600, trim: "do-not-trim", transcribe: true, transcribeCallback: "/transcriptionDone"});
  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());

});

// Returns TwiML which prompts the caller to record a message 
app.post('/recordDone', (request, response) => {
  console.log("RECORDING AT: " + request.body.RecordingUrl);
  console.log("RECORDING FROM: " + request.body.From);
  response.writeHead(200, {'Content-Type': 'text/xml'});
  response.end("<success />");


  Recording.findOne({
    sid: request.body.RecordingSid
  }, function(err, recording) {
    if (recording == null) {
      var recording = new Recording();
      recording.sid = request.body.RecordingSid;
      recording.number = request.body.From;
      recording.read = false;
      recording.date = Date.now()
    }

    recording.url = request.body.RecordingUrl;

    recording.save(function(err) {
        if (err)
            throw err;
        console.log("Saved to DB.");
    });
  });
    
});

// Returns TwiML which prompts the caller to record a message 
app.post('/transcriptionDone', (request, response) => {
  console.log("TRANSCRIPTION: " + request.body.TranscriptionText);
  console.log("TRANSCRIPTION FROM: " + request.body.From);
  response.writeHead(200, {'Content-Type': 'text/xml'});
  response.end("<success />");

  Recording.findOne({
    sid: request.body.RecordingSid
  }, function(err, recording) {

    if (recording == null) {
      recording = new Recording();
      recording.sid = request.body.RecordingSid;
      recording.number = request.body.From;
      recording.read = false;
      recording.date = Date.now()
    }
      recording.transcription = request.body.TranscriptionText;

      recording.save(function(err) {
          if (err)
              throw err;
          console.log("Saved to DB.");
      });

  })

});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// launch ======================================================================
app.listen(port);
console.log('Listening on port: ' + port);
