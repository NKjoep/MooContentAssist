<?php 
header('Content-type: application/json');
$num = rand(0, 7);
$get = $_GET['ajax-parameter'];
function genRandomString() {
    $length = rand(1, 11);
    $characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    $string = "";    
    for ($p = 0; $p < $length; $p++) {
        $string .= $characters[mt_rand(0, strlen($characters))];
    }
    return $string;
}

if ($get!=$null) {
	
	echo "{\n";
	if ($get!="/") {
		$splitted = preg_split("/\./",$get);
		foreach($splitted as $a) {
			if ($a != "/") {
				echo "\"".$a."\": {\n";
			}
		}
	}
	for($i=0;$i<rand(1, 7);$i++) {
		$text = genRandomString();
		echo "\n\"randomFromAjax_".$text."\":null,";
	}
	$text = genRandomString();
	echo "\n\"".$text."\":null";

	if ($get!="/") {
		$splitted = preg_split("/\./",$get);
		foreach($splitted as $a) {
			if ($a != "/") {
				echo "\n\n}";
			}
		}
	}
	echo "\n}";
}
else {
	echo "null";
}
?>