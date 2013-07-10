<?php
/**
 * The MIT License
 * 
 * Copyright (c) 2013 株式会社バイオス (http://www.bios-net.co.jp/index.html)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
	require_once('./log4php/Logger.php');
	Logger::configure('./log4php/log4php.properties');
	$logger = Logger::getLogger('logger');
	
    setlocale( LC_ALL, 'ja_JP.UTF-8' );
    
    date_default_timezone_set('Asia/Tokyo');
	
	$from = $_POST['from'];
	$to = $_POST['to'];
	$sensorNo = $_POST['sensorNo'];
	$sensorName = $_POST['sensorName'];
	$user_agent = $_SERVER['HTTP_USER_AGENT'];
	
	if (empty($from)) {
		$logger->error("温湿度データダウンロード日の受信に失敗しました。");
		header("HTTP/1.0. 500 Internal Server Error");
		throw new Exception("温湿度データダウンロード日の受信に失敗しました。");
		return;
	} else if (empty($sensorNo)) {
		 $logger->error("温湿度センサー番号の受信に失敗しました。");
		header("HTTP/1.0. 500 Internal Server Error");
		throw new Exception("温湿度センサー番号の受信に失敗しました。");
		return;
	} else if (! checkdate(date('m', strtotime($from)), date('d', strtotime($from)), date('Y', strtotime($from))) || ! empty($to) && ! checkdate(date('m', strtotime($to)), date('d', strtotime($to)), date('Y', strtotime($to)))) {
		 $logger->error("入力された日付が正しくありません。from:" . $from . "～to:" . $to);
		header("HTTP/1.0. 500 Internal Server Error");
		throw new Exception("入力された日付が正しくありません。from:" . $from . "～to:" . $to);
		return;
	}
	
	$logger->info("from:" . $from);
	$logger->info("to:" . $to);
	$logger->info("sensorNo:" . $sensorNo);
	$logger->info("sensorName:" . $sensorName);
	
	// ダウンロードする日数によってファイル名と指定期間の日数を決定
	$daydiff = 0;
	if (empty($to)) {
		$fileName = date('Ymd', strtotime($from)) . "-" . $sensorName . ".csv";
	} else if ($from == $to) {
		$fileName = date('Ymd', strtotime($from)) . "-" . $sensorName . ".csv";
	} else {
		$fileName = date('Ymd', strtotime($from)) . "-" . date('Ymd', strtotime($to)) . "-" . $sensorName . ".csv";
		$daydiff = (strtotime($to) - strtotime($from)) / (3600 * 24);
	}
	
	// 温湿度データの作成
	$downloadData = "";
	for ($i = 0; $i <= $daydiff; $i++) {
		$d = date("Y-m-d", strtotime($from . $i . " day"));
		$appendFile = "../log/ThermoHygro/" . date('Y', strtotime($d)) . "/sensor$sensorNo/" . $sensorNo . date('-md', strtotime($d)) . ".csv";

		if (! file_exists($appendFile)) {
			$logger->warn($appendFile . "が存在しません。");
			continue;
		}
	    $fp = fopen($appendFile, "r");
	    while (! feof($fp)) {
	    	$csv = fgets($fp);
            $rep = str_replace(' ', '', $csv); // 空白を空文字に置換
            // 温湿度データが存在する時刻のみを含める。
	    	if (mb_strlen($rep) > 8 && mb_strlen($csv) != 0) {
				$downloadData .= $d . " " . $csv;
	    	}
	    }
	    fclose($fp);
	}
	$mime = 'text/plain';
	//$mime = 'application/octet-stream'; // MIMEタイプが不明な場合
    
	header('Content-Type: "' . $mime . '"');
	if (strstr($user_agent, "MSIE") != false) {
		$fileName = mb_convert_encoding($fileName,  "SJIS", "UTF-8");
	}
	header('Content-Disposition: attachment; filename="' . $fileName . '"');
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	# Microsoft Internet Explorerと他のブラウザで処理を分けます。
	if (strstr($_SERVER['HTTP_USER_AGENT'], 'MSIE')) {
	  header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	  header('Pragma: public');
	} else {
	  header('Pragma: no-cache');
	}

	print($downloadData);
