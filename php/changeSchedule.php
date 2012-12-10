<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

$type = $_POST['type'];

if(strcmp("unschedule", $type) == 0){
  $id = mysqli_real_escape_string($mysqli, $_POST['id']);
  $date = mysqli_real_escape_string($mysqli, $_POST['date']);
  $time = mysqli_real_escape_string($mysqli, $_POST['time']);
  $room = mysqli_real_escape_string($mysqli, $_POST['room']);

  // remove the session from the schedule
  $query = "UPDATE schedule SET id='' WHERE date='$date' AND time='$time' AND room ='$room' AND id='$id'";
  mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);

  // change the session data so it is unscheduled and does not have room, time, date
  $squery = "UPDATE session SET date='', time='', room='', endTime='', scheduled=0 WHERE id='$id'";
  mysqli_query($mysqli, $squery);
  echo mysqli_error($mysqli);
}


if(strcmp("schedule", $type) == 0){
  $id = mysqli_real_escape_string($mysqli, $_POST['id']);
  $date = mysqli_real_escape_string($mysqli, $_POST['date']);
  $time = mysqli_real_escape_string($mysqli, $_POST['time']);
  $room = mysqli_real_escape_string($mysqli, $_POST['room']);
$endTime = mysqli_real_escape_string($mysqli, $_POST['endTime']);
  
  // add session to the schedule
  $query = "UPDATE schedule SET id='$id' WHERE date='$date' AND time='$time' AND room ='$room'";
  mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);

  // change the session data so it is scheduled with room, time, date
  $squery = "UPDATE session SET date='$date', time='$time', room='$room', endTime='$endTime', scheduled=1 WHERE id='$id'";
  mysqli_query($mysqli, $squery);
  echo mysqli_error($mysqli);
}

if(strcmp("swap", $type) == 0){
  $s1id = mysqli_real_escape_string($mysqli, $_POST['s1id']);
  $s1date = mysqli_real_escape_string($mysqli, $_POST['s1date']);
  $s1time = mysqli_real_escape_string($mysqli, $_POST['s1time']);
  $s1room = mysqli_real_escape_string($mysqli, $_POST['s1room']);

  $s2id = mysqli_real_escape_string($mysqli, $_POST['s2id']);
  $s2date = mysqli_real_escape_string($mysqli, $_POST['s2date']);
  $s2time = mysqli_real_escape_string($mysqli, $_POST['s2time']);
  $s2room = mysqli_real_escape_string($mysqli, $_POST['s2room']);

  // perform swap in the schedule
  $s1query = "UPDATE schedule SET id='$s1id' WHERE date='$s2date' AND time='$s2time' AND room ='$s2room'";
  mysqli_query($mysqli, $s1query);
  echo mysqli_error($mysqli);

  $s2query = "UPDATE schedule SET id='$s2id' WHERE date='$s1date' AND time='$s1time' AND room ='$s1room'";
  mysqli_query($mysqli, $s2query);
  echo mysqli_error($mysqli);

  // change the session data so it is scheduled with room, time, date
  $ss1query = "UPDATE session SET date='$s2date', time='$s2time', room='$s2room' WHERE id='$s1id'";
  mysqli_query($mysqli, $ss1query);
  echo mysqli_error($mysqli);

  $ss2query = "UPDATE session SET date='$s1date', time='$s1time', room='$s1room' WHERE id='$s2id'";
  mysqli_query($mysqli, $ss2query);
  echo mysqli_error($mysqli);
}


$mysqli->close();

?>
