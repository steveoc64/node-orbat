TODO

Fri Aug 17 19:00:33 CST 2012
============================
** Add Grid and Objectives to each table
- Generate Victory point scores for each objective per turn
- Generate random terrain

- umpire console :
    - Show game details
    - Start Game
    - Show current time / weather
    - Show tables
    - View table
    - Show players and commands
    - New player attaches - popup icon for new player, assign to command
    - Advance turn
    - Disconnect player
    - Auto timeout player

- player console :
    - Connect in 
    - If assigned:
        - Jump to content screen
        - Show OOB
        - Show time
        - View table
    else:
        - Show login screen
    
- Apply twitter bootstrap

====================================================================================================

Sun Jul 29 10:24:50 CST 2012
============================
- create master console app using flatiron
- create client MVC app using emberjs

- client connects:
    - if registered, direct them to the player page
    - if not registered, tell console, and allow umpire to connect them (use generated token)

- create AI Div commander using flatiron
- create AI Corps commander using flatiron
- connect AI Div / Corps commander to commands

- player console :
    - show OOB
    - issue order to Corps
    - issue order to ME
    - lock
    - show GT movement event
    - 

- umpire console :
    - disconnect client
    - set date/time in game
    - generate GT movement orders
    - define engagements
    - cancel engagements

Paint:
    - flags
    - primer all
    - basecoat all
    - base up all Bn in holding area

Orders:
    - Lancashire, round off the the French, get some Prussians


Thu Jul 26 22:27:06 CST 2012
=============================
    - Load OOB as a library
    - populate redis with:
        - battalion state *
        - squadron state *
        - battery state *
        - division state *
        - corps state *
        - division orders *
        - corps orders *

    - create game play application, using socketstream *

Sun Jul 22 13:28:17 CST 2012
Client assignment to commander
==============================
Client connects, grab IP address and lookup commander.
if (no commander) {
    tell console about new connectiom, list available commands.
    select command, assign client to command.
    refresh client with commander view.
}

Console - deselect client from commander.
    - refresh client, no longer commander.


Game Day   22 Jul 2012
- Setup & play a series of mini battles using R&E:
    1) French vs Prussian, battalion
    2) French vs Prussian, regiment
    3) French vs Prussian, brigade
    4) French vs Prussian, Division


UI:
    - player can view the overall current disposition of all units
    - player sets intentions against units
    - each intention is displayed with a progress bar (real time movement)
    - opposition can see the current intention of enemy units that are engaged

Movement :
    - GT moves : (large stick)
        - extended campaign column = 5
        - regular campaign column = 4
        - closed up campaign column = 3
        - deploying = 0
        - brigade out = 1 (and deploying)
        - deployed = 2

        Big stick for open terrain / road
        Small stick for rough
        whole move for in/out of heavy
        small stick + wedge = 1 

        Expand / contract frontage cost = 1 per small stick

    - Tactical moves : (small stick)
        - lines = 1
        - columns = 2 or 1.5
        - square = .5
        - sk = 2
        - medium cav = 2, charge at 3
        - light cav = 3, charge at 4
        
Tactical deployment :
    width :
    1   - 3 lines + reserve
    2   - 2 lines + reserve
    3   - 1 line + reserve
