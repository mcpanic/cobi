<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

if(count($argv) != 2 or $argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

define("ENTITYFILE", "entitiesToAdd.json");

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

createEntityTable($mysqli);

function createEntityTable($mysqli) {
	 $entityFile = file_get_contents(ENTITYFILE);
	 $entityData = json_decode($entityFile, true);
	 foreach ($entityData as $sub) {
	 	$id = mysqli_real_escape_string($mysqli, $sub["id"]);
		$abstract = mysqli_real_escape_string($mysqli, $sub["abstract"]);
		$acmLink   = mysqli_real_escape_string($mysqli, $sub["acmLink"]);
		$authors = mysqli_real_escape_string($mysqli, json_encode($sub["authors"]));		
		$bestPaperNominee = 0;
		$bestPaperAward = 0;
		$cAndB = mysqli_real_escape_string($mysqli, $sub['cbStatement']);
		$contactEmail = mysqli_real_escape_string($mysqli, $sub['contactEmail']);
                $contactFirstName = mysqli_real_escape_string($mysqli, $sub['contactFirstName']);
                $contactLastName = mysqli_real_escape_string($mysqli, $sub['contactLastName']);
		$coreCommunities = mysqli_real_escape_string($mysqli, json_encode($sub['communities']));
		$featuredCommunities = mysqli_real_escape_string($mysqli, json_encode(array()));
		$keywords            = mysqli_real_escape_string($mysqli, json_encode($sub['keywords']));       
                $programNumber       = "";
                $session             = mysqli_real_escape_string($mysqli, $sub['session']);       
		$title               = mysqli_real_escape_string($mysqli, $sub['title']               );
		$type                = mysqli_real_escape_string($mysqli, $sub['venue']              );
	        $subtype             = mysqli_real_escape_string($mysqli, $sub['subtype']            );
                $equery = "INSERT INTO entity (id, abstract, acmLink, authors, bestPaperAward, bestPaperNominee, cAndB, contactEmail, contactFirstName, contactLastName, coreCommunities, featuredCommunities, keywords, programNumber, session, title, type, subtype) VALUES ('$id', '$abstract', '$acmLink', '$authors', '$bestPaperAward', '$bestPaperNominee', '$cAndB', '$contactEmail', '$contactFirstName', '$contactLastName', '$coreCommunities', '$featuredCommunities', '$keywords', '$programNumber', '$session', '$title', '$type', '$subtype')";
		  
	        mysqli_query($mysqli, $equery);
                echo  mysqli_error($mysqli);
	}
}

$mysqli->close();

?>
