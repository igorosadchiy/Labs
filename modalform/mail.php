<?php

if ($_POST['phone']) {

    $phone    = $_POST['phone'];
	$name    = $_POST['imya'];
	
    $date     = date('Y-m-d');
    $time     = date('H:i:s');
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=utf-8\r\n";
    $headers .= "Date: ".$date."\r\n";
    $headers .= "From: kievteplo\r\n";
    $mailto   = "kievteplo@ukr.net";

    $subject = "kievteplo | Запрос на звонок | $date, $time";
    $text    = "Запрос на звонок с kievteplo<br />";
    $text   .= "Имя: <strong>$name</strong><br />";
    $text   .= "Телефон: <strong>$phone</strong><br />";
    $text   .= "Дата: <strong>$date </strong><br />";
    $text   .= "Время: <strong>$time</strong><br />";
    

    mail($mailto,$subject,$text,$headers);
}