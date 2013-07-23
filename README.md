cobi scheduling tool
======================

Directory structure
- p1.html: interface main HTML file
- backup: python script to dump the cobi database
- initDB: php scripts and json data files for loading all data into DB initally
- js: javascript files for all scheduling related operations
- php: php scripts for loading data to front end from db and changing db on scheduling operations
- pollDemo: API providing live feed of current schedule state
- settings: Database settings


To run from scratch
- Environment: we set up 2 DBs, for dev/production respectively. Which gets created/used is determined by settings/settings.php
- Setup: run "php initDB/createDb.php" to create user, transactions, schedule, session, author, and entity tables (authorsourcing data and sessionChairs handled manually at the moment).
- 

mysql --host=mysql.csail.mit.edu --user=cobi --password=su4Biha cobiDev