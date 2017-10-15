var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');

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

// =====================================
// HOME PAGE (with login links) ========
// =====================================
app.get('/', function(req, res) {
    res.render('index.ejs', {loggedIn: req.isAuthenticated()}); // load the index.ejs file
});

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
app.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') }); 
});


// process the login form
// app.post('/login', do all our passport stuff here);

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
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
        email: req.user.email
    }, function(err, recordings) {
        res.render('recordings.ejs', {
            user : req.user,
            recordings
        });
        console.log(recordings);
	    res.render('profile.ejs', {
	        user : req.user // get the user out of session and pass to template
	    });
	});
});

// =====================================
// LOGOUT ==============================
// =====================================
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
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// Returns TwiML which prompts the caller to record a message 
app.post('/record', (request, response) => {
  console.log("Recording...");
  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Hello. Please leave a message after the beep.');

  // Use <Record> to record and transcribe the caller's message
  twiml.record({transcribe: false, maxLength: 3000, action: '/recordDone', playBeep: false});

  // End the call with <Hangup>
  twiml.hangup();

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
