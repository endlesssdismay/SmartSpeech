<?php include 'config.php';
$data=json_decode(file_get_contents('php://input'),true);
$name=$data['name']; $section=$data['section'];
$pass=password_hash($data['password'], PASSWORD_DEFAULT);
$stmt=$conn->prepare('INSERT INTO students(name,section,password) VALUES(?,?,?)');
$stmt->bind_param('sss',$name,$section,$pass);
echo $stmt->execute() ? 'success' : 'exists';