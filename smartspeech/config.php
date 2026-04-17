<?php
$host='sqlXXX.infinityfree.com';
$db='if0_XXXXXXX_smartspeech';
$user='if0_XXXXXXX';
$pass='YOUR_DB_PASSWORD';
$conn=new mysqli($host,$user,$pass,$db);
if($conn->connect_error){ die('DB Error'); }
?>