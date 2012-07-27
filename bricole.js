#! /usr/bin/env nodemon
//
// La Node Bricole

var http = require('http')
  , ss = require('socketstream')
  , redis = require('redis')
  , db = redis.createClient();

process.on('uncaughtException', function(err) { console.log(err); });

// Define a single-page client
ss.client.define('main', {
  view: 'app.html',
  css:  ['libs', 'app.styl'],
  code: ['libs', 'app'],
  tmpl: '*'
});

// Serve this client on the root URL
ss.http.route('/', function(req, res){
  res.serveClient('main');
})

ss.http.route('/key', function(req,res) {
    db.keys('*',function(e,r){
        if (e) res.send('Error: '+e);
        else res.send(r);
    })
});

ss.http.route('/unit',function(req,res) {
    db.hgetall("France/V-Corps:19/149:3",function(e,r){
        if (e) res.send('Error: '+e);
        else res.send(r);
    })
});

// Code Formatters
ss.client.formatters.add(require('ss-stylus'));

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env == 'production') ss.client.packAssets();

// Get the game name
if (process.argv.length >= 3) {
    // clear the redis db

    // Load the game
    game = require('./game/game_lib');
    game.load(process.argv[2],0);

    // All good - fire up the web server
    port = 3000;
    if (game.port) {
        port = game.port;
    }
    var server = http.Server(ss.http.middleware);
    server.listen(port);
    ss.start(server);
} else {
    console.log('Usage: node app.js <name-of-game> (-init to initialise the database)');
}

