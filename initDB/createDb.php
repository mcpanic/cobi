<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

// Create user table
//  uid, name, email, type
$userQ = "CREATE TABLE users (uid varchar(32), name varchar(128), email varchar(128), type varchar(32))";
mysqli_query($mysqli, $userQ);
echo mysqli_error($mysqli);

// Create transactions table
$transQ = "CREATE TABLE transactions (id MEDIUMINT NOT NULL AUTO_INCREMENT, uid varchar(32), type varchar(32), data text, previous text, localHash varchar(32), previousType varchar(32), timeAdded timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (id))"; 				      
mysqli_query($mysqli, $transQ);
echo mysqli_error($mysqli);

// Create Schedule Table
// date, time, room, sessionID
$schedQ = "CREATE TABLE schedule (date varchar(128), time varchar(128), room varchar(128), id varchar(32), locked tinyint(1), slotId varchar(32))";
mysqli_query($mysqli, $schedQ);
echo  mysqli_error($mysqli);

$initschedQ = "CREATE TABLE initial_schedule (date varchar(128), time varchar(128), room varchar(128), id varchar(32), locked tinyint(1), slotId varchar(32))";
mysqli_query($mysqli, $initschedQ);
echo  mysqli_error($mysqli);


// Create Session Table
// id, chairAffiliations, chairs, coreCommunities, date, endTime, featuredCommunities, hasAward, hasHonorableMention,  notes, room, submissions, time, title, type, scheduled?
$sessionQ = "CREATE TABLE session (id varchar(128), date varchar(128), time varchar(128), endTime varchar(128), chairAffiliations varchar(128), chairs text, coreCommunities text, featuredCommunities text, hasAward tinyint(1), hasHonorableMention tinyint(1), notes text, room varchar(128), submissions text, title text, scheduled tinyint(1), personas text, venue varchar(128))";
mysqli_query($mysqli, $sessionQ);
echo mysqli_error($mysqli);

$initsessionQ = "CREATE TABLE initial_session (id varchar(128), date varchar(128), time varchar(128), endTime varchar(128), chairAffiliations varchar(128), chairs text, coreCommunities text, featuredCommunities text, hasAward tinyint(1), hasHonorableMention tinyint(1), notes text, room varchar(128), submissions text, title text, scheduled tinyint(1), personas text, venue varchar(128))";
mysqli_query($mysqli, $initsessionQ);
echo mysqli_error($mysqli);

// Create Author Table
// author key, affiliations, email, firstName, lastName, middleName, submissions
$authorQ = "CREATE TABLE authors (authorId varchar(128), type varchar(128), id varchar(128), venue varchar(128), rank int, givenName text, middleInitial varchar(128), familyName text, email text, role varchar(128), primaryAff text, secondaryAff text)";
mysqli_query($mysqli, $authorQ);
echo mysqli_error($mysqli);

// create chair table
$chairQ = "CREATE TABLE sessionChairs (authorId varchar(128), type varchar(128), id varchar(128), venue varchar(128), rank int, givenName text, middleInitial varchar(128), familyName text, email text, role varchar(128), primaryAff text, secondaryAff text, affinity text)";
mysqli_query($mysqli, $chairQ);
echo mysqli_error($mysqli);

// Create Entity Table
// id, abstract, acmLink, authors, bestPaperAward, bestPaperNominee, cAndB, contactEmail, contactFirstName, contactLastName, coreCommunities, featuredCommunities, keywords, programNumber, session, title, type
$entityQ = "CREATE TABLE entity (id varchar(128), abstract text,
  acmLink varchar(128), authors text, bestPaperAward tinyint(1),
  bestPaperNominee tinyint(1), cAndB text, contactEmail varchar(128),
  contactFirstName varchar(128), contactLastName varchar(128),
  coreCommunities text, featuredCommunities text, keywords text,
  programNumber varchar(128), session varchar(128), title text, type
  varchar(128), subtype varchar(128))";
mysqli_query($mysqli, $entityQ); 
echo mysqli_error($mysqli);

$initial_entityQ = "CREATE TABLE initial_entity (id varchar(128), abstract text,
  acmLink varchar(128), authors text, bestPaperAward tinyint(1),
  bestPaperNominee tinyint(1), cAndB text, contactEmail varchar(128),
  contactFirstName varchar(128), contactLastName varchar(128),
  coreCommunities text, featuredCommunities text, keywords text,
  programNumber varchar(128), session varchar(128), title text, type
  varchar(128), subtype varchar(128))";
mysqli_query($mysqli, $initial_entityQ); 
echo mysqli_error($mysqli);

$mysqli->close();
?>