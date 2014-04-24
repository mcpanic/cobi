<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

if(count($argv) != 2 or $argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

define("AUTHORFILE", "CobiPeople.json");
define("ROLESFILE", "CobiRoles.json");
define("ENTITYFILE", "CobiPapers.json");
define("SESSIONFILE", "CobiSessions.json");
define("SCHEDULEFILE", "CobiSchedule.json");

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

clearTables($mysqli);
$PeoplePaperHash = createAuthorTable($mysqli);
$authorPaperHash = $PeoplePaperHash["authors"];
$chairSessionHash = $PeoplePaperHash["chairs"];

$paperSessionHash = createEntityTable($mysqli, $authorPaperHash);
createSessionTable($mysqli, $paperSessionHash, $chairSessionHash);
createScheduleTable($mysqli);
makeInitialTables($mysqli);

function clearTables($mysqli){
	 $query = "delete from initial_schedule";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
	 
	 $query = "delete from initial_session";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
	 
	 $query = "delete from initial_entity";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
	 
	 $query = "delete from schedule";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
	 
	 $query = "delete from session";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
	 
	 $query = "delete from entity";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
	 
	 $query = "delete from authors";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
	 
	 $query = "delete from sessionChairs";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
						
	 $query = "delete from transactions";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
}

function getPerson($people, $id){
  foreach ($people as $person){
    if($person['Key_PersonID'] == $id){
      return $person;
    }
  }
  return NULL;
}


function createAuthorTable($mysqli) {
	 // Create author table
	 $authorFile = file_get_contents(AUTHORFILE);
	 $allPeople = json_decode($authorFile, true);
	 $allPeople = $allPeople["data"];
	 $authorRoleFile = file_get_contents(ROLESFILE);
	 $allRoles = json_decode($authorRoleFile, true);
	 $allRoles = $allRoles["data"];

	 foreach ($allRoles as $pr) {
	   	   $person = getPerson($allPeople, $pr['PersonID']);
	   $authorId  = mysqli_real_escape_string($mysqli, $pr["PersonID"]);
	   $type      = mysqli_real_escape_string($mysqli, $pr["Entry"]);
	   $id        = mysqli_real_escape_string($mysqli, $pr["EntryID"]);
	   $rank      = mysqli_real_escape_string($mysqli, $pr["Priority"]);
	   $givenName = mysqli_real_escape_string($mysqli, $person["FirstName"]);
	   $middleInitial = "";
	   $familyName    = mysqli_real_escape_string($mysqli, $person["LastName"]);
	   $email         = "";
	   $venue         = "";
	   $role          = mysqli_real_escape_string($mysqli, $pr["Role"]);
	   $primary       =  mysqli_real_escape_string($mysqli, $person['Affiliation']);
	   $secondary     = "";
	   
	   $personData =  array(
				"id"            => $authorId,
				"givenName"     => $givenName,
				"middleInitial" => $middleInitial,
				"familyName"    => $familyName,
				"email"         => $email,
				"primary"       => $primary,
				"secondary"     => $secondary,
				"rank"          => $rank,
				"role" => $role);
	   
	   
	   if($pr["Entry"] == "Paper"){
	     $aquery = "INSERT INTO authors (authorId, type, id, venue, rank, givenName, middleInitial, familyName, email, role, primaryAff, secondaryAff) VALUES ('$authorId', '$type', '$id', '$venue', $rank, '$givenName', '$middleInitial', '$familyName', '$email', '$role', '$primary', '$secondary')";
	     mysqli_query($mysqli, $aquery); 
	     echo  mysqli_error($mysqli); 
	     $authorHash[$id][$authorId] = $personData;
	   }else{
	     // is a organizer, moderator, or discussant
	     $aquery = "INSERT INTO sessionChairs (authorId, type, id, venue, rank, givenName, middleInitial, familyName, email, role, primaryAff, secondaryAff, affinity) VALUES ('$authorId', '$type', '$id', '$venue', $rank, '$givenName', '$middleInitial', '$familyName', '$email', '$role', '$primary', '$secondary', '{}')";
	     mysqli_query($mysqli, $aquery); 
	     echo  mysqli_error($mysqli); 
	     $chairHash[$id][$authorId] = $personData;
	   }
	 }
	 return array("authors" => $authorHash,
		      "chairs" => $chairHash);
}


function getAuthors($authorHash, $id){
  $authorsData = array();
  if (array_key_exists($id, $authorHash)){
    foreach ($authorHash[$id] as $author){
      array_push($authorsData, $author);
    }
  }
  return $authorsData;
}

function createEntityTable($mysqli, $authorHash) {
  $entityFile = file_get_contents(ENTITYFILE);
  $entityData = json_decode($entityFile, true);
  $entityData = $entityData["data"];
  
  foreach ($entityData as $sub) {
    $id = mysqli_real_escape_string($mysqli, $sub["Key_PaperID"]);
    $abstract = mysqli_real_escape_string($mysqli, $sub["Abstract"]);
    $acmLink   = "";
    $authors = mysqli_real_escape_string($mysqli, json_encode(getAuthors($authorHash, $sub["Key_PaperID"])));
    $bestPaperNominee = 0;
    $bestPaperAward = 0;
    $cAndB = "";
    $contactEmail = "";
    $contactFirstName = "";
    $contactLastName = "";
    $coreCommunities = "[]"; // TODO
    $featuredCommunities = "[]"; // TODO
    $keywords = "[]"; // TODO
    $programNumber = "";
    $session             = mysqli_real_escape_string($mysqli, $sub['Key_SessionID']);
    $title               = mysqli_real_escape_string($mysqli, $sub['PaperTitle']               );
    $type                = mysqli_real_escape_string($mysqli, $sub['Program']              );
    $subtype             = "";
    
    $equery = "INSERT INTO entity (id, abstract, acmLink, authors, bestPaperAward, bestPaperNominee, cAndB, contactEmail, contactFirstName, contactLastName, coreCommunities, featuredCommunities, keywords, programNumber, session, title, type, subtype) VALUES ('$id', '$abstract', '$acmLink', '$authors', '$bestPaperAward', '$bestPaperNominee', '$cAndB', '$contactEmail', '$contactFirstName', '$contactLastName', '$coreCommunities', '$featuredCommunities', '$keywords', '$programNumber', '$session', '$title', '$type', '$subtype')";

   
    mysqli_query($mysqli, $equery);
    echo  mysqli_error($mysqli);

    $sessionHash[$session][$id] = $id;
  }
  return $sessionHash;
}

function getSubmissions($paperSessionHash, $sid){
  $submissions = array();
  if (array_key_exists($sid, $paperSessionHash)){
    foreach ($paperSessionHash[$sid] as $paper){
      array_push($submissions, $paper);
    }
  }
  return implode(",", $submissions);
}

function isScheduled($schedule, $id){
  foreach ($schedule as $slot){
    if($slot['sessionId'] == $id){
      return true;
    }
  }
  return false;
}

function getDateTimeRoom($schedule, $id){
  foreach ($schedule as $slot){
    if($slot['sessionId'] == $id){
      return array(
		   "date"  => $slot['date'],
		   "time"  => $slot['time'],
		   "room"  => $slot['room'],
		   );
    }
  }
  return array(
	       "date"  => "",
	       "time"  => "",
	       "room"  => "",

	       );
}

function getChairs($chairSessionHash, $id){
  $chairs = array();
  if (array_key_exists($id, $chairSessionHash)){
    foreach ($chairSessionHash[$id] as $chairId => $chair){
      array_push($chairs, $chairId);
    }
  }
  return implode(",", $chairs);
}

function getCommunities($topics, $id){
  if($topics == "") return array();
  $topics = str_getcsv($topics, ",", "\"");
  return array_map(function($value){
      $t = explode("_", $value);

      return $t[1];}, $topics);
}

function getPersona($topics, $id){
  if($topics == "") return "";
  $c = getCommunities($topics, $id);
  return $c[0];
}

function createSessionTable($mysqli, $paperSessionHash, $chairSessionHash) {
 	 $sessionFile = file_get_contents(SESSIONFILE);
	 $sessionData = json_decode($sessionFile, true);
	 $sessionData = $sessionData["data"];
	 $scheduleFile = file_get_contents(SCHEDULEFILE);
	 $schedule = json_decode($scheduleFile, true);
	 
	 foreach ($sessionData as $session) {
    	   $id = mysqli_real_escape_string($mysqli, $session["Key_SessionID"]);
	   $datetimeroom = getDateTimeRoom($schedule, $session["Key_SessionID"]);
           $date = $datetimeroom['date'];
	   $time = $datetimeroom['time'];
	   $room = $datetimeroom['room'];
	   $endTime = "";

	   $chairAffiliations = "";
	   $chairs = mysqli_real_escape_string($mysqli, getChairs($chairSessionHash, $id));
   	   $coreCommunities = mysqli_real_escape_string($mysqli, json_encode(getCommunities($session["Topics"], $id)));
	   $featuredCommunities = "[]";
	   $personas = mysqli_real_escape_string($mysqli, getPersona($session["Topics"], $id));
	   $hasAward = "";
	   $hasHonorableMention = "";
	   $notes = mysqli_real_escape_string($mysqli, $session["Note"]);
	   $submissionKeys = mysqli_real_escape_string($mysqli, getSubmissions($paperSessionHash, $id));
	   $title = mysqli_real_escape_string($mysqli, $session["Title"]);
	   $venue = mysqli_real_escape_string($mysqli, $session["Program"]);
	   $overview = mysqli_real_escape_string($mysqli, $session["Overview"]);// New: OVERVIEW
	   $type = mysqli_real_escape_string($mysqli, $session["Type"]);// New: TYPE
	   $scheduled = isScheduled($schedule, $session["Key_SessionID"]);
	   
   	   $squery = "INSERT INTO session (id, date, time, endTime, chairAffiliations, chairs, coreCommunities, featuredCommunities, personas, hasAward, hasHonorableMention, notes, room, submissions, title, venue, scheduled, overview, type) VALUES ('$id', '$date', '$time', '$endTime', '$chairAffiliations', '$chairs', '$coreCommunities', '$featuredCommunities', '$personas', '$hasAward', '$hasHonorableMention', '$notes', '$room', '$submissionKeys', '$title', '$venue', '$scheduled', '$overview', '$type')";

	   mysqli_query($mysqli, $squery);
	   echo  mysqli_error($mysqli);
	 }	 
}

function createScheduleTable($mysqli){
	 $scheduleFile = file_get_contents(SCHEDULEFILE);
	 $schedule = json_decode($scheduleFile, true);

	 foreach ($schedule as $slot) {
	     $slotId = $slot['id'];  
             $date = $slot['date'];
             $time = $slot['time'];
             $room = $slot['room'];
	     $id = $slot['sessionId'];

	     $query = "INSERT INTO schedule (date, time, room, id, locked, slotId) VALUES ('$date', '$time', '$room', '$id', 0, '$slotId')"; 
	     mysqli_query($mysqli, $query); 
	     echo  mysqli_error($mysqli);  
	 }
}

function makeInitialTables($mysqli){
	 $query = "INSERT initial_schedule SELECT * FROM schedule";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);

	 $query = "INSERT initial_session SELECT * FROM session";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);

	 $query = "INSERT initial_entity SELECT * FROM entity";
	 mysqli_query($mysqli, $query);
	 echo mysqli_error($mysqli);
}

$mysqli->close();

?>