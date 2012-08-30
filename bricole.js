#! /usr/bin/env nodemon
//
// La Node Bricole, a la baionette

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
  var ip = req.connection.remoteAddress;
  if (ip == '127.0.0.1') {
      console.log('Connection from umpire console');
  } else {
        console.log('Connection from',req.connection.remoteAddress);
  }

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

// Get the game from redis
var game;
db.hgetall('Game',function(e,r){
    if (e) { 
        console.log('Error:',e); 
    } else {
        game = r;
        console.log('Loaded game:',game)
    
        // All good - fire up the web server
        port = 3000;
        if (game.port) {
            port = game.port;
        } else {
            console.log(('WARNING: game data must include a port to run the game on. No Port found, defaulting to 3000').red);
        }
        console.log('Starting server on port',port);
        var server = http.Server(ss.http.middleware);
        server.listen(port);
        ss.start(server);

        // Send a message every 6 seconds
        setInterval(ss.publish.all('tick','tickage'),6000);
    }
});


