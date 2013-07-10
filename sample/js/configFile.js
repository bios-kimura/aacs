/**
 * @fileOverview 温湿度ロギングシステム、空調自動制御システムの設定ファイルを扱うモジュールです。
 *
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

/**
 * 非同期通信で空調制御コントローラー設定を取得します。
 * @return Array 空調制御コントローラー設定[[
 *              'controllerId' : 空調制御コントローラー番号,
 *              'xbee' : XBeeシリアル番号,
 *             ]]
 */
function getController() {
    var controller = null;
	  $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        dataType: 'json',
        data: {'target' : 'ControllerConfig'},
    }).done(function(json) {
        if (json == null || json[0].controllerId == '') {
            alert('空調制御設定が存在しません。');
			return null;
		}
        controller = json;
    }).fail(function (data) {
        alert('空調制御コントローラー設定の取得に失敗しました。');
        return null;
    });
    return controller;
}

/**
 * 非同期通信で温湿度データを取得します。
 * @param Date date 取得する温湿度データの日付
 * @param String sensorId 温湿度センサー番号
 * @param String path  温湿度データファイルパス
 * @return Array 温湿度データ [[
 *                 'thermo' : 温度,
 *                 'hygro' : 湿度
 *               ]]
 */
function getThermoHygro(date, sensorId, path) {
    var thermoHygro = [];
    var filePath = '../php/requestReceptionist.php';
    if (path) filePath = path;
    $.ajax({
        type: 'POST',
        url: filePath,
        async: false,
        data: {'target' : 'TempLogger', 'date': date, 'sensorId': sensorId},
        dataType: 'json',
    }).done(function(json) {
        if (json.thermo == null || json.thermo.length == 1) {
            alert(date + 'の温湿度データは存在しません。');
            return thermoHygro;
        }
        
        var thermoLength = json.thermo.length;
        var thermo = [];
        var hygro = [];
        for (var i = 0; i < thermoLength; i++) {
            thermo.push([json.time[i], json.thermo[i]]);
            hygro.push([json.time[i], json.hygro[i]]);
        }
        thermoHygro['thermo'] = thermo;
        thermoHygro['hygro'] = hygro;
    }).fail(function (data) {
        alert('温湿度データの取得に失敗しました。');
        return null;
    });
    return thermoHygro;
}

/**
 * 非同期通信で指定日に最も近い温湿度センサー情報を取得します。
 * @param String path 温湿度センサー設定ファイルパス
 * @param String date 温湿度データ取得日
 * @return Array 温湿度センサー設定[[
 *              'sensorId' : 温湿度センサー番号,
 *              'sensorName' : 温湿度センサー名
 *             ]]
 */
function getTempLoggerConfigNearDate(path, date) {
    var sensorConfig = null;
    var filePath = '../php/requestReceptionist.php';
    if (path) filePath = path;
      $.ajax({
       type: 'POST',
       url: filePath,
       dataType: 'json',
       async: false,
       data: {'target' : 'TempLoggerConfig', 'date' : date},
    }).done(function(json) {
        if (json == null || json.length == 0) {
          alert('温湿度センサー設定が存在しません。');
          return null;
        }
        sensorConfig = json;
    }).fail(function (data) {
        alert('温湿度センサー設定の取得に失敗しました。');
        return null;
    });
    return sensorConfig;
}

/**
 * 非同期通信で温湿度センサー情報を取得します。
 * @param String path  温湿度センサー設定ファイルパス
 * @return Array 温湿度センサー設定[[
 *              'sensorId' : 温湿度センサー番号,
 *              'sensorName' : 温湿度センサー名
 *             ]]
 */
function getTempLoggerConfig(path) {
    var sensor = [];
    var filePath = '../php/requestReceptionist.php';
    if (path) filePath = path;
	  $.ajax({
       type: 'POST',
       url: filePath,
       dataType: 'json',
       async: false,
       data: {'target' : 'TempLoggerConfig'},
    }).done(function(json) {
        if (json == null || json[0].sensorId == '') {
          alert('温湿度センサー設定が存在しません。');
          return null;
        }
        sensor = json;
    }).fail(function (data) {
        alert('温湿度センサー設定の取得に失敗しました。');
        return null;
    });
    return sensor;
}

/**
 * 非同期通信でシステム設定を取得します。
 * @return Array システム設定[
 *              'from' : メール送信元 ,
 *              'to' : メール送信先,
 *              'smtp' : SMTPサーバホスト名,
 *              'port' : SMTPサーバポート番号,
 *              'user' : 送信元ユーザ名,
 *              'passwd' : 送信元ユーザパスワード,
 *              'cordinator' : コーディネータCOMポート番号,
 *              'irReceive' : 赤外線受信機COMポート番号,
 *              'weather' : 気象情報として温湿度グラフに描画する温湿度センサーの番号,
 *              'xbee' : XBee供給電圧閾値
 *             ]
 */
function getSystemConfig() {
    var systemConfig = [];
	  $.ajax({
        type: 'POST',
        url: '../php/requestReceptionist.php',
        dataType: 'json',
        async: false,
        data: {'target' : 'SystemConfig'},
    }).done(function(json) {
        if (json == null || json.from == null) {
          return systemConfig;
        }
        systemConfig['from'] = json.from;
        systemConfig['to'] = json.to;
        systemConfig['smtp'] = json.smtp;
        systemConfig['port'] = json.port;
        systemConfig['user'] = json.user;
        systemConfig['passwd'] = json.passwd;
        systemConfig['cordinator'] = json.cordinator;
        systemConfig['irReceive'] = json.irReceive;
        systemConfig['weather'] = json.weather;
        systemConfig['xbee'] = json.xbee;
    }).fail(function (data) {
        alert('システム設定の取得に失敗しました。');
        return null;
    });
    return systemConfig;
}

/**
 * 非同期通信で対象の設定値を削除します。
 * @param String target 削除処理の対象
 * @param String url 削除処理のURL
 * @param String configArray 書き込む設定
 * @param String deleteId 削除する設定の番号
 */
function deleteConfig(target, url, configArray, deleteId, callback) {
    $.ajax({
        type: 'POST',
        async: false,
        url: url,
        dataType: 'json',
        data: {'target' : target, 'configArray' : configArray, 'deleteId' : deleteId},
    }).done(function(json) {
        callback();
    }).fail(function (data) {
        alert("設定値の削除に失敗しました。\n数分ほど時間をあけてからやり直してください。" 
            + "\n何度も異常が発生した場合は、\n緊急連絡先へ連絡をお願いします。");
    });
}

/**
 * 非同期通信で対象の設定値を登録します。
 * @param String target 登録処理の対象
 * @param String url 登録処理のURL
 * @param String configArray 書き込む設定
 */
function saveConfig(target, url, configArray, callback) {
    $.ajax({
        type: 'POST',
        async: false,
        url: url,
        dataType: 'json',
        data: {'target' : target, 'configArray' : configArray},
    }).done(function(json) {
        callback();
    }).fail(function (XMLHttpRequest, status, errorThrown) {
        alert("設定値の登録に失敗しました。\n数分ほど時間をあけてからやり直してください。" 
          + "\n何度も異常が発生した場合は、\n緊急連絡先へ連絡をお願いします。");
	});
}
