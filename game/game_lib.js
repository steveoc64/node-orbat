// Load a game

exports.unit_states = require('./unit_states.json');
exports.order_types = require('./order_types.json');

var base_ut = {
        "name": "undefined",
        "size": 0,
        "morale": "regular",
        "cp": 10,
        "firepower": "regular",
        "skirmish": 0,
        "shock": 0,
        "drill": "B",
        "formation": "line"
        };
 

exports.load = function(req_filename,db) {
    // Load the game
    var filename = './'+req_filename+'.json';
    console.log('Loading Game: ', filename);
    game = require(filename);
    this.filename = filename;

    console.log('Game: ',game.name);
    console.log('Year: ',game.year);
    console.log('Date: ',game.date,game.startTime);
    console.log('Game Time: ',game.gameTime);

    if (db) {
        db.flushall();
        db.hmset('Game'
                ,'filename',filename
                ,'name',game.name
                ,'year',game.year
                ,'date',game.date
                ,'startTime',game.startTime
                ,'gameTime',game.gameTime
                ,'port',game.port);
    }

    game.tables.forEach(function(table,table_index,table_array) {

        console.log("========= Game Tables =========");
        console.log("Table:      ",table.name);
        console.log("Map Size:   ",table.map.size_x,",",table.map.size_y);

        if (db) { 
            db.sadd('Tables',table.name);
            db.hmset('Table:'+table.name
                ,'attacker',table.attacker.name
                ,'defender',table.defender.name
                ,"size_x",table.map.size_x
                ,"size_y",table.map.size_y);
        }

        // Create the Map: record for the objectives on this table
        table.map.objectives.forEach(function(objective,obj_index,obj_array) {
            console.log("Objective: ",objective.name);
            console.log("Desc: ",objective.desc);
            console.log("GridLocation: ",objective.x,",",objective.y);
            console.log("UT: ",objective.ut);
            console.log("Cover: ",objective.cover);
            console.log("Value: ",objective.value);

            if (db) {
                db.sadd("Objectives:"+table.name,objective.name);
                db.hmset("Map:"+table.name+':'+objective.name
                    ,"desc",objective.desc
                    ,"x",objective.x
                    ,"y",objective.y
                    ,"value",objective.value
                    ,"cover",objective.cover);
                
                // Now create the grid entry for this objective .. bottom right corner is 1,1
                var grid_x = Math.floor(1.0 + objective.x);
                var grid_y = Math.floor(1.0 + objective.y);
                db.hmset("Grid:"+table.name+':'+grid_x+','+grid_y
                    ,"ut",objective.ut
                    ,"objective",objective.name);

                // Now fill in the blank parts of the map
                grid_x = grid_y = 1;
                while (grid_x <= table.map.size_x) {
                    while (grid_y <= table.map.size_y) {
                        var rand_num = Math.random();
                        var rand_ut = "rolling";
                        var num_variable_terrains = table.map.terrain.length;
                        if (rand_num > table.map.rolling) {
                            // Not rolling, so pick a terrain type from the list of allowed tyoes for this map
                            rand_num = Math.floor(Math.random()*num_variable_terrains);
                            rand_ut = table.map.terrain[rand_num];
                            console.log('there are',num_variable_terrains,'in array',table.map.terrain,'and the',rand_num+'th','element is',rand_ut);
                        }
                        var grid_key = "Grid:"+table.name+':'+grid_x+','+grid_y;
                        db.hsetnx(grid_key,"ut",rand_ut);
                        grid_y++;
                    }
                    // next row
                    grid_x++;
                    grid_y=1;
                }
            }
        });


        // Load Attacker OOBs for this table
        console.log("-------------------------------------------------------");
        console.log("Attacker: ",table.attacker.name);
        game.tables[table_index].attacker_corps = new Array(table.attacker.corps.length);
        table.attacker.corps.forEach(function(corps_data,index,array) {
            console.log(corps_data);
            load_corps(game,table,table_index,'A',corps_data,index,array,db);
        });
        // Load Defender OOBs for this table
        console.log("-------------------------------------------------------");
        console.log("Defender: ",table.defender.name);
        game.tables[table_index].defender_corps = new Array(table.defender.corps.length);
        table.defender.corps.forEach(function(corps_data,index,array) {
            load_corps(game,table,table_index,'D',corps_data,index,array,db);
        });

        console.log("-------------------------------------------------------");

    }); // for each table

    // commit changes to redis
    if (db) {
        db.save();
    }

    return this;
}

load_corps = function(game,table,table_index,attacker_defender,corps_data,index,array,db) {
            // declare vars in scope
            var corps, bn_count, bty_count, sq_count;

            if (db) {
                if (attacker_defender == 'A') {
                    db.sadd('Corps:'+table.name+':'+table.attacker.name,corps_data.unit);
                } else {
                    db.sadd('Corps:'+table.name+':'+table.defender.name,corps_data.unit);
                }
            }

            // Load the appropriate unit types file
            var nation = corps_data.unit.split('/')[0];
            var unit_types = require('../OOB/'+game.year+'/'+nation+'/unit_types.json');

            // Load the OOB file
            var corps = require('../OOB/'+game.year+'/'+corps_data.unit+'.json');
            if (attacker_defender == 'A') {
                game.tables[table_index].attacker_corps.push(corps);
            } else {
                game.tables[table_index].defender_corps.push(corps);
            }

            if (db) {
                // Create the Corps record
                db.hmset(corps_data.unit
                    ,"commander",corps.commander
                    ,"prof_skill",corps.prof_skill
                    ,"inspiration",corps.inspiration
                    ,"x", corps_data.x
                    ,"y", corps_data.y
                    ,"deploy", corps_data.deploy);
    
                // Create initial orders for the Corps
                db.hmset('CorpsOrders:'+corps_data.unit
                    ,"time",0
                    ,"order","defend"
                    ,"objective","current ground"
                    ,"duration",0
                    ,"pending_time",0
                    ,"pending_order",""
                    ,"pending_objective","");
            }

            console.log ("\t",corps.name, "(", corps.commander, ")");
            corps.divisions.forEach(function(division,div_index,div_array) {

                if (db) {
                    db.sadd(corps_data.unit+':Divisions',division.name);
  
                    // Create the Division record
                    db.hmset(corps_data.unit+':'+division.uid
                        ,"name", division.name
                        ,"eliteness", division.morale
                        ,"morale", "good"
                        ,"discipline", division.discipline
                        ,"initiative", division.initiative
                        ,"commander", division.commander
                        ,"command_rating", division.command_rating
                        ,"inspiration", division.inspiration
                        ,"campaign_fatigue", 0
                        ,"cil", 0
                        ,"position", "reserve"
                        ,"impetus", 0
                        ,"order", "reserve"
                        ,"objective", "none"
                        ,"engaged", 0
                        ,"deployment", corps_data.deploy  
                        ,"losses", 0
                        ,"caps_used", 0
                    );
                    
                    // Create initial orders for the Division
                    db.hmset('Orders:'+corps_data.unit+':'+division.uid
                            ,"time",0
                            ,"order","reserve"
                            ,"objective",""
                            ,"duration",0
                            ,"activation_progress",0
                            ,"pending_time",0
                            ,"pending_order",""
                            ,"pending_objective","");

                }

                // get the battalion count
                var bn_count = 0;
                if (typeof(division.infantry) != 'undefined') {
                    division.infantry.forEach(function(bn,i,a) {
                        bn_count += bn.size;

                        // get the appropriate unit type
                       var use_ut = base_ut;
                       unit_types.forEach(function(ut,i,a) {
                            if (ut.name.toLowerCase() == bn.type.toLowerCase()) {
                                use_ut = ut;
                            }
                        });
                        if (db) {

                            // Ammo 3=first shot, 2=fresh, 1=depleted, 0=exhausted
                            for (var i=1; i <= bn.size; i++) {
                                db.hmset(corps_data.unit+':'+bn.uid+':'+i
                                    ,'name',bn.name+' ('+i+' Bn)'
                                    ,'type',bn.type
                                    ,'morale','good'
                                    ,'eliteness',use_ut.morale
                                    ,'firepower',use_ut.firepower
                                    ,'size',use_ut.size
                                    ,'ammo',3
                                    ,'fatigue',0
                                    ,'d-marks',0
                                    ,'c-marks',0
                                    ,'losses',0
                                    ,'cp',use_ut.cp
                                    ,'cil',0
                                    ,'formation',use_ut.formation
                                    ,'position','reserve');
                            }
                        }
                    }); // for each infantry battalion
                }
                
                // get the artillery count
                var bty_count = 0;
                if (typeof(division.artillery) != 'undefined') {
                    division.artillery.forEach(function(bt,i,a) {
                        bty_count += bt.size;

                        // get the appropriate unit type
                       var use_ut = base_ut;
                       unit_types.forEach(function(ut,i,a) {
                            if (ut.name.toLowerCase() == bt.type.toLowerCase()) {
                                use_ut = ut;
                            }
                        });

                        if (db) {
                            // Ammo 3=first shot, 2=fresh, 1=depleted, 0=exhausted
                                db.hmset(corps_data.unit+':'+bt.uid
                                    ,'name',bt.name
                                    ,'type',bt.type
                                    ,'morale','good'
                                    ,'eliteness',use_ut.morale
                                    ,'firepower',use_ut.firepower
                                    ,'gun_class',use_ut.gun_class
                                    ,'calibre',use_ut.calibre
                                    ,'size',bt.size * 6
                                    ,'ammo',3
                                    ,'fatigue',0
                                    ,'d-marks',0
                                    ,'c-marks',0
                                    ,'losses',0
                                    ,'cp',use_ut.cp
                                    ,'cil',0
                                    ,'formation',use_ut.formation
                                    ,'position','reserve');
                        }
                    }); // for each battery
                }

                // get the cavalry count
                var sq_count = 0;
                if (typeof(division.cavalry) != 'undefined') {
                    division.cavalry.forEach(function(sq,i,a) {
                        sq_count += sq.size;

                        // get the appropriate unit type
                       var use_ut = base_ut;
                       unit_types.forEach(function(ut,i,a) {
                            if (ut.name.toLowerCase() == sq.type.toLowerCase()) {
                                use_ut = ut;
                            }
                        });

                        if (db) {
                            db.hmset(corps_data.unit+':'+sq.uid
                                ,'name',sq.name
                                ,'type',sq.type
                                ,'morale','good'
                                ,'eliteness',use_ut.morale
                                ,'firepower',use_ut.firepower
                                ,'size',sq.size
                                ,'ammo',3
                                ,'fatigue',0
                                ,'blown',0
                                ,'battlemad',0
                                ,'d-marks',0
                                ,'c-marks',0
                                ,'losses',0
                                ,'move',0
                                ,'battle',0
                                ,'cp',use_ut.cp
                                ,'cil',0
                                ,'formation',use_ut.formation
                                ,'position','reserve');
                        }
                    }); // for each cav division
                }

                var me_type = '';

                if (bn_count) {
                    if (sq_count) {
                        me_type = 'Mixed Division';
                    } else {
                        me_type = 'Infantry Division';
                    }
                } else {
                    if (sq_count) {
                        me_type = 'Cavalry Brigade';
                    } else if (bty_count) {
                        me_type = 'Grand Battery';
                    }
                }

                console.log('\t\t'+division.name,'('+division.commander+')');
                console.log("\t\t",me_type);
                if (bn_count) {
                    division.infantry.forEach(function(bn,i,a) {
                        console.log("\t\t\t",bn.name,' - ('+bn.size,'Bn)',bn.type);
                    });
                }
                if (sq_count) {
                    division.cavalry.forEach(function(sq,i,a) {
                        console.log("\t\t\t",sq.name,' - ('+sq.size,'Sqn)',sq.type);
                    });
                }
                if (bty_count) {
                    division.artillery.forEach(function(bty,i,a) {
                        console.log("\t\t\t",bty.name,' - ('+bty.size,'Bty)',bty.type);
                    });
                }
                console.log("\t\t\tTotaLs (",
                    bn_count,"Bn,",
                    sq_count,"Sq,",
                    bty_count,"Bty",")");
                console.log("\t\t\t-------------------------------");
 

            }); // for each Division in the Corps
}

