<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

// Get the schedule table
$userQ = "select uid,name,type from users";
$userResult = mysqli_query($mysqli, $userQ);
echo mysqli_error($mysqli);
if($userResult->num_rows == 0){
  
}else{
  while ($row = $userResult->fetch_assoc()) {
    $users[$row['uid']] = $row;
  }
  echo json_encode($users);
  mysqli_free_result($userResult);
}

$mysqli->close();
?>