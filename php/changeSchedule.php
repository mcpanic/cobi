<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "settings.php";

$failedTransaction = false;

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

function recordTransaction($uid, $type, $previousType, $localHash, $data, $previous, $mysqli){
  $trans = "INSERT into transactions (uid, type, previousType, localHash, data, previous) VALUES ('$uid', '$type', '$previousType', '$localHash', '$data', '$previous')";
  mysqli_query($mysqli, $trans); 
  echo mysqli_error($mysqli); 
  
  $query = "select id, transactions.uid, transactions.type, transactions.previousType, localHash, data, previous, name from transactions LEFT JOIN (users) ON (users.uid=transactions.uid) order by id DESC limit 1";
  //  $query = "select * from transactions order by id DESC limit 1";
  $result = mysqli_query($mysqli, $query);  
  echo mysqli_error($mysqli); 
  
  // return the transaction record
  $row = $result->fetch_assoc();
  if($row != null){
    $row["data"] = json_decode($row["data"], true);
    $row["previous"] = json_decode($row["previous"], true);
    return $row;
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
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function unlockSlot($date, $time, $room, $mysqli){
  if(isLocked($date, $time, $room, $mysqli)){
    $query = "UPDATE schedule SET locked=0 WHERE date='$date' AND time='$time' AND room ='$room'";
    $result = mysqli_query($mysqli, $query);
    echo mysqli_error($mysqli);
  } else {
    $GLOBALS['failedTransaction'] = true;
  }
}

function sessionIsInSlot($date, $time, $room, $id, $mysqli){
  $query = "SELECT id from schedule where date='$date' AND time='$time' AND room ='$room' AND id='$id'";
  $result = mysqli_query($mysqli, $query);
  if(mysqli_num_rows($result) > 0){
    return true;
  }else{
    return false;
  }
}

function slotIsEmpty($date, $time, $room, $mysqli){
  $query = "SELECT id from schedule where date='$date' AND time='$time' AND room ='$room' AND id=''";
  $result = mysqli_query($mysqli, $query);
  if(mysqli_num_rows($result) > 0){
    return true;
  }else{
    return false;
  }
}

function isScheduled($id, $mysqli){
  $query = "SELECT id from session where id='$id' AND scheduled=1";
  $result = mysqli_query($mysqli, $query);
  if(mysqli_num_rows($result) > 0){
    return true;
  }else{
    return false;
  }
}

function unscheduleSession($date, $time, $room, $id, $mysqli){
  if(sessionIsInSlot($date, $time, $room, $id, $mysqli)){
    // remove the session from the schedule
    $query = "UPDATE schedule SET id='' WHERE date='$date' AND time='$time' AND room ='$room' AND id='$id'";
    mysqli_query($mysqli, $query);
    echo mysqli_error($mysqli);
    
    // change the session data so it is unscheduled and does not have room, time, date
    $squery = "UPDATE session SET date='', time='', room='', scheduled=0 WHERE id='$id'";
    mysqli_query($mysqli, $squery);
    echo mysqli_error($mysqli);
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function scheduleSession($date, $time, $room, $id, $mysqli){
  //  if(slotIsEmpty($date, $time, $room)){// and 
  if(!isScheduled($id, $mysqli) and slotIsEmpty($date, $time, $room, $mysqli)){
      // add session to the schedule
      $query = "UPDATE schedule SET id='$id' WHERE date='$date' AND time='$time' AND room ='$room'";
      mysqli_query($mysqli, $query);
      echo mysqli_error($mysqli);
      
      // change the session data so it is scheduled with room, time, date
      $squery = "UPDATE session SET date='$date', time='$time', room='$room', scheduled=1 WHERE id='$id'";
      mysqli_query($mysqli, $squery);
      echo mysqli_error($mysqli);
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function moveSession($sdate, $stime, $sroom, $id, 
		     $tdate, $ttime, $troom, $mysqli){
  if(sessionIsInSlot($sdate, $stime, $sroom, $id, $mysqli) and slotIsEmpty($tdate, $ttime, $troom, $mysqli)){
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
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function swapSessions($s1date, $s1time, $s1room, $s1id, 
		      $s2date, $s2time, $s2room, $s2id, 
		      $mysqli){
  if(sessionIsInSlot($s1date, $s1time, $s1room, $s1id, $mysqli) and 
     sessionIsInSlot($s2date, $s2time, $s2room, $s2id, $mysqli)){
    
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
  }else {
    $GLOBALS['failedTransaction'] = true;
  }
}
  
function swapWithUnscheduledSession($s1id, 
				    $s2date, $s2time, $s2room, $s2id, 
				    $mysqli){
  if(!isScheduled($s1id, $mysqli) and sessionIsInSlot($s2date, $s2time, $s2room, $s2id, $mysqli)){

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
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function paperInSession($paper, $sessionPapers){
  return in_array($paper, $sessionPapers);
}

function samePapersInSession($id, $papers, $mysqli){
  $qquery = "SELECT submissions from session where id='$id'";
  $result = mysqli_query($mysqli, $qquery);
  $row = $result->fetch_assoc();
  
  if($row != null){
    $sessionPapers = explode(",", $row['submissions']);
    
    if(count($sessionPapers) == count($papers)){
      foreach ($papers as $paper){
	if(!paperInSession($paper, $sessionPapers)){
	  return false;
	}
      }
      return true;
    }
  }
  return false;
}

function papersAreInSession($id, $papers, $mysqli){
  $qquery = "SELECT submissions from session where id='$id'";
  $result = mysqli_query($mysqli, $qquery);
  $row = $result->fetch_assoc();
 
  if($row != null){
    $sessionPapers = explode(",", $row['submissions']);
    foreach ($papers as $paper){
      if(!paperInSession($paper, $sessionPapers)){
	return false;
      }
    }
    return true;
  }
  return false;
}

/// start paper level functions
function reorderPapers($id, $paperOrder, $mysqli){
  if(samePapersInSession($id, explode(",", $paperOrder), $mysqli)){
      // change the session data so it is ordered correctly
      $query = "UPDATE session SET submissions='$paperOrder' WHERE id='$id'";
      mysqli_query($mysqli, $query);
      echo mysqli_error($mysqli);
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function swapPapers($s1id, $p1id, $s2id, $p2id, $mysqli){
  if(papersAreInSession($s1id, array($p1id), $mysqli) and 
     papersAreInSession($s2id, array($p2id), $mysqli)){
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
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function isScheduledPaper($id, $mysqli){
  $query = "SELECT id from entity where session='null' AND id='$id'";
  $result = mysqli_query($mysqli, $query);
  if(mysqli_num_rows($result) > 0){
    return false;
  }else{
    return true;
  }
}

function swapWithUnscheduledPaper($p1id, $s2id, $p2id, $mysqli){
  if(!isScheduledPaper($p1id, $mysqli) and  
     papersAreInSession($s2id, array($p2id), $mysqli)){
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
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function movePaper($s1id, $p1id, $s2id, $mysqli){
  if(papersAreInSession($s1id, array($p1id), $mysqli)){
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
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function unschedulePaper($sid, $pid, $mysqli){
  if(papersAreInSession($sid, array($pid), $mysqli)){
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
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}

function schedulePaper($sid, $pid, $mysqli){
  if(!isScheduledPaper($pid, $mysqli)){
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
  }else{
    $GLOBALS['failedTransaction'] = true;
  }
}  

/// end paper level
$transaction = json_decode($_POST['transaction'], true);
$lastKnownTransaction = $_POST['lastKnownTransaction'];

$type = $transaction['type'];
$previousType = $transaction['previousType'];
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
  $newPaperOrder = mysqli_real_escape_string($mysqli, $transaction['data']['paperOrder']);
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
 
// Get new transactions from server
$transQ = "select id, transactions.uid, transactions.type, transactions.previousType, localHash, data, previous, name from transactions LEFT JOIN (users) ON (users.uid=transactions.uid) where id > $lastKnownTransaction order by id DESC";
$transTable =  mysqli_query($mysqli, $transQ);
echo mysqli_error($mysqli);
$newTransactions = array();

while ($row = $transTable->fetch_assoc()) {
  $row["data"] = json_decode($row["data"], true);
  $row["previous"] = json_decode($row["previous"], true);
  array_unshift($newTransactions, $row);
}

if(!$GLOBALS['failedTransaction']){ //;mysqli_affected_rows($mysqli) > 0){
  echo json_encode(array('transaction' => recordTransaction($uid, $type, $previousType, $localHash, $data, $previous, $mysqli),
			 'newTransactions' => $newTransactions));
}else{
  echo json_encode(array('transaction' => $transaction,
			 'newTransactions' => $newTransactions));
}

$mysqli->close();
?>
