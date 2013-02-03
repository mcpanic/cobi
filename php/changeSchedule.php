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

function recordTransaction($uid, $type, $localHash, $data, $previous, $mysqli){
  $trans = "INSERT into transactions (uid, type, localHash, data, previous) VALUES ('$uid', '$type', '$localHash', '$data', '$previous')";
  mysqli_query($mysqli, $trans); 
  echo mysqli_error($mysqli); 
  
  $query = "select id, transactions.uid, transactions.type, localHash, data, previous, name from transactions LEFT JOIN (users) ON (users.uid=transactions.uid) order by id DESC limit 1";
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

function isLocked($date, $time, $room, $mysqli){
  $query = "SELECT locked from schedule where date='$date' AND time='$time' AND room ='$room' AND locked=1";
  $result = mysqli_query($mysqli, $query);
  if(mysqli_num_rows($result) > 0){
    return true;
  }else{
    return false;
  }
}

function lockSlot($date, $time, $room, $mysqli){
  if(!isLocked($date, $time, $room, $mysqli)){
    $query = "UPDATE schedule SET locked=1 WHERE date='$date' AND time='$time' AND room ='$room'";
    $result = mysqli_query($mysqli, $query);
    echo mysqli_error($mysqli);
  }  
}

function unlockSlot($date, $time, $room, $mysqli){
  if(isLocked($date, $time, $room, $mysqli)){
    $query = "UPDATE schedule SET locked=0 WHERE date='$date' AND time='$time' AND room ='$room'";
    $result = mysqli_query($mysqli, $query);
    echo mysqli_error($mysqli);
  } 
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
  $ss1query = "UPDATE session SET date='$s2date', time='$s2time', room='$s2room', scheduled=1 WHERE id='$s1id'";
  mysqli_query($mysqli, $ss1query);
  echo mysqli_error($mysqli);
  
  $ss2query = "UPDATE session SET date='', time='', room='', scheduled=0 WHERE id='$s2id'";
  mysqli_query($mysqli, $ss2query);
  echo mysqli_error($mysqli);
}

/// start paper level functions
function reorderPapers($id, $paperOrder, $mysqli){
  // change the session data so it is scheduled with room, time, date
  $query = "UPDATE session SET submissions='$paperOrder' WHERE id='$id'";
  mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);
}

function swapPapers($s1id, $p1id, $s2id, $p2id, $mysqli){
  // change the session data so each session has the right paper
  $s1query = "SELECT submissions from session where id='$s1id'";
  $result1 = mysqli_query($mysqli, $s1query);
  echo mysqli_error($mysqli);
  
  // return the transaction record
  $row = $result1->fetch_assoc();
  if($row != null){
    $s1subs = explode(",", $row["submissions"]);
    foreach ($s1subs as &$s1sub) {
      if($s1sub == $p1id){
	$s1sub = $p2id;
      }
    }
    $s1newsubs = implode(",", $s1subs);
    
    $s1upquery = "UPDATE session SET submissions='$s1newsubs' WHERE id='$s1id'";    
    mysqli_query($mysqli, $s1upquery);
    echo mysqli_error($mysqli);
  }
  
  $s2query = "SELECT submissions from session where id='$s2id'";
  $result2 = mysqli_query($mysqli, $s2query);
  echo mysqli_error($mysqli);
  
  // return the transaction record
  $row = $result2->fetch_assoc();
  if($row != null){
    $s2subs = explode(",", $row["submissions"]);
    foreach ($s2subs as &$s2sub) {
      if($s2sub == $p2id){
	$s2sub = $p1id;
      }
    }
    $s2newsubs = implode(",", $s2subs);
    
    $s2upquery = "UPDATE session SET submissions='$s2newsubs' WHERE id='$s2id'";    
    mysqli_query($mysqli, $s2upquery);
    echo mysqli_error($mysqli);
  }
  
  // change the entity data so that each submission is associated with the right 
  // session
  $e1query = "UPDATE entity SET session='$s1id' WHERE id='$p2id'";  
  mysqli_query($mysqli, $e1query);
  echo mysqli_error($mysqli);
  
  $e2query = "UPDATE entity SET session='$s2id' WHERE id='$p1id'";  
  mysqli_query($mysqli, $e2query);
  echo mysqli_error($mysqli);
}

function swapWithUnscheduledPaper($p1id, $s2id, $p2id, $mysqli){
  
  $s2query = "SELECT submissions from session where id='$s2id'";
  $result2 = mysqli_query($mysqli, $s2query);
  echo mysqli_error($mysqli);
  
  // return the transaction record
  $row = $result2->fetch_assoc();
  if($row != null){
    $s2subs = explode(",", $row["submissions"]);
    foreach ($s2subs as &$s2sub) {
      if($s2sub == $p2id){
	$s2sub = $p1id;
      }
    }
    $s2newsubs = implode(",", $s2subs);
    
    $s2upquery = "UPDATE session SET submissions='$s2newsubs' WHERE id='$s2id'";    
    mysqli_query($mysqli, $s2upquery);
    echo mysqli_error($mysqli);
  }
  
  // change the entity data so that each submission is associated with the right 
  // session
  $e1query = "UPDATE entity SET session='null' WHERE id='$p2id'";  
  mysqli_query($mysqli, $e1query);
  echo mysqli_error($mysqli);
  
  $e2query = "UPDATE entity SET session='$s2id' WHERE id='$p1id'";  
  mysqli_query($mysqli, $e2query);
  echo mysqli_error($mysqli);
}

function movePaper($s1id, $p1id, $s2id, $mysqli){
  // change the session data so each session has the right paper
  $s1query = "SELECT submissions from session where id='$s1id'";
  $result1 = mysqli_query($mysqli, $s1query);
  echo mysqli_error($mysqli);
  
  // return the transaction record
  $row = $result1->fetch_assoc();
  if($row != null){
    $s1subs = explode(",", $row["submissions"]);
    $s1subs = array_diff($s1subs, array($p1id));
    $s1newsubs = implode(",", $s1subs);
    
    $s1upquery = "UPDATE session SET submissions='$s1newsubs' WHERE id='$s1id'";    
    mysqli_query($mysqli, $s1upquery);
    echo mysqli_error($mysqli);
  }
  
  $s2query = "SELECT submissions from session where id='$s2id'";
  $result2 = mysqli_query($mysqli, $s2query);
  echo mysqli_error($mysqli);
  
  // return the transaction record
  $row = $result2->fetch_assoc();
  if($row != null){
    $s2subs = explode(",", $row["submissions"]);
    array_unshift($s2subs, $p1id);
    $s2newsubs = implode(",", $s2subs);

    $s2upquery = "UPDATE session SET submissions='$s2newsubs' WHERE id='$s2id'";    
    mysqli_query($mysqli, $s2upquery);
    echo mysqli_error($mysqli);
  }
  
  // change the entity data so that each submission is associated with the right 
  // session
  $e1query = "UPDATE entity SET session='$s2id' WHERE id='$p1id'";  
  mysqli_query($mysqli, $e1query);
  echo mysqli_error($mysqli);
}

function unschedulePaper($sid, $pid, $mysqli){
  // change the session data so each session has the right paper
  $s1query = "SELECT submissions from session where id='$sid'";
  $result1 = mysqli_query($mysqli, $s1query);
  echo mysqli_error($mysqli);
  
  // return the transaction record
  $row = $result1->fetch_assoc();
  if($row != null){
    $s1subs = explode(",", $row["submissions"]);
    $s1subs = array_diff($s1subs, array($pid));
    $s1newsubs = implode(",", $s1subs);
    
    $s1upquery = "UPDATE session SET submissions='$s1newsubs' WHERE id='$sid'";    
    mysqli_query($mysqli, $s1upquery);
    echo mysqli_error($mysqli);
  }
  
  // change the entity data so that submission is associated with the right 
  // session
  $e1query = "UPDATE entity SET session='null' WHERE id='$pid'";  
  mysqli_query($mysqli, $e1query);
  echo mysqli_error($mysqli);
}

function schedulePaper($sid, $pid, $mysqli){
  // change the session data so each session has the right paper
  $s1query = "SELECT submissions from session where id='$sid'";
  $result1 = mysqli_query($mysqli, $s1query);
  echo mysqli_error($mysqli);
  
  // return the transaction record
  $row = $result1->fetch_assoc();
  if($row != null){
    $s1subs = explode(",", $row["submissions"]);
    array_unshift($s1subs, $pid);
    $s1newsubs = implode(",", $s1subs);
    
    $s1upquery = "UPDATE session SET submissions='$s1newsubs' WHERE id='$sid'";    
    mysqli_query($mysqli, $s1upquery);
    echo mysqli_error($mysqli);
  }
  
  // change the entity data so that submission is associated with the right 
  // session
  $e1query = "UPDATE entity SET session='$sid' WHERE id='$pid'";  
  mysqli_query($mysqli, $e1query);
  echo mysqli_error($mysqli);
}


/// end paper level
$transaction = json_decode($_POST['transaction'], true);
$type = $transaction['type'];
$uid = mysqli_real_escape_string($mysqli, $transaction['uid']);
$localHash = mysqli_real_escape_string($mysqli, $transaction['localHash']);
$data = mysqli_real_escape_string($mysqli, json_encode($transaction['data']));
$previous = mysqli_real_escape_string($mysqli, json_encode($transaction['previous']));

switch ($type){
case "unlock":
  $date = mysqli_real_escape_string($mysqli, $transaction['data']['date']);
  $time = mysqli_real_escape_string($mysqli, $transaction['data']['time']);
  $room = mysqli_real_escape_string($mysqli, $transaction['data']['room']);
  unlockSlot($date, $time, $room, $mysqli);
  break;
case "lock":
  $date = mysqli_real_escape_string($mysqli, $transaction['data']['date']);
  $time = mysqli_real_escape_string($mysqli, $transaction['data']['time']);
  $room = mysqli_real_escape_string($mysqli, $transaction['data']['room']);
  lockSlot($date, $time, $room, $mysqli);
  break;
case "unschedule":
  $id = mysqli_real_escape_string($mysqli, $transaction['data']['id']);
  $date = mysqli_real_escape_string($mysqli, $transaction['data']['date']);
  $time = mysqli_real_escape_string($mysqli, $transaction['data']['time']);
  $room = mysqli_real_escape_string($mysqli, $transaction['data']['room']);
  unscheduleSession($date, $time, $room, $id, $mysqli);
  break;
case "schedule":
  $id = mysqli_real_escape_string($mysqli, $transaction['data']['id']);
  $date = mysqli_real_escape_string($mysqli, $transaction['data']['date']);
  $time = mysqli_real_escape_string($mysqli, $transaction['data']['time']);
  $room = mysqli_real_escape_string($mysqli, $transaction['data']['room']);
  scheduleSession($date, $time, $room, $id, $mysqli);
  break;
case "move":
  $id = mysqli_real_escape_string($mysqli, $transaction['data']['id']);
  $sdate = mysqli_real_escape_string($mysqli, $transaction['data']['sdate']);
  $stime = mysqli_real_escape_string($mysqli, $transaction['data']['stime']);
  $sroom = mysqli_real_escape_string($mysqli, $transaction['data']['sroom']);
  $tdate = mysqli_real_escape_string($mysqli, $transaction['data']['tdate']);
  $ttime = mysqli_real_escape_string($mysqli, $transaction['data']['ttime']);
  $troom = mysqli_real_escape_string($mysqli, $transaction['data']['troom']);
  moveSession($sdate, $stime, $sroom, $id, 
	      $tdate, $ttime, $troom, $mysqli);
  break;
case "swap":
  $s1id = mysqli_real_escape_string($mysqli, $transaction['data']['s1id']);
  $s1date = mysqli_real_escape_string($mysqli, $transaction['data']['s1date']);
  $s1time = mysqli_real_escape_string($mysqli, $transaction['data']['s1time']);
  $s1room = mysqli_real_escape_string($mysqli, $transaction['data']['s1room']);
  $s2id = mysqli_real_escape_string($mysqli, $transaction['data']['s2id']);
  $s2date = mysqli_real_escape_string($mysqli, $transaction['data']['s2date']);
  $s2time = mysqli_real_escape_string($mysqli, $transaction['data']['s2time']);
  $s2room = mysqli_real_escape_string($mysqli, $transaction['data']['s2room']);
  swapSessions($s1date, $s1time, $s1room, $s1id, 
	       $s2date, $s2time, $s2room, $s2id, 
	       $mysqli);
  break;
case "swapWithUnscheduled":
  $s1id = mysqli_real_escape_string($mysqli, $transaction['data']['s1id']);
  $s2id = mysqli_real_escape_string($mysqli, $transaction['data']['s2id']);
  $s2date = mysqli_real_escape_string($mysqli, $transaction['data']['s2date']);
  $s2time = mysqli_real_escape_string($mysqli, $transaction['data']['s2time']);
  $s2room = mysqli_real_escape_string($mysqli, $transaction['data']['s2room']);
  swapWithUnscheduledSession($s1id, 
		       $s2date, $s2time, $s2room, $s2id, 
		       $mysqli);
  break;
case "reorderPapers":
  $id = mysqli_real_escape_string($mysqli, $transaction['data']['id']);
  $newPaperOrder = mysqli_real_escape_string($mysqli, $transaction['data']['newPaperOrder']);
  $previousPaperOrder = mysqli_real_escape_string($mysqli, $transaction['data']['previousPaperOrder']);
  reorderPapers($id, $newPaperOrder, $mysqli);
  break;
case "swapPapers":
  $s1id = mysqli_real_escape_string($mysqli, $transaction['data']['s1id']);
  $p1id = mysqli_real_escape_string($mysqli, $transaction['data']['p1id']);
  $s2id = mysqli_real_escape_string($mysqli, $transaction['data']['s2id']);
  $p2id = mysqli_real_escape_string($mysqli, $transaction['data']['p2id']);
  swapPapers($s1id, $p1id, $s2id, $p2id, $mysqli);
  break;
case "swapWithUnscheduledPaper":
  $p1id = mysqli_real_escape_string($mysqli, $transaction['data']['p1id']);
  $s2id = mysqli_real_escape_string($mysqli, $transaction['data']['s2id']);
  $p2id = mysqli_real_escape_string($mysqli, $transaction['data']['p2id']);
  swapWithUnscheduledPaper($p1id, $s2id, $p2id, $mysqli);
  break;
case "movePaper":
  $s1id = mysqli_real_escape_string($mysqli, $transaction['data']['s1id']);
  $p1id = mysqli_real_escape_string($mysqli, $transaction['data']['p1id']);
  $s2id = mysqli_real_escape_string($mysqli, $transaction['data']['s2id']);
  movePaper($s1id, $p1id, $s2id, $mysqli);
  break;
case "unschedulePaper":
  $sid = mysqli_real_escape_string($mysqli, $transaction['data']['sid']);
  $pid = mysqli_real_escape_string($mysqli, $transaction['data']['pid']);
  unschedulePaper($sid, $pid, $mysqli);
  break;
case "schedulePaper":
  $sid = mysqli_real_escape_string($mysqli, $transaction['data']['sid']);
  $pid = mysqli_real_escape_string($mysqli, $transaction['data']['pid']);
  schedulePaper($sid, $pid, $mysqli);
  break;
} 
 
if(mysqli_affected_rows($mysqli) > 0){
  recordTransaction($uid, $type, $localHash, $data, $previous, $mysqli);
}else{
  echo json_encode($transaction);
}

$mysqli->close();
?>
