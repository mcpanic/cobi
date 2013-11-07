<?php
$PRODUCTION = true;

if($PRODUCTION){
  define("COBI_MYSQL_SERVER", "mysql.csail.mit.edu");
  define("COBI_MYSQL_USERNAME", "cobi");
  define("COBI_MYSQL_PASSWORD", "su4Biha");
  define("COBI_MYSQL_DATABASE", "cobi");
}else{
  define("COBI_MYSQL_SERVER", "mysql.csail.mit.edu");
  define("COBI_MYSQL_USERNAME", "cobi");
  define("COBI_MYSQL_PASSWORD", "su4Biha");
  define("COBI_MYSQL_DATABASE", "cobiDev");
}
?>
