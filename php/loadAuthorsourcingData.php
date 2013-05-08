<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

$query = "select * from authorsourcingData"; 
$asTable = mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

while ($row = $asTable->fetch_assoc()) {
  $output[$row['paperId']] = $row;
}


$query = "select * from authorsourcingRelevanceDedupe"; 
$asTable = mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

while ($row = $asTable->fetch_assoc()) {
  $result[$row['uid']] = $row;
}


$alloutput = array('output' => $output,
		   'result' => $result);
echo json_encode($alloutput);

?>		      