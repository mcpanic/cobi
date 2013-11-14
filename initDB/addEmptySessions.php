<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

if(count($argv) != 4 or $argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

$sessionName = $argv[2];
$venue = $argv[3];

$query = "INSERT into session (id, date, time, chairAffiliations, chairs, coreCommunities, featuredCommunities, hasAward, hasHonorableMention, room, submissions, title, scheduled, personas, venue) values ('$sessionName', '', '', '', '', '[]', '[]', 0, 0, '', '', 'Unused Session $sessionName', 0, '', '$venue')";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$mysqli->close();

?>