<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

if($argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);
$authorId = mysqli_real_escape_string($mysqli, $argv[2]);
$id = mysqli_real_escape_string($mysqli, $argv[3]);
$affinity = mysqli_real_escape_string($mysqli, json_encode(array(), JSON_FORCE_OBJECT));



$squery = "insert into sessionChairs (authorId, type, id, venue, rank, givenName, middleInitial, familyName, email, role, primaryAff, secondaryAff) select * from authors where authorId='$authorId' limit 1";
mysqli_query($mysqli, $squery);
echo mysqli_error($mysqli);

$squery = "update sessionChairs set id='$id' where authorId='$authorId'";
mysqli_query($mysqli, $squery);
echo mysqli_error($mysqli);

$squery = "update session set chairs='$authorId' where id='$id'";
mysqli_query($mysqli, $squery);
echo mysqli_error($mysqli);

$squery = "update sessionChairs set affinity='$affinity' where authorId='$authorId'";
mysqli_query($mysqli, $squery);
echo mysqli_error($mysqli);

$mysqli->close();
?>