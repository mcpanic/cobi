<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

// Get the schedule table
$query = "select authorId, id, great, ok, notsure, notok, interested,relevant from authorsourcing"; 
$asTable = mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$output = array();
while ($row = $asTable->fetch_assoc()) {
  if($row['authorId'] == ""){
    $row['authorId'] = "anon";
  }
  if(array_key_exists($row['id'], $output) and 
     array_key_exists($row['authorId'], $output[$row['id']])){ 
    array_push($output[$row['id']][$row['authorId']], $row); 
  } else{
    $output[$row['id']][$row['authorId']] = array($row);
  }
}		      

echo json_encode($output);
		      