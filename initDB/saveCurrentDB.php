<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include "../settings/settings.php";

if(count($argv) != 3 or $argv[1] != 'pineapple'){
  echo "wrong password" . "\n";
  exit(1);
}

$mysqli = mysqli_connect(COBI_MYSQL_SERVER, COBI_MYSQL_USERNAME, COBI_MYSQL_PASSWORD, COBI_MYSQL_DATABASE);

$query = "CREATE TABLE saved_initial_schedule_$argv[2] LIKE initial_schedule";
mysqli_query($mysqli, $query);
echo  mysqli_error($mysqli);

$query = "INSERT saved_initial_schedule_$argv[2] SELECT * FROM initial_schedule";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$query = "CREATE TABLE saved_initial_session_$argv[2] LIKE initial_session";
mysqli_query($mysqli, $query);
echo  mysqli_error($mysqli);

$query = "INSERT saved_initial_session_$argv[2] SELECT * FROM initial_session";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$query = "CREATE TABLE saved_initial_entity_$argv[2] LIKE initial_entity";
mysqli_query($mysqli, $query);
echo  mysqli_error($mysqli);

$query = "INSERT saved_initial_entity_$argv[2] SELECT * FROM initial_entity";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$query = "CREATE TABLE saved_transactions_$argv[2] LIKE transactions";
mysqli_query($mysqli, $query);
echo  mysqli_error($mysqli);

$query = "INSERT saved_transactions_$argv[2] SELECT * FROM transactions";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$query = "CREATE TABLE saved_schedule_$argv[2] LIKE schedule";
mysqli_query($mysqli, $query);
echo  mysqli_error($mysqli);

$query = "INSERT saved_schedule_$argv[2] SELECT * FROM schedule";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$query = "CREATE TABLE saved_session_$argv[2] LIKE session";
mysqli_query($mysqli, $query);
echo  mysqli_error($mysqli);

$query = "INSERT saved_session_$argv[2] SELECT * FROM session";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$query = "CREATE TABLE saved_entity_$argv[2] LIKE entity";
mysqli_query($mysqli, $query);
echo  mysqli_error($mysqli);

$query = "INSERT saved_entity_$argv[2] SELECT * FROM entity";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);

$query = "CREATE TABLE saved_authors_$argv[2] LIKE authors";
mysqli_query($mysqli, $query);
echo  mysqli_error($mysqli);

$query = "INSERT saved_authors_$argv[2] SELECT * FROM authors";
mysqli_query($mysqli, $query);
echo mysqli_error($mysqli);


$mysqli->close();

?>