<?php include 'config.php';
$data=json_decode(file_get_contents('php://input'),true);
$id=$data['student_id']; $practice=$data['practice']; $score=$data['score'];
$stmt=$conn->prepare('INSERT INTO scores(student_id,practice,score) VALUES(?,?,?) ON DUPLICATE KEY UPDATE practice=?, score=?');
$stmt->bind_param('iiiii',$id,$practice,$score,$practice,$score);
$stmt->execute(); echo 'saved';