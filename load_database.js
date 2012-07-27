#!/usr/bin/env node
/**
 * Module dependencies.
 */

var http = require('http')
  , redis = require('redis')
  , ss = require('socketstream')
  , db = redis.createClient();

// Get the game name
if (process.argv.length >= 3) {
    // clear the redis db

    // Load the game
    game = require('./game/game_lib');
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
    var server = http.Server(ss.http.middleware);
    server.listen(port+1);
    ss.start(server);

    if (use_db) {
        console.log(('ORBAT Parses OK - Database re-initialised').red);
    } else {
        console.log(('ORBAT Parses OK - Database NOT written to').green);
    }
   
} else {
    console.log('Usage: node app.js <name-of-game> (-init to initialise the database)');
}

