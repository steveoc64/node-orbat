name:   Game
type:   HASH
fields: [ filename, name, year, port ]
desc:   Overview of the current game loaded into the current database

--------------------------------------------------------------------------------

name:   Clients
type:   SET
desc:   Set of IP addresses connected to commander units

--------------------------------------------------------------------------------

name:   Tables
type:   SET
desc:   List of tables being played in the current game

--------------------------------------------------------------------------------

name:   Table:<table_name>
type:   HASH
fields: [ attacker, defender ]
desc:   A description of the table, who is the attacker and who is the defender

--------------------------------------------------------------------------------

name:   Corps:<table_name>:<side_name>
type:   SET
desc:   List of Corps that are controlled by a side for a given table. 
        Corps names are in the format   Country/Corps-Name

--------------------------------------------------------------------------------

name:   <corps_name>:Divisions
type:   SET
desc:   List of Divisions in that Corps. Note that the Corps name is 
        in the format Countr/Corps-Name, so similar numbered corps from different nations do not clash

--------------------------------------------------------------------------------

name:   <corps_name>
type:   HASH
fields: [ commander,prof_skill,inspiration ]
desc:   Details of the Corps

--------------------------------------------------------------------------------

name:   CorpsOrder:<corps_name>
type:   HASH
fields: [ time,order,objective,duration ]
desc:   Current active order for a Corps


--------------------------------------------------------------------------------

name:   Orders:<corps_name>:<UID>
type:   HASH
fields: [ time,order,objective,duration,activation_progress,pending_time,pending_order,pending_objective ]
desc:   Current active and pending order for an ME


--------------------------------------------------------------------------------

name:   <corps_name>:<UID>
type:   HASH
fields:
            Infantry
        [ name,type,morale,eliteness,firepower,size,ammo,fatigue,
         d-marks,c-marks,losses,cp,formation,position ]

            Artillery
        [ name,type,morale,eliteness,firepower,gun_class,calibre,size,
          ammo,fatigue,d-marks,c-marks,losses,cp,formation,postion ]

            Cavalry
        [ name,type,morale,eliteness,firepower,size,ammo,fatigue,blown,battlemad,
          d-marks,c-marks,losses,move,battle,cp,formation,position]

            Command Elements - Div HQ 
        [ name,eliteness,morale,discipline,initiative,commander,command_rating,position,impetus,
          inspiration,campaign_fatigue,cil,order,objective,engaged,deployment,losses,caps_used ]

desc:   Details for individual unit (Battalion / Squadron / Battery / HQ) within a Corps.
        Note that the Corps name is in the format Country/Corps-Name,
        and the UID is in the format DivisionNumber/UnitID

--------------------------------------------------------------------------------

