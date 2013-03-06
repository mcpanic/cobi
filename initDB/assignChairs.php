<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

function startsWith($haystack, $needle)
{
  return !strncmp($haystack, $needle, strlen($needle));
}

if(count($argv) != 3 or $argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

$contents = file_get_contents($argv[2]);
$lines = explode("\n", $contents);

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

foreach ($lines as $lin){
  $content = explode(",", $lin, 5);
  $content = array_map("trim", $content);
  
  if(startsWith($content[0], "chair")){// create new chair
    $authorId = mysqli_real_escape_string($mysqli, $content[0]);
    $name = explode(" ", $content[1], 2);
    $givenName = mysqli_real_escape_string($mysqli, $name[0]);
    $familyName = mysqli_real_escape_string($mysqli, $name[1]);
    $middleInitial = "";
    $id = mysqli_real_escape_string($mysqli, $content[3]);
    $affinity = mysqli_real_escape_string($mysqli, $content[4]);
    $squery = "insert into sessionChairs (authorId, id, givenName, middleInitial, familyName, affinity)
         values ('$authorId', '$id', '$givenName', '$middleInitial', '$familyName', '$affinity');";
    mysqli_query($mysqli, $squery);
    echo mysqli_error($mysqli);
    
    if($id != ""){
      $squery = "update session set chairs='$authorId' where id='$id'";
      mysqli_query($mysqli, $squery);
      echo mysqli_error($mysqli);
    }
  }else{// insert on lookup
    $authorId = mysqli_real_escape_string($mysqli, $content[0]);
    $id = mysqli_real_escape_string($mysqli, $content[3]);
    $affinity = mysqli_real_escape_string($mysqli, $content[4]);

    $squery = "insert into sessionChairs (authorId, type, id, venue, rank, givenName, middleInitial, familyName, email, role, primaryAff, secondaryAff) select * from authors where authorId='$authorId' limit 1";
    mysqli_query($mysqli, $squery);
    echo mysqli_error($mysqli);
    
    $squery = "update sessionChairs set id='$id' where authorId='$authorId'";
    mysqli_query($mysqli, $squery);
    echo mysqli_error($mysqli);

    $squery = "update sessionChairs set affinity='$affinity' where authorId='$authorId'";
    mysqli_query($mysqli, $squery);
    echo mysqli_error($mysqli);
    
    if($id != ""){  // update session's chair
      $squery = "update session set chairs='$authorId' where id='$id'";
      mysqli_query($mysqli, $squery);
      echo mysqli_error($mysqli);
    }
  }
}
$mysqli->close();
?>