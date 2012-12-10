<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

// Get the schedule table
$scheduleQ = "select * from schedule"; 
$scheduleTable = mysqli_query($mysqli, $scheduleQ);
echo mysqli_error($mysqli);

// Get the session table
$sessionQ = "select * from session where scheduled=0"; 
$sessionTable = mysqli_query($mysqli, $sessionQ);
echo mysqli_error($mysqli);

$unscheduled = array();
while ($row = $sessionTable->fetch_assoc()) {
    $unscheduled[$row['id']] = $row; 
}

while ($row = $scheduleTable->fetch_assoc()) {
  if ($row['id'] == ""){
    $schedule[$row['date']][$row['time']][$row['room']] = (object) null;
  }else{
    $schedule[$row['date']][$row['time']][$row['room']][$row['id']] = (object) null;
  }
}

$output = array('schedule' => $schedule, 
		'unscheduled' => $unscheduled);

echo json_encode($output);

$mysqli->close();
?>