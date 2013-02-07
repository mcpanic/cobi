// OLD --- no longer in use... see initDB directory instead
<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

$date = $_POST['date'];
$alldates = $_POST['mydata'];
$alldates = json_decode($alldates, true);

foreach ($alldates as $time => $alltimes) {
  foreach ($alltimes as $room => $allrooms) {
    foreach ($allrooms as $id => $data) {
      // Form the schedule table
      $query = "INSERT INTO schedule (date, time, room, id, locked) VALUES ('$date', '$time', '$room', '$id', 0)";
      mysqli_query($mysqli, $query);
      echo  mysqli_error($mysqli);

      // Form the session table
      $sid = mysqli_real_escape_string($mysqli, $id);
      $sdate = mysqli_real_escape_string($mysqli, $data['date']);
      $stime = mysqli_real_escape_string($mysqli, $data['time']);
      $endTime = mysqli_real_escape_string($mysqli, $data['endTime']);
      $chairAffiliations = mysqli_real_escape_string($mysqli, $data['chairAffiliations']);
      $chairs = mysqli_real_escape_string($mysqli, json_encode($data['chairs']));
      $coreCommunities = mysqli_real_escape_string($mysqli, json_encode($data['coreCommunities']));
      $featuredCommunities = mysqli_real_escape_string($mysqli, json_encode($data['featuredCommunities']));
      $hasAward = $data['hasAward'];
      $hasHonorableMention = $data['hasHonorableMention'];

      $notes = mysqli_real_escape_string($mysqli, $data['notes']);
      $sroom = mysqli_real_escape_string($mysqli, $data['room']);
      $submissionKeys = mysqli_real_escape_string($mysqli, implode(",", array_keys($data['submissions'])));
      $title = mysqli_real_escape_string($mysqli, $data['title']);
      $type = mysqli_real_escape_string($mysqli, $data['type']);
     
      $squery = "INSERT INTO session (id, date, time, endTime, chairAffiliations, chairs, coreCommunities, featuredCommunities, hasAward, hasHonorableMention, notes, room, submissions, title, type, scheduled) VALUES ('$sid', '$sdate', '$stime', '$endTime', '$chairAffiliations', '$chairs', '$coreCommunities', '$featuredCommunities', '$hasAward', '$hasHonorableMention', '$notes', '$sroom', '$submissionKeys', '$title', '$type', 1)";
      mysqli_query($mysqli, $squery);
      echo  mysqli_error($mysqli);

      // Form the entity table
      foreach ($data['submissions'] as $subid => $subdata) {
	$eid                 = mysqli_real_escape_string($mysqli, $subid                 );
	$abstract            = mysqli_real_escape_string($mysqli, $subdata['abstract']            );
	$acmLink             = mysqli_real_escape_string($mysqli, $subdata['acmLink']             );
	$authors             = mysqli_real_escape_string($mysqli, json_encode($subdata['authors'])             );
	$bestPaperAward      = $subdata['bestPaperAward']      ;
	$bestPaperNominee    = $subdata['bestPaperNominee']    ;
	$cAndB               = mysqli_real_escape_string($mysqli, $subdata['cAndB']               );
	$contactEmail        = mysqli_real_escape_string($mysqli, $subdata['contactEmail']        );
	$contactFirstName    = mysqli_real_escape_string($mysqli, $subdata['contactFirstName']    );
	$contactLastName     = mysqli_real_escape_string($mysqli, $subdata['contactLastName']     );
	$coreCommunities     = mysqli_real_escape_string($mysqli, json_encode($subdata['coreCommunities'])     );
	$featuredCommunities = mysqli_real_escape_string($mysqli, json_encode($subdata['featuredCommunities']) );
	$keywords            = mysqli_real_escape_string($mysqli, json_encode($subdata['keywords'])            );
	$programNumber       = mysqli_real_escape_string($mysqli, $subdata['programNumber']       );
	$session             = mysqli_real_escape_string($mysqli, json_encode($subdata['session'])             );
	$title               = mysqli_real_escape_string($mysqli, $subdata['title']               );
	$type                = mysqli_real_escape_string($mysqli, $subdata['type']                );

	$equery = "INSERT INTO entity (id, abstract, acmLink, authors, bestPaperAward, bestPaperNominee, cAndB, contactEmail, contactFirstName, contactLastName, coreCommunities, featuredCommunities, keywords, programNumber, session, title, type) VALUES ('$eid', '$abstract', '$acmLink', '$authors', '$bestPaperAward', '$bestPaperNominee', '$cAndB', '$contactEmail', '$contactFirstName', '$contactLastName', '$coreCommunities', '$featuredCommunities', '$keywords', '$programNumber', '$session', '$title', '$type')";
	
	mysqli_query($mysqli, $equery);
	echo  mysqli_error($mysqli);
	
/* 	// Form the author table */
/* 	// decided it's not needed! */
/* 	// todo: note: don't insert same author twice? */
/* 	foreach ($subdata['authors'] as $authorKey => $authordata) { */
/* 	  $author = mysqli_real_escape_string($mysqli, $authorKey);  */
/* 	  $affiliations = mysqli_real_escape_string($mysqli, json_encode($authordata['affiliations'])); */
/* 	  $email = mysqli_real_escape_string($mysqli, $authordata['email']); */
/* 	  $firstName = mysqli_real_escape_string($mysqli, $authordata['firstName']); */
/* 	  $lastName = mysqli_real_escape_string($mysqli, $authordata['lastName']); */
/* 	  $middleName = mysqli_real_escape_string($mysqli, $authordata['middleName']); */
/* 	  $submissions = mysqli_real_escape_string($mysqli, json_encode($authordata['submissions'])); */

/* 	  $aquery = "INSERT INTO author (authorKey, affiliations, email, firstName, lastName, middleName, submissions) VALUES ('$author', '$affiliations', '$email', '$firstName', '$lastName', '$middleName', '$submissions')"; */
/* 	  mysqli_query($mysqli, $aquery); */
/* 	  echo  mysqli_error($mysqli); */
/* 	} */
      }
    }
  }
}
$mysqli->close();
?>