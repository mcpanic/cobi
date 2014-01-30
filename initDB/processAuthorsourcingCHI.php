<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";
ini_set('auto_detect_line_endings',true);

function checkAuthor($name, $paperId, $paperAuthor){
  $bestScore = 100000;
  $bestMatch = null; 

  if(!array_key_exists($paperId, $paperAuthor)){
    return array('id' => '',
		 'name' => '',
		 'score' => $bestScore);
  }
  $paper = $paperAuthor[$paperId];

  if(trim($name) == ""){
    return array('id' => '',
		 'name' => '',
		 'score' => $bestScore);
  }
  foreach ($paper as $authorId => $authorData){
    $score = levenshtein(strtolower($authorData), strtolower($name));
    if($score < $bestScore){
      $bestScore = $score;
      $bestMatch = array('id' => $authorId,
			 'name' => $authorData,
			 'score' => $score);
    }
  }
  return $bestMatch;
}

function startsWith($haystack, $needle)
{
  return !strncmp($haystack, $needle, strlen($needle));
}

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

$contents = file_get_contents($argv[1]);

$query = "select authorId, id, givenName, middleInitial, familyName from authors";
$authorTable = mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);
while ($row = $authorTable->fetch_assoc()) {
  $paperAuthor[$row['id']][$row['authorId']] = $row['givenName'] . " " . $row['familyName'];
}

$query = "CREATE TABLE authorsourcing (authorId varchar(128), name text, enteredName text, id varchar(128), options text, relevant text, great text, ok text, notsure text, notok text, interested text, options1120 text, more1 varchar(32), more2 varchar(32), special13 text, special46 text)"; 
 mysqli_query($mysqli, $query); 
 echo mysqli_error($mysqli); 

$lines = explode("\n", $contents);
foreach ($lines as $lin){
  if(!startsWith($lin, '2014')){
    continue;
  }

  $pattern = '/(,)(?=(?:[^"]|"[^"]*")*$)/';
  $replacement = ';';
  $lin = preg_replace($pattern, $replacement, $lin);
  $line = explode(";", $lin);
  $name = $line[3];
  $name = trim($name, '\"');
  if(strpos($name, ',')){
    $name = explode(",", $name);
    $name = $name[0];
  }
  $paperId = $line[4];
  $bestAuthorMatch = checkAuthor($name, $paperId, $paperAuthor);
  $matchedAuthorId = "";
  $matchedAuthorName = "";
  if($bestAuthorMatch['score'] <= 10){
    $matchedAuthorId = mysqli_real_escape_string($mysqli, $bestAuthorMatch['id']);
    $matchedAuthorName = mysqli_real_escape_string($mysqli, $bestAuthorMatch['name']);
  }
  $enteredName = mysqli_real_escape_string($mysqli, $line[3]);
  $paperId = mysqli_real_escape_string($mysqli, $line[4]);
  $options = mysqli_real_escape_string($mysqli, trim($line[6], '"'));
  $great = mysqli_real_escape_string($mysqli, trim($line[7], '"'));
  $ok = mysqli_real_escape_string($mysqli, trim($line[8], '"'));
  $notsure = mysqli_real_escape_string($mysqli, trim($line[10], '"'));
  $notok = mysqli_real_escape_string($mysqli, trim($line[9], '"'));
  $interested = mysqli_real_escape_string($mysqli, trim($line[11], '"'));
  $options1120 = mysqli_real_escape_string($mysqli, trim($line[12], '"'));
  $more1 = mysqli_real_escape_string($mysqli, trim($line[13], '"'));
  $more2 = mysqli_real_escape_string($mysqli, trim($line[14], '"'));
  $special13 = mysqli_real_escape_string($mysqli, trim($line[15], '"'));
  $special46 = mysqli_real_escape_string($mysqli, trim($line[16], '"'));
  $relevant = "";
  if(count($line) > 17){
    $relevant = mysqli_real_escape_string($mysqli, trim($line[17], '"'));
  }
  
  $query = "insert into authorsourcing (authorId, name, enteredName, id, options, great, ok, notsure, notok, relevant, interested, options1120, more1, more2, special13, special46) values ('$matchedAuthorId', '$matchedAuthorName', '$enteredName', '$paperId', '$options', '$great', '$ok', '$notsure', '$notok', '$relevant', '$interested', '$options1120', '$more1', '$more2', '$special13', '$special46')";
  mysqli_query($mysqli, $query);
  echo mysqli_error($mysqli);
}
  