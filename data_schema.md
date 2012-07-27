name:   game
type:   HASH
fields: [ filename, name, year, port ]
desc:   Overview of the current game loaded into the current database

name:   tables
type:   SET
desc:   List of tables being played in the current game

name:   table:<table_name>
type:   HASH
fields: [ attacker, defender ]
desc:   A description of the table, who is the attacker and who is the defender

name:   corps:<table_name>:<side_name>
type:   SET
desc:   List of Corps that are controlled by a side for a given table. 
        Corps names are in the format   Country/Corps-Name

name:   <corps_name>
type:   SET
desc:   List of Divisions in that Corps. Note that the Corps name is 
        in the format Countr/Corps-Name, so similar numbered corps from different nations do not clash

name:   <corps_name>:<UID>
type:   HASH
fields: [ name,type,morale,eliteness,firepower,size,ammo,fatigue,d-marks,c-marks,losses,cp,formation,position ] (infantry) 
        [ name,type,morale,eliteness,firepower,gun_class,calibre,size,ammo,fatigue,d-marks,c-marks,losses,cp,formation,postion ] (arty)
        [ name,type,morale,eliteness,firepower,size,ammo,fatigue,blown,battlemad,d-marks,c-marks,losses,move,battle,cp,formation,position] (cav)

desc:   Details for individual unit (Battalion / Squadron / Battery) within a Corps.
        Note that the Corps name is in the format Country/Corps-Name,
        and the UID is in the format DivisionNumber/UnitID




desc:   List of name: table:<name of table>
