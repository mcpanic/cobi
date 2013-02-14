<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

if(count($argv) != 3 or $argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);
$empty = mysqli_real_escape_string($mysqli, json_encode(array()));

$squery = "INSERT INTO session (id, date, time, chairAffiliations, chairs, coreCommunities, featuredCommunities, personas, hasAward, hasHonorableMention, notes, room, submissions, title, venue, scheduled) VALUES ('$argv[2]', '', '', '', '$empty', '$empty', '$empty', '', 0, 0, '', '', '', 'unused session', 'paper', 0)";
mysqli_query($mysqli, $squery);
echo  mysqli_error($mysqli);