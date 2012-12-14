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
$sessionQ = "select * from session"; 
$sessionTable = mysqli_query($mysqli, $sessionQ);
echo mysqli_error($mysqli);


// Get the entity table
$entityQ = "select * from entity"; 
$entityTable = mysqli_query($mysqli, $entityQ);
echo mysqli_error($mysqli);

// Reconstruct the JSON
while ($row = $entityTable->fetch_assoc()) {
  $row['coreCommunities'] = json_decode($row['coreCommunities']);
  $row['featuredCommunities'] = json_decode($row['featuredCommunities']);
  $row['authors'] = json_decode($row['authors']);
  $row['keywords'] = json_decode($row['keywords']);
  $row['session'] = json_decode($row['session']);

  $row['bestPaperAward'] = (bool)$row['bestPaperAward'];
  $row['bestPaperNominee'] = (bool)$row['bestPaperNominee'];

  $entity[$row['id']] = $row; 
}
//echo json_encode($entity);

$unscheduled = array();

while ($row = $sessionTable->fetch_assoc()) {
  $row['chairs'] = json_decode($row['chairs']);
  $row['coreCommunities'] = json_decode($row['coreCommunities']);
  $row['featuredCommunities'] = json_decode($row['featuredCommunities']);
  $row['hasAward'] = (bool)$row['hasAward'];
  $row['hasHonorableMention'] = (bool)$row['hasHonorableMention'];
  $row['scheduled'] = (bool)$row['scheduled'];
  $subKeys = explode(",", trim($row['submissions']));
  $subs = array();
  foreach ($subKeys as $sub){
    if ($sub == ""){
    }else{
      if (!array_key_exists($sub, $entity)){ 
	// SHOULDN"T BE HERE
      }else{
	$subs[$sub] = $entity[$sub];
      }
    }
  }
  if (empty($subs)) $subs = (object) null;
  $row['submissions'] = $subs;
  $ses[$row['id']] = $row; 
  
  if (!$row['scheduled']){
    $unscheduled[$row['id']] = $row; 
  }
}

while ($row = $scheduleTable->fetch_assoc()) {
  $slots[$row['date']][$row['time']][$row['room']]['locked'] = (bool) $row['locked'];
  if ($row['id'] == ""){
    $schedule[$row['date']][$row['time']][$row['room']] = (object) null;
  }else{
    $schedule[$row['date']][$row['time']][$row['room']][$row['id']] = $ses[$row['id']];
  }
}

$output = array('schedule' => $schedule, 
		'unscheduled' => $unscheduled,
		'slots' => $slots);

echo json_encode($output);

$mysqli->close();
?>