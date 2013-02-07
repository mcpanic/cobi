<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "settings.php";

if(count($argv) != 2 or $argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

// Form the schedule table
//schedule-2013-0-30-13-51-39.json
$scheduleFile = file_get_contents('schedule-2013-2-7-0-16-1.json');
//$scheduleFile = file_get_contents('schedule-2012-11-16-14-55-35.json');
$schedule = json_decode($scheduleFile, true);
$schedule = $schedule["rows"];

foreach ($schedule as $slot) {
  $slotId = $slot['id'];  
  $date = $slot['value']['day'];
  $time = $slot['value']['time'];
  $room = $slot['value']['room'];
  if($room == "242AB"){
    $room = "242A";
  }
  $id = $slot['value']['session'];
  
  $query = "INSERT INTO schedule (date, time, room, id, locked, slotId) VALUES ('$date', '$time', '$room', '$id', 0, '$slotId')"; 
  mysqli_query($mysqli, $query); 
  echo  mysqli_error($mysqli); 
}


// Form the entity table
$entityFile = file_get_contents('submissions-2013-0-29-3-26-59-unicode.json');
$entities = json_decode($entityFile, true);
$entities = $entities["rows"];
$awardHash = array();
$honorableHash = array();

foreach ($entities as $entity) {
  $eid = mysqli_real_escape_string($mysqli, $entity['id']); 
  $abstract = mysqli_real_escape_string($mysqli, $entity['value']['abstract']          );
  $acmLink   = "";
  // TODO  
  $authors             = mysqli_real_escape_string($mysqli, json_encode($entity['value']['authorList'])             );
    
  $note      = $entity['value']['notes']  ;
  if (strcasecmp($note, "Best Paper") == 0) {
    $awardHash[$entity['id']] = true;
    $bestPaperAward = 1;
  }else{
    $bestPaperAward = 0;
  }

  $bestPaperNominee = 0;
  if (strcasecmp($entity['value']['nomination'], "Best Paper") == 0) {
    $honorableHash[$entity['id']] = true;
    $bestPaperNominee = 1;
  }
  $cAndB               = mysqli_real_escape_string($mysqli, json_encode($entity['value']['cbStatement']));
  $contactEmail        = mysqli_real_escape_string($mysqli, $entity['value']['contactEmail']        );
  $contactFirstName    = mysqli_real_escape_string($mysqli, $entity['value']['contactAuthor']    );
  $contactLastName    = mysqli_real_escape_string($mysqli, $entity['value']['contactAuthor']    );
  $coreCommunities     = mysqli_real_escape_string($mysqli, json_encode($entity['value']['communities'])     );
  $featuredCommunities = mysqli_real_escape_string($mysqli, json_encode(array()));
  $keywords            = mysqli_real_escape_string($mysqli, json_encode($entity['value']['authorKeywords'])            );
  $programNumber       = "";
  $session             = mysqli_real_escape_string($mysqli, json_encode($entity['value']['session'])             );
  $title               = mysqli_real_escape_string($mysqli, $entity['value']['title']               );
  $type                = mysqli_real_escape_string($mysqli, $entity['value']['venue']                );
  $subtype                = mysqli_real_escape_string($mysqli, $entity['value']['subtype']                );
  
  $equery = "INSERT INTO entity (id, abstract, acmLink, authors, bestPaperAward, bestPaperNominee, cAndB, contactEmail, contactFirstName, contactLastName, coreCommunities, featuredCommunities, keywords, programNumber, session, title, type, subtype) VALUES ('$eid', '$abstract', '$acmLink', '$authors', '$bestPaperAward', '$bestPaperNominee', '$cAndB', '$contactEmail', '$contactFirstName', '$contactLastName', '$coreCommunities', '$featuredCommunities', '$keywords', '$programNumber', '$session', '$title', '$type', '$subtype')";
	
  mysqli_query($mysqli, $equery);
  echo  mysqli_error($mysqli);
}

// Form the session table
$sessionsFile = file_get_contents('sessions-2013-2-7-0-15-58.json');
//
//sessions-2012-11-16-14-55-33.json');
$sessions = json_decode($sessionsFile, true);
$sessions = $sessions["rows"];

foreach ($sessions as $session) {
  $sid = mysqli_real_escape_string($mysqli, $session['id']); 
  $timeslot = explode(" ", $session['value']['timeslot']);
  $sdate = mysqli_real_escape_string($mysqli, $timeslot[0]);
  $stime = mysqli_real_escape_string($mysqli, $timeslot[1]);

  $sroom = mysqli_real_escape_string($mysqli, $timeslot[2]);
  if($sroom == "242AB"){
    $sroom = "242A";
  }
  $title = mysqli_real_escape_string($mysqli, $session['value']['title']);
  $venue = mysqli_real_escape_string($mysqli, $session['value']['venue']);
  $chairAffiliations = "";
  $chairs = mysqli_real_escape_string($mysqli, json_encode(array()));

  $notes = "";
  if(array_key_exists("rank", $session['value'])){
    $notes = mysqli_real_escape_string($mysqli, $session['value']['rank']); 
  }

  $coreCommunities = mysqli_real_escape_string($mysqli, json_encode(array()));
  if(array_key_exists('communities', $session['value'])){
    $coreCommunities = mysqli_real_escape_string($mysqli, json_encode($session['value']['communities']));
  }
  $personas = "";
  if(array_key_exists('track', $session['value'])){
    $personas = mysqli_real_escape_string($mysqli, $session['value']['track']);
  }
  $featuredCommunities = mysqli_real_escape_string($mysqli, json_encode(array()));
  $hasAward = 0;
  $hasHonorableMention = 0;
  foreach ($session['value']['content'] as $paperContent){
    if(array_key_exists($paperContent, $honorableHash)){
      $hasHonorableMention = 1;
    }
    if(array_key_exists($paperContent, $awardHash)){
      $hasAward = 1;
    }
  }

  $submissionKeys = mysqli_real_escape_string($mysqli, trim(implode(",", $session['value']['content'])));

  // add session id to the submissions
  foreach ($session['value']['content'] as $paperContent){
    $equery = "UPDATE entity SET session='$sid' where id='$paperContent'";
    mysqli_query($mysqli, $equery);
    echo  mysqli_error($mysqli);
  }
  
  
  $squery = "INSERT INTO session (id, date, time, chairAffiliations, chairs, coreCommunities, featuredCommunities, personas, hasAward, hasHonorableMention, notes, room, submissions, title, venue, scheduled) VALUES ('$sid', '$sdate', '$stime', '$chairAffiliations', '$chairs', '$coreCommunities', '$featuredCommunities', '$personas', '$hasAward', '$hasHonorableMention', '$notes', '$sroom', '$submissionKeys', '$title', '$venue', 1)";
  mysqli_query($mysqli, $squery);
  echo  mysqli_error($mysqli);
}



/* /\* 	// Form the author table *\/ */
/* /\* 	// decided it's not needed! *\/ */
/* /\* 	// todo: note: don't insert same author twice? *\/ */
/* /\* 	foreach ($subdata['authors'] as $authorKey => $authordata) { *\/ */
/* /\* 	  $author = mysqli_real_escape_string($mysqli, $authorKey);  *\/ */
/* /\* 	  $affiliations = mysqli_real_escape_string($mysqli, json_encode($authordata['affiliations'])); *\/ */
/* /\* 	  $email = mysqli_real_escape_string($mysqli, $authordata['email']); *\/ */
/* /\* 	  $firstName = mysqli_real_escape_string($mysqli, $authordata['firstName']); *\/ */
/* /\* 	  $lastName = mysqli_real_escape_string($mysqli, $authordata['lastName']); *\/ */
/* /\* 	  $middleName = mysqli_real_escape_string($mysqli, $authordata['middleName']); *\/ */
/* /\* 	  $submissions = mysqli_real_escape_string($mysqli, json_encode($authordata['submissions'])); *\/ */

/* /\* 	  $aquery = "INSERT INTO author (authorKey, affiliations, email, firstName, lastName, middleName, submissions) VALUES ('$author', '$affiliations', '$email', '$firstName', '$lastName', '$middleName', '$submissions')"; *\/ */
/* /\* 	  mysqli_query($mysqli, $aquery); *\/ */
/* /\* 	  echo  mysqli_error($mysqli); *\/ */
/* /\* 	} *\/ */
/*       } */
/*     } */
/*   } */
/* } */

// duplicate the tables into initial tqables
/* $query = "CREATE TABLE initial_schedule LIKE schedule"; */
/* mysqli_query($mysqli, $query); */
/* echo  mysqli_error($mysqli); */

$query = "INSERT initial_schedule SELECT * FROM schedule";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

// duplicate the tables into initial tqables
/* $query = "CREATE TABLE initial_session LIKE session"; */
/* mysqli_query($mysqli, $query); */
/* echo  mysqli_error($mysqli); */

$query = "INSERT initial_session SELECT * FROM session";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

/* // duplicate the tables into initial tqables */
/* $query = "CREATE TABLE initial_entity LIKE entity"; */
/* mysqli_query($mysqli, $query); */
/* echo  mysqli_error($mysqli); */

$query = "INSERT initial_entity SELECT * FROM entity";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$mysqli->close();

?>