#!/usr/bin/env node
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , util = require('util')
  , redis = require('redis')
  , db = redis.createClient();


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/France', function(req,res) {
    db.keys('France*',function(e,r){
        if (e) res.send('Error: '+e);
        else res.send(r);
    })
});

app.get('/unit',function(req,res) {
    db.hgetall("France/V-Corps:19/149:3",function(e,r){
        if (e) res.send('Error: '+e);
        else res.send(r);
    })
});


// Get the game name
if (process.argv.length >= 3) {
    // clear the redis db

    // Load the game
    game = require('./game');
    use_db = 0;
    if (process.argv.length > 3 && process.argv[3] == '-init') {
        use_db = db;
        console.log('Initialising Database');
    } else {
        console.log('Database will NOT be written to');
    }

    game.load(process.argv[2],use_db);

    // All good - fire up the web server
    port = 3000;
    if (game.port) {
        port = game.port;
    }
    
    http.createServer(app).listen(port, function(){
        console.log("Express server listening on port " + port);
    });

    if (use_db) {
        console.log('ORBAT Parses OK - Database re-initialised');
    } else {
        console.log('ORBAT Parses OK - Database NOT written to');
    }
   
} else {
    console.log('Usage: node app.js <name-of-game> (-init to initialise the database)');
}

