<?php
include "../settings/settings.php";

mysql_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD);
@mysql_select_db(COBI_MYSQL_PASSWORD) or die( "Unable to select database");

				      

// Create user table
//  uid, name, email, type
$userQ = "CREATE TABLE users (uid varchar(32), name varchar(128), email varchar(128), type varchar(32))";
 mysql_query($userQ);
  echo mysql_error();

// Create transactions table
$transQ = "CREATE TABLE transactions (id MEDIUMINT NOT NULL AUTO_INCREMENT, uid varchar(32), type varchar(32), data text, previous text, PRIMARY KEY (id))"; 				      
				      mysql_query($transQ)
echo mysql_error();

// Create Schedule Table
// date, time, room, sessionID

$schedQ = "CREATE TABLE schedule (date varchar(128), time varchar(128), room varchar(128), id varchar(32), locked tinyint(1))";
mysql_query($schedQ);
echo  mysql_error();


 // // Create Session Table
 // id, chairAffiliations, chairs, coreCommunities, date, endTime, featuredCommunities, hasAward, hasHonorableMention,  notes, room, submissions, time, title, type, scheduled?

 $sessionQ = "CREATE TABLE session (id varchar(128), date varchar(128), time varchar(128), endTime varchar(128), chairAffiliations varchar(128), chairs text, coreCommunities text, featuredCommunities text, hasAward tinyint(1), hasHonorableMention tinyint(1), notes text, room varchar(128), submissions text, title text, type varchar(128), scheduled tinyint(1))";
 mysql_query($sessionQ);
 echo mysql_error();
 
// // Create Author Table
// author key, affiliations, email, firstName, lastName, middleName, submissions
// $authorQ = "CREATE TABLE author (authorKey varchar(128), affiliations text, email varchar(128), firstName varchar(128), lastName varchar(128), middleName varchar(128), submissions text)";
// mysql_query($authorQ);
// echo mysql_error();

 // // Create Entity Table
 // id, abstract, acmLink, authors, bestPaperAward, bestPaperNominee, cAndB, contactEmail, contactFirstName, contactLastName, coreCommunities, featuredCommunities, keywords, programNumber, session, title, type

  $entityQ = "CREATE TABLE entity (id varchar(128), abstract text,
  acmLink varchar(128), authors text, bestPaperAward tinyint(1),
  bestPaperNominee tinyint(1), cAndB text, contactEmail varchar(128),
  contactFirstName varchar(128), contactLastName varchar(128),
  coreCommunities text, featuredCommunities text, keywords text,
  programNumber varchar(128), session text, title text, type
  varchar(128))";

   mysql_query($entityQ); 
   echo mysql_error();

mysql_close();

?>