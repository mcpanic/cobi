<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

$uid = mysqli_real_escape_string($mysqli, $_POST['uid']);
$clientId = mysqli_real_escape_string($mysqli, $_POST['transactionId']);

// Get the transactions table
$transQ = "select id, transactions.uid, transactions.type, data, previous, name from transactions LEFT JOIN (users) ON (users.uid=transactions.uid) where id > $clientId order by id DESC";
$transTable =  mysqli_query($mysqli, $transQ);
echo mysqli_error($mysqli);

// No updates
if(mysqli_num_rows($transTable) == 0){
  exit();
}

// Get the schedule table
$scheduleQ = "select * from schedule"; 
$scheduleTable = mysqli_query($mysqli, $scheduleQ);
echo mysqli_error($mysqli);

// Get unscheduled sessions
$sessionUQ = "select * from session where scheduled=0"; 
$sessionUnscheduledTable = mysqli_query($mysqli, $sessionUQ);
echo mysqli_error($mysqli);

// Forming unscheduled data
$unscheduled = array();
while ($row = $sessionUnscheduledTable->fetch_assoc()) {
    $unscheduled[$row['id']] = $row; 
}

// Get unscheduled sessions
$entityQ = "select * from entity where session='null'"; 
$entityUnscheduledTable = mysqli_query($mysqli, $entityQ);
echo mysqli_error($mysqli);

// Forming unscheduled data
$unscheduledSubmissions = array();
while ($row = $entityUnscheduledTable->fetch_assoc()) {
  $unscheduledSubmissions[$row['id']] = $row; 
}

// Get the session table with submissions only
$sessionQ = "select id,submissions from session"; 
$sessionTable = mysqli_query($mysqli, $sessionQ);
echo mysqli_error($mysqli);

while ($row = $sessionTable->fetch_assoc()) {
  $subKeys = explode(",", trim($row['submissions']));
  $subs = array();
  
  foreach ($subKeys as $sub){
    if ($sub == ""){
    }else{
      array_push($subs, $sub);
    }
  }

  //  if (empty($subs)) $subs = (object) null;
  $row['submissions'] = $subs;
  $ses[$row['id']] = $row; 
}

while ($row = $scheduleTable->fetch_assoc()) {
  $slots[$row['date']][$row['time']][$row['room']]['locked'] = (bool) $row['locked'];

  if ($row['id'] == ""){
    $schedule[$row['date']][$row['time']][$row['room']] = (object) null;
  }else{
    $schedule[$row['date']][$row['time']][$row['room']][$row['id']] = $ses[$row['id']];
  }
}

$transactions = array();
while ($row = $transTable->fetch_assoc()) {
  $row["data"] = json_decode($row["data"], true);
  $row["previous"] = json_decode($row["previous"], true);
  array_unshift($transactions, $row);
}

$output = array('schedule' => $schedule, 
		'unscheduled' => $unscheduled,
		'unscheduledSubmissions' => $unscheduledSubmissions,
		'slots' => $slots,
		'transactions' => $transactions);

echo json_encode($output);

$mysqli->close();
?>