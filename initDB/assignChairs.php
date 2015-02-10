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

echo count($lines) . " chairs' information loaded.\n";
$matchCount = 0;

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

foreach ($lines as $lin){
  $content = explode(",", $lin, 6);
  $content = array_map("trim", $content);

  if(startsWith($content[0], "chair")){// create new chair
    $authorId = mysqli_real_escape_string($mysqli, $content[0]);
    $name = explode(" ", $content[1], 2);
    $givenName = mysqli_real_escape_string($mysqli, $name[0]);
    $familyName = mysqli_real_escape_string($mysqli, $name[1]);
    $middleInitial = "";
    $id = mysqli_real_escape_string($mysqli, $content[4]);
    $affinity = mysqli_real_escape_string($mysqli, $content[5]);
    $squery = "insert into sessionChairs (authorId, id, givenName, middleInitial, familyName, affinity)
         values ('$authorId', '$id', '$givenName', '$middleInitial', '$familyName', '$affinity');";
    mysqli_query($mysqli, $squery);
    echo mysqli_error($mysqli);

    if($id != ""){
      $squery = "update session set chairs='$authorId' where id='$id'";
      mysqli_query($mysqli, $squery);
      echo mysqli_error($mysqli);
    }
  } else {// insert on lookup
    $authorId = mysqli_real_escape_string($mysqli, "auth" . $content[0]);
    echo $authorId . "\n";
    $id = mysqli_real_escape_string($mysqli, $content[4]);
    $affinity = mysqli_real_escape_string($mysqli, $content[5]);
    $email = mysqli_real_escape_string($mysqli, $content[3]);

    // authorId matching doesn't seem to be accurate. Using email instead.
    // $squery = "select * from authors where authorId='$authorId' limit 1";
    $squery = "select * from authors where email='$email' limit 1";
    $result = mysqli_query($mysqli, $squery);
    echo mysqli_error($mysqli);

    if (mysqli_num_rows($result) == 1) { // this chair exists in the authors table.
      $matchCount += 1;
      $squery = "insert into sessionChairs (authorId, type, id, venue, rank, givenName, middleInitial, familyName, email, role, primaryAff, secondaryAff) select * from authors where email='$email' limit 1";
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

    } else { // doesn't exist in the authors table.
      $givenName = mysqli_real_escape_string($mysqli, $content[2]);
      $familyName = mysqli_real_escape_string($mysqli, $content[1]);
      $middleInitial = "";
      $squery = "insert into sessionChairs (authorId, type, id, givenName, middleInitial, familyName, email, affinity)
           values ('$authorId', 'chair', '$id', '$givenName', '$middleInitial', '$familyName', '', '$affinity');";
      mysqli_query($mysqli, $squery);
      echo mysqli_error($mysqli);

      if($id != ""){
        $squery = "update session set chairs='$authorId' where id='$id'";
        mysqli_query($mysqli, $squery);
        echo mysqli_error($mysqli);
      }
    }
  }
}
echo $matchCount . " already in the authors table";
$mysqli->close();
?>