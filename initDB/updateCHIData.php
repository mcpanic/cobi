B1;2c<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

if(count($argv) != 2 or $argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

define("AUTHORFILE", "updated-authors.json");
define("ENTITYFILE", "updated-entities.json");

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

updateAuthorTable($mysqli);
updateEntityTable($mysqli);

function updateAuthorTable($mysqli) {
  $authorFile = file_get_contents(AUTHORFILE);
  $authorData = json_decode($authorFile, true);

  $query = "CREATE TABLE updated_authors LIKE authors";
  mysqli_query($mysqli, $query);
  echo  mysqli_error($mysqli);

  foreach ($authorData as $author) {
    $authorId = mysqli_real_escape_string($mysqli, $author["authorId"]);
    $type = mysqli_real_escape_string($mysqli, $author["type"]);
    $id = mysqli_real_escape_string($mysqli, $author["id"]);
    $rank = $author["rank"];
    $givenName = mysqli_real_escape_string($mysqli, $author["givenName"]);
    $middle = "";
    if(array_key_exists('middleInitial', $author)){
      $middle = $author['middleInitial'];
    }
    
    $middleInitial = mysqli_real_escape_string($mysqli, $middle);
    $familyName = mysqli_real_escape_string($mysqli, $author["familyName"]);
    $email = mysqli_real_escape_string($mysqli, $author["email"]);
    $venue = mysqli_real_escape_string($mysqli, $author["venue"]);
    $role = mysqli_real_escape_string($mysqli, $author["role"]);
    $primary =  mysqli_real_escape_string($mysqli, json_encode($author['primary']));
    $secondary = mysqli_real_escape_string($mysqli, json_encode($author['secondary']));
    
    $aquery = "INSERT INTO updated_authors (authorId, type, id, venue, rank, givenName, middleInitial, familyName, email, role, primaryAff, secondaryAff) VALUES ('$authorId', '$type', '$id', '$venue', $rank, '$givenName', '$middleInitial', '$familyName', '$email', '$role', '$primary', '$secondary')";
    
    mysqli_query($mysqli, $aquery);
    echo  mysqli_error($mysqli);
    
    $authorHash[$authorId][$id] = array(
					"id"            => $author['id'],
					"givenName"     => $author['givenName'],
					"middleInitial" => $middle,
					"familyName"    => $author['familyName'],
					"email"         => $author['email'],     
					"primary"       => $author['primary'],
					"secondary"     => $author['secondary'],   
					"rank"          => $author['rank'],
					       "role"          => $author['role']); 
  }
  return $authorHash;
}		      

function updateEntityTable($mysqli) {
	 $entityFile = file_get_contents(ENTITYFILE);
	 $entityData = json_decode($entityFile, true);

	 $query = "CREATE TABLE updated_entity LIKE entity";
	 mysqli_query($mysqli, $query);
	 echo  mysqli_error($mysqli);

	 $query2 = "INSERT updated_entity SELECT * FROM entity";
	 mysqli_query($mysqli, $query2);
	 echo  mysqli_error($mysqli);

	 foreach ($entityData as $sub) {
	 	$id = mysqli_real_escape_string($mysqli, $sub["id"]);
		$abstract = mysqli_real_escape_string($mysqli, $sub["abstract"]);
		$acmLink   = mysqli_real_escape_string($mysqli, $sub["acmLink"]);
		$authors = mysqli_real_escape_string($mysqli, json_encode($sub["authors"]));		
		$bestPaperNominee = 0;
		$bestPaperAward = 0;
		$cAndB = "";
		if(array_key_exists('cbStatement', $sub)){
		  $cAndB = mysqli_real_escape_string($mysqli, $sub['cbStatement']);
		}
		$contactEmail = mysqli_real_escape_string($mysqli, $sub['contactEmail']);
                $contactFirstName = mysqli_real_escape_string($mysqli, $sub['contactFirstName']);
                $contactLastName = mysqli_real_escape_string($mysqli, $sub['contactLastName']);
		$coreCommunities = mysqli_real_escape_string($mysqli, json_encode(array())); //mysqli_real_escape_string($mysqli, json_encode($sub['communities']));
		$featuredCommunities = mysqli_real_escape_string($mysqli, json_encode(array()));
		$keywords = "";
		if(array_key_exists('keywords', $sub)){
		  $keywords            = mysqli_real_escape_string($mysqli, json_encode($sub['keywords']));       
		}
                $programNumber       = "";
                $session             = mysqli_real_escape_string($mysqli, $sub['session']);
		if($sub['session'] == ""){
		  $session = "null";
		}
		$title               = mysqli_real_escape_string($mysqli, $sub['title']               );
		$type                = mysqli_real_escape_string($mysqli, $sub['venue']              );
	        $subtype             = "";
		if(array_key_exists('subtype', $sub)){
		  $subtype = mysqli_real_escape_string($mysqli, $sub['subtype']            );
		}
		
                $equery = "UPDATE updated_entity set abstract='$abstract', acmLink='$acmLink', authors='$authors', cAndB='$cAndB', contactEmail='$contactEmail', contactFirstName='$contactFirstName', contactLastName='$contactLastName', keywords='$keywords', programNumber='$programNumber', title='$title' where id='$id'";
		  
	        mysqli_query($mysqli, $equery);
                echo  mysqli_error($mysqli);
	}
}

$mysqli->close();

?>