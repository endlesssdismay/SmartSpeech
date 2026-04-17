<?php include 'config.php';
$data=json_decode(file_get_contents('php://input'),true);
$name=$data['name']; $pass=$data['password'];
$stmt=$conn->prepare('SELECT id,name,section,password FROM students WHERE name=?');
$stmt->bind_param('s',$name); $stmt->execute();
$res=$stmt->get_result();
if($row=$res->fetch_assoc()){
 if(password_verify($pass,$row['password'])) echo json_encode($row);
 else echo 'invalid';
}else echo 'invalid';