<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "settings.php";

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

function isAdmin($uid, $mysqli){
  $query = "select type from users where uid='$uid' limit 1";
  $result = mysqli_query($mysqli, $query);

  while ($row = $result->fetch_assoc()) {
    if($row["type"] == "admin"){
      return True;
    }
  }
  return False;
}

function performUndo($mysqli){
  $query = "select * from transactions order by id DESC limit 1";
  $result = mysqli_query($mysqli, $query);  

  
  $row = $result->fetch_assoc();
  if($row == null){
    return;
  }
  $previous = json_decode($row["previous"], true);    
  
  if($row["type"] == "lock"){
    updateLock($previous["lock"], 
	       $previous["date"],
	       $previous["time"],
	       $previous["room"],
	       $mysqli);
  }else if($row["type"] == "unschedule"){
    scheduleSession($previous["date"], 
		    $previous["time"], 
		    $previous["room"], 
		    $previous["id"], 
		    $mysqli);
  }else if($row["type"] == "schedule"){
    unscheduleSession($previous["date"], 
		      $previous["time"], 
		      $previous["room"], 
		      $previous["id"], 
		      $mysqli);
  }else if($row["type"] == "swap"){
    swapSessions($previous["s1date"], 
		 $previous["s1time"], 
		 $previous["s1room"], 
		 $previous["s1id"], 
		 $previous["s2date"], 
		 $previous["s2time"], 
		 $previous["s2room"], 
		 $previous["s2id"], 
		 $mysqli);
  }else if($row["type"] == "swapWithUnscheduled"){ // TODO: check this case
    swapWithUnscheduledSession($previous["s1id"], 
		 $previous["s2date"], 
		 $previous["s2time"], 
		 $previous["s2room"], 
		 $previous["s2id"], 
		 $mysqli);
  }else if($row["type"] == "move"){
    moveSession($previous["sdate"],
		$previous["stime"],
		$previous["sroom"],
		$previous["id"],
		$previous["tdate"],
		$previous["ttime"],
		$previous["troom"],
		$mysqli);
  }

  // remove the last transaction
  $query = "DELETE FROM transactions order by id DESC limit 1";
  $result = mysqli_query($mysqli, $query);
  
  // return data about what was done
}

function recordTransaction($uid, $type, $data, $previous, $mysqli){
  $trans = "INSERT into transactions (uid, type, data, previous) VALUES ('$uid', '$type', '$data', '$previous')";
  mysqli_query($mysqli, $trans); 
  echo mysqli_error($mysqli); 
  
  $query = "select id, transactions.uid, transactions.type, data, previous, name from transactions LEFT JOIN (users) ON (users.uid=transactions.uid) order by id DESC limit 1";
  //  $query = "select * from transactions order by id DESC limit 1";
  $result = mysqli_query($mysqli, $query);  
  echo mysqli_error($mysqli); 
  
  // return the transaction record
  $row = $result->fetch_assoc();
  if($row != null){
    $row["data"] = json_decode($row["data"], true);
    $row["previous"] = json_decode($row["previous"], true);
    echo json_encode($row);
  }
}

function updateLock($lock, $date, $time, $room, $mysqli){
  $query = "UPDATE schedule SET locked=$lock WHERE date='$date' AND time='$time' AND room ='$room'";
  $result = mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);
}  

function unscheduleSession($date, $time, $room, $id, $mysqli){
  // remove the session from the schedule
  $query = "UPDATE schedule SET id='' WHERE date='$date' AND time='$time' AND room ='$room' AND id='$id'";
  mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);
  
  // change the session data so it is unscheduled and does not have room, time, date
  $squery = "UPDATE session SET date='', time='', room='', scheduled=0 WHERE id='$id'";
  mysqli_query($mysqli, $squery);
  echo mysqli_error($mysqli);
}

function scheduleSession($date, $time, $room, $id, $mysqli){
  // add session to the schedule
  $query = "UPDATE schedule SET id='$id' WHERE date='$date' AND time='$time' AND room ='$room'";
  mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);
  
  // change the session data so it is scheduled with room, time, date
  $squery = "UPDATE session SET date='$date', time='$time', room='$room', scheduled=1 WHERE id='$id'";
  mysqli_query($mysqli, $squery);
  echo mysqli_error($mysqli);
}

function moveSession($sdate, $stime, $sroom, $id, 
		     $tdate, $ttime, $troom, $mysqli){
  // move session from source to target in the schedule
  $query = "UPDATE schedule SET id='$id' WHERE date='$tdate' AND time='$ttime' AND room ='$troom'";
  mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);

  $query = "UPDATE schedule SET id='' WHERE date='$sdate' AND time='$stime' AND room ='$sroom'";
  mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);
  
  // change the session data so it is scheduled with target room, time, date
  $squery = "UPDATE session SET date='$tdate', time='$ttime', room='$troom' WHERE id='$id'";
  mysqli_query($mysqli, $squery);
  echo mysqli_error($mysqli);
}

function swapSessions($s1date, $s1time, $s1room, $s1id, 
		      $s2date, $s2time, $s2room, $s2id, 
		      $mysqli){
  
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

function swapWithUnscheduledSession($s1id, 
			      $s2date, $s2time, $s2room, $s2id, 
			      $mysqli){
  
  // perform swap in the schedule
  $s1query = "UPDATE schedule SET id='$s1id' WHERE date='$s2date' AND time='$s2time' AND room ='$s2room'";
  mysqli_query($mysqli, $s1query);
  echo mysqli_error($mysqli);
    
  // change the session data so it is scheduled with room, time, date
  $ss1query = "UPDATE session SET date='$s2date', time='$s2time', room='$s2room' WHERE id='$s1id'";
  mysqli_query($mysqli, $ss1query);
  echo mysqli_error($mysqli);
  
  $ss2query = "UPDATE session SET date='', time='', room='', scheduled=0 WHERE id='$s2id'";
  mysqli_query($mysqli, $ss2query);
  echo mysqli_error($mysqli);
}

$type = $_POST['type'];
$uid = mysqli_real_escape_string($mysqli, $_POST['uid']);

if(strcmp("undo", $type) == 0){
  // check whether user has undo privileges
  if(isAdmin($uid, $mysqli)){
    performUndo($mysqli);
  }  
}

if(strcmp("lock", $type) == 0){
  $lock = 1;
  if($_POST['lock'] == "false"){
    $lock = 0;
  }
  $date = mysqli_real_escape_string($mysqli, $_POST['date']);
  $time = mysqli_real_escape_string($mysqli, $_POST['time']);
  $room = mysqli_real_escape_string($mysqli, $_POST['room']);
  
  updateLock($lock, $date, $time, $room, $mysqli);
  
  if(mysqli_affected_rows($mysqli) > 0){
    $data = json_encode(array(
			      "lock" => $lock,
			      "date" => $date,
			      "time" => $time,
			      "room" => $room
			      ));
    
    $previous = json_encode(array(
				  "lock" => 1-$lock,
				  "date" => $date,
				  "time" => $time,
				  "room" => $room
				  ));
    
    recordTransaction($uid, $type, $data, $previous, $mysqli);
  }
}

if(strcmp("unschedule", $type) == 0){
  $id = mysqli_real_escape_string($mysqli, $_POST['id']);
  $date = mysqli_real_escape_string($mysqli, $_POST['date']);
  $time = mysqli_real_escape_string($mysqli, $_POST['time']);
  $room = mysqli_real_escape_string($mysqli, $_POST['room']);

  unscheduleSession($date, $time, $room, $id, $mysqli);
  
  $data = json_encode(array(
			    "id" => $id,
			    "date" => $date,
			    "time" => $time,
			    "room" => $room
			    ));
  
  $previous = json_encode(array(
				"id" => $id,
				"date" => $date,
				"time" => $time,
				"room" => $room
				));
  
  recordTransaction($uid, $type, $data, $previous, $mysqli);
}


if(strcmp("schedule", $type) == 0){
  $id = mysqli_real_escape_string($mysqli, $_POST['id']);
  $date = mysqli_real_escape_string($mysqli, $_POST['date']);
  $time = mysqli_real_escape_string($mysqli, $_POST['time']);
  $room = mysqli_real_escape_string($mysqli, $_POST['room']);
  
  scheduleSession($date, $time, $room, $id, $mysqli);
  
  $data = json_encode(array(
			    "id" => $id,
			    "date" => $date,
			    "time" => $time,
			    "room" => $room
			    ));
  
  $previous = json_encode(array(
				"id" => $id,
				"date" => $date,
				"time" => $time,
				"room" => $room
				));
  recordTransaction($uid, $type, $data, $previous, $mysqli);
}

if(strcmp("move", $type) == 0){
  $id = mysqli_real_escape_string($mysqli, $_POST['id']);
  $sdate = mysqli_real_escape_string($mysqli, $_POST['sdate']);
  $stime = mysqli_real_escape_string($mysqli, $_POST['stime']);
  $sroom = mysqli_real_escape_string($mysqli, $_POST['sroom']);
  $tdate = mysqli_real_escape_string($mysqli, $_POST['tdate']);
  $ttime = mysqli_real_escape_string($mysqli, $_POST['ttime']);
  $troom = mysqli_real_escape_string($mysqli, $_POST['troom']);

  moveSession($sdate, $stime, $sroom, $id, 
	      $tdate, $ttime, $troom, $mysqli);
  
  $data = json_encode(array(
			    "sdate" => $sdate,
			    "stime" => $stime,
			    "sroom" => $sroom,
			    "id" => $id,
			    "tdate" => $tdate,
			    "ttime" => $ttime,
			    "troom" => $troom
			    ));
  
  $previous = json_encode(array(
			    "sdate" => $tdate,
			    "stime" => $ttime,
			    "sroom" => $troom,
			    "id" => $id,
			    "tdate" => $sdate,
			    "ttime" => $stime,
			    "troom" => $sroom
				));

  recordTransaction($uid, $type, $data, $previous, $mysqli);
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

  swapSessions($s1date, $s1time, $s1room, $s1id, 
	       $s2date, $s2time, $s2room, $s2id, 
	       $mysqli);
  

  $data = json_encode(array(
			    "s1id" => $s1id,
			    "s1date" => $s1date,
			    "s1time" => $s1time,
			    "s1room" => $s1room,
			    "s2id" => $s2id,
			    "s2date" => $s2date,
			    "s2time" => $s2time,
			    "s2room" => $s2room
			    ));
  
  $previous = json_encode(array(
			    "s1id" => $s2id,
			    "s1date" => $s1date,
			    "s1time" => $s1time,
			    "s1room" => $s1room,
			    "s2id" => $s1id,
			    "s2date" => $s2date,
			    "s2time" => $s2time,
			    "s2room" => $s2room
				));

  recordTransaction($uid, $type, $data, $previous, $mysqli);
}

if(strcmp("swapWithUnscheduled", $type) == 0){
  $s1id = mysqli_real_escape_string($mysqli, $_POST['s1id']);
  $s2id = mysqli_real_escape_string($mysqli, $_POST['s2id']);
  $s2date = mysqli_real_escape_string($mysqli, $_POST['s2date']);
  $s2time = mysqli_real_escape_string($mysqli, $_POST['s2time']);
  $s2room = mysqli_real_escape_string($mysqli, $_POST['s2room']);

  swapWithUnscheduledSession($s1id, 
		       $s2date, $s2time, $s2room, $s2id, 
		       $mysqli);
  

  $data = json_encode(array(
			    "s1id" => $s1id,
			    "s2id" => $s2id,
			    "s2date" => $s2date,
			    "s2time" => $s2time,
			    "s2room" => $s2room
			    ));
  
  $previous = json_encode(array(
			    "s1id" => $s2id,
			    "s2id" => $s1id,
			    "s2date" => $s2date,
			    "s2time" => $s2time,
			    "s2room" => $s2room
				));

  recordTransaction($uid, $type, $data, $previous, $mysqli);
}

$mysqli->close();

?>
