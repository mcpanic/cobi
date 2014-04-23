<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";


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

// Get the transactions table
//$transQ = "select * from transactions order by id DESC limit 5";
$transQ = "select id, transactions.uid, transactions.type, data, previous, name from transactions LEFT JOIN (users) ON (users.uid=transactions.uid) order by id DESC limit 5";
$transTable =  mysqli_query($mysqli, $transQ);
echo mysqli_error($mysqli);

$unscheduledSubmissions = array();

// Get chairs
$chairsQ = "select * from sessionChairs";
$chairsTable = mysqli_query($mysqli, $chairsQ);
echo mysqli_error($mysqli);
$chairs = array();
while ($row = $chairsTable->fetch_assoc()){
  $row['affinity'] = json_decode($row['affinity']);
  $chairs[$row['authorId']][$row['id']] = $row;
}

// Reconstruct the JSON
while ($row = $entityTable->fetch_assoc()) {
  $row['coreCommunities'] = json_decode($row['coreCommunities']);
  $row['featuredCommunities'] = json_decode($row['featuredCommunities']);
  
  // Process authors into our format
  $authorDB = json_decode($row['authors'], true);
  $authors = array();
  if($authorDB != NULL){
    foreach ($authorDB as $author) {
      $authorKey = $author['givenName'] . ' ' . $author['familyName'];
      if (array_key_exists('id', $author)){
	$authorKey = $author['id'];
      }
          
      $email = "";
      if(array_key_exists('email', $author)){
	$email = $author['email'];
      }
      $authorData = array(
			  "affiliations" => $author['primary'],
			  "email" => $email,
			  "firstName" => $author['givenName'],
			  "lastName" => $author['familyName'],
			  "middleName" => "",
			  "authorId" => $authorKey
			  );
      if(array_key_exists('role', $author)){
	$authorData['role'] = $author['role'];
      }
      if(array_key_exists('middleInitial', $author)){
	$authorData['middleName'] = $author['middleInitial'];
      }
      $authors[$authorKey] = $authorData;
    }
  }
  $row['authors'] = $authors;
  //  var_dump($authors);
  $row['keywords'] = json_decode($row['keywords']);
  $row['bestPaperAward'] = (bool)$row['bestPaperAward'];
  $row['bestPaperNominee'] = (bool)$row['bestPaperNominee'];
  
  $entity[$row['id']] = $row; 
  
    if ($row['session'] == "null"){
      $unscheduledSubmissions[$row['id']] = $row;
    }
}
  
$unscheduled = array();

while ($row = $sessionTable->fetch_assoc()) {
  $row['chairs'] = $row['chairs'];
  $row['coreCommunities'] = json_decode($row['coreCommunities']);
  $row['personas'] = $row['personas'];
  
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
	  // HQ: changing this to output an array
	array_push($subs, $entity[$sub]);
	//	$subs[$sub] = $entity[$sub];
      }
    }
  }
  //  if (empty($subs)) $subs = (object) null;
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


$transactions = array();
while ($row = $transTable->fetch_assoc()) {
  $row["data"] = json_decode($row["data"], true);
  $row["previous"] = json_decode($row["previous"], true);
  array_unshift($transactions, $row);
}

$output = array('schedule' => $schedule, 
		'unscheduled' => (object)$unscheduled,
		'unscheduledSubmissions' => (object)$unscheduledSubmissions,
		'slots' => $slots,
		'transactions' => $transactions,
		'chairs' =>$chairs);

echo json_encode($output);

$mysqli->close();
?>