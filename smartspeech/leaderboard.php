<?php include 'config.php';
$sql="SELECT students.name, students.section, scores.practice, scores.score FROM students LEFT JOIN scores ON students.id=scores.student_id ORDER BY score DESC";
$r=$conn->query($sql); $rows=[]; while($x=$r->fetch_assoc()) $rows[]=$x; echo json_encode($rows);