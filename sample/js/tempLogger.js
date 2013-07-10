/**
 * @fileOverview 温湿度グラフ画面を扱うモジュールです。
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

var dateFormat = new DateFormat('yyyy/MM/dd');
var sensorId = '1'; // 温湿度グラフを表示するセンサー番号
var date = ''; // 温湿度グラフを表示する日
var controllerId = ''; // コントローラー番号
var timer = null; // 再描画用タイマー
var isPortrait = false; // 縦表示か否か？
var isWeather = false; // 天気情報表示中か否か？

$(function() {
    // 初期表示・再描画時は当日の温湿度データ
    date = dateFormat.format(new Date());

    // 初期表示時は温湿度センサー1番の温湿度データ
    sensorId = '1';

    // Getリクエストかの確認
    checkGetRequest();

    // 温湿度グラフを再描画
    draw();
    
    // 温湿度センサー選択スクローラー設定を取得
    $('#selectSensor').scroller(getSensorScroller());

    // 温湿度センサー選択スクローラーを表示
    $('#sensor').click(showSensorScroller);

    // 選択したセンサーの温湿度グラフを表示
    $('#selectSensor').change(changeSensor);

    // 日付選択スクローラー設定を取得
    $('#historyDate').scroller(getDateScroller());

    // 日付選択ダイアログのデフォルトは当日
    $('#historyDate').val(date);

    // 日付選択スクローラーを表示
    $('#historyCal').click(function(){$('#historyDate').scroller('show');});

    // 選択した日付の温湿度グラフを表示
    $('#historyDate').change(changeDate);

    // 当日の温湿度グラフを表示
    $('#home').click(drawToday);

    // 空調制御コマンド選択スクローラー設定を取得
    $('#control').scroller(getCommandScroller());

    // 空調制御コマンド選択スクローラーを表示
    $('#controlBtn').click(showCommandScroller);

    // 選択した空調制御コマンドを送信
    $('#control').change(sendCommand);

    // ガレージの温度を温湿度グラフに描画
    $('#weather').click(toggleGarage);

    // 縦向き・横向きに合わせて画面を再描画
    $(window).bind('load orientationchange', rotationView);

    //100ミリ秒後に縦に50px移動
    setTimeout(scrollTo, 100, 0, 50);
});

/**
 * ガレージの温度を温湿度グラフに描画します。
 * 気象ボタン押下状態に応じてガレージの温度をグラフに描画・非描画。
 */
function toggleGarage() {
    // ガレージ温度描画フラグを更新
    isWeather = ! isWeather;

    // 温湿度グラフを再描画
    redraw();
}

/**
 * 縦向き・横向きに合わせて画面を再描画します。
 */
function rotationView() {
    if(Math.abs(window.orientation) === 90){
        if (isPortrait) {
            //100ミリ秒後に縦に50px移動
            setTimeout(scrollTo, 100, 0, 50);
            
            redraw();
        }
    }else{
        if (navigator.userAgent.indexOf('iPad') > 0) {
            redraw();
        }
    }
    isPortrait = ! isPortrait;
}

/**
 * 空調制御コマンド選択スクローラーを表示。
 */
function showCommandScroller() {
    // 空調制御コマンドを設定
    if (! setCommand()) {
        return false;
    }

    // 空調制御コマンド選択スクローラーを表示
    $('#control').scroller('show');

    return true;
}

/**
 * 温湿度センサー選択スクローラーを表示します。
 */
function showSensorScroller() {
    // 温湿度センサー情報を設定
    if (! setSensorInfo()) {
        return false;
    }

    // 温湿度センサー選択スクローラーを表示
    $('#selectSensor').scroller('show');
}

/**
 * 空調制御コントローラーのコマンド名を返します。
 * 空調制御コントローラーにコマンド設定が存在しない場合は空の配列を返します。
 * @param controllerCommand 空調制御コントローラーのコマンド
 * @param controlCommand 空調制御コマンド
 */
function getControllerCommandName(controllerCommand, controlCommand) {
    var controllerCommandNum = controllerCommand.length;
    var controlCommandNum = controlCommand.length;
    var commandName = [];
    for (var i = 0; i < controllerCommandNum; i++) {
        for (var j = 0; j < controlCommandNum; j++) {
            if (controllerCommand[i].commandId == controlCommand[j].commandId) {
                commandName.push(controlCommand[j].commandName);
                break;
            }
        }
    }
    return commandName;
}

/**
 * 空調制御コマンドをコマンド選択用スクローラーにセットします。
 */
function setCommand() {
    // 温湿度センサーの空調制御コマンド取得
    var controllerCommand = getControllerCommand(sensorId);
    if (controllerCommand == null) {
        return false;
    }

    // 空調制御コマンドの一覧を取得
    var controlCommand = getControlCommands();
    if (controlCommand == null || controlCommand.length == 0) {
        return false;
    }

    // 空調制御コマンド名を取得
    controllerCommand['commandName'] = getControllerCommandName(controllerCommand, controlCommand);

    // 空調制御コマンドをスクローラーに設定
    var commandNum = controllerCommand.length;

    // コマンド番号4以降を温湿度グラフ画面から送信可能
    // コマンド1番以降を送信可能に修正
    for (i = 0; i < commandNum; i++) {
        $('#control').append($("<option value='" + controllerCommand[i]['commandId'] + "'>" + controllerCommand['commandName'][i] + '</option>'));
    }

    // 温湿度センサーに紐づくコントローラー番号を取得
    controllerId = controllerCommand[0]['controllerId'];

    // 空調制御状態を取得
    var controllerState= getControllerState(controllerId);
    if (controllerState == null) {
        return false;
    }
    
    // 最後に送信したコマンドを設定
    setSentCommand(controllerCommand, controllerState);

    return true;
}

/**
 * 最後に送信した空調制御コマンドを画面にセットします。
 * @param command 空調制御コントローラーのコマンド
 * @param controllerState 空調制御コントローラー制御状態
 */
function setSentCommand(command, controllerState) {
    // 最後に送信した空調制御コマンドをセット
    var selected = 0;
    var commandNum = command.length;
    for (var i = 0; i < commandNum; i++) {
        if (command[i]['commandId'] == controllerState.sentCommand) {
            if (controllerState.sentCommand == '1') {
                $('#control').attr('name', command['commandName'][i] + '中');
            } else {
                $('#control').attr('name', command['commandName'][i] + 'で稼働中');
            }
            selected = i - 2; // TODO スマホからは使用しない運転停止などのコマンドが存在するため除算が必要
            break;
        }
    }
    // 空調制御コマンド選択スクローラーを再度設定
    $('#control').scroller(getCommandScroller());

    // No.1～3は温湿度監視機能で使用するため、以降のコマンドのみ
    if (i < 2) $('#control').val(selected);
}

/**
 * 空調制御コマンド選択スクローラー設定を返します。
 */
function getCommandScroller() {
    return {
        preset: 'select',
        theme: 'ios',
        display: 'modal',
        mode: 'scroller',
        inputClass: 'i-txt',
        showLabel: true
    };
}

/**
 * 日付選択スクローラー設定を返します。
 */
function getDateScroller() {
    return {
        preset: 'date',
        theme: 'ios',
        display: 'modal',
        mode: 'scroller',
        dateOrder: 'yyyy mm dd'
    };
}

/**
 * 選択した日付の温湿度グラフを表示します。
 */
function changeDate() {
    // 選択した日付を取得
    var arrayDate = $('#historyDate').val().split('/');
    date = arrayDate[2] + '/' + arrayDate[0] + '/' + arrayDate[1];

    // 日付選択ダイアログのデフォルトを選択日に設定
    $('#historyCal').val(date);

    // 温湿度グラフを再描画
    redraw();
}

/**
 * 選択したセンサーの温湿度グラフを表示します。
 */
function changeSensor() {
    // センサー番号を選択した温湿度センサーの番号に変更
    sensorId = $('#selectSensor').val();
    $('#historyDate').val(date);

    // 温湿度センサー設定をセットします。
    //setSensorInfo(); redrow()で呼び出している。

    // 温湿度グラフを再描画
    redraw();
}

/**
 * 温湿度センサー選択スクローラー設定を返します。
 */
function getSensorScroller() {
    return {
        preset: 'select',
        theme: 'ios',
        display: 'modal',
        mode: 'scroller',
        inputClass: 'i-txt',
    };
}

/**
 * 温湿度センサー情報を設定します。
 */
function setSensorInfo() {
    // 温湿度センサー情報取得
    var sensorConfig = getTempLoggerConfigNearDate(null, $('#historyDate').val());
    //console.log($('#selectSensor option:selected').text());
    //console.log(sensor);
    if (sensorConfig == null) {
        return false;
    }

    // 温湿度センサー情報を設定
    var sensorNum = sensorConfig.length;
    for (i = 0; i < sensorNum; i++) {
        $('#selectSensor').append($('<option value=' + sensorConfig[i].sensorId + '>' + sensorConfig[i].sensorName + '</option>'));
    }
   // $('#selectSensor').val('1');

    return true;
}

/**
 * Getリクエストかの確認
 * Getの場合、センサー番号と日付を取得
 * 警告メールにてGetリクエストを使います。
 */
function checkGetRequest() {
    var get = [], hash;
    get = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    // 警報メール添付URLのGETリクエスト
    if (get.length == 2) {
        sensorId = get[0].split('=')[1];
        date = dateFormat.format(dateFormat.parse(get[1].split('=')[1]));
    }
}

/**
 * 当日の温湿度グラフを表示します。
 */
function drawToday() {
    // 温湿度グラフを表示する日付は当日
    date = dateFormat.format(new Date());

    // 日付選択ダイアログのデフォルトを当日に変更
    $('#historyDate').val(date);

    // 温湿度グラフを表示
    redraw();
}

/**
 * 温湿度グラフを再描画します。
 */
function redraw() {
    // 温湿度グラフを破棄
    TempGraph.destroy();

    // 温湿度グラフを表示
    draw();
}

/**
 * 温湿度グラフを描画します。
 */
function draw() {
    // タイマーを初期化
    clearTimeout(timer);
    
    setSensorInfo();

    // 温湿度グラフ名を設定
    TempGraph.setTitle($('#selectSensor option:selected').text() + ' ' +  date.split('/')[0] + '年' +  date.split('/')[1] + '月' + date.split('/')[2] + '日');
    
    // 温湿度データ取得
    var thermoHygro = getThermoHygro(date, sensorId);

    // 温湿度データの存在確認
    if (thermoHygro == null || thermoHygro['thermo'] == undefined) {
        // 温湿度グラフを初期化
        clearTempLogger();
        return;
    }

    // 気象情報としてグラフに描画する温湿度を取得
    var weather = null;
    if (isWeather) {
        // 気象情報としてグラフに描画する温湿度センサーの番号を取得
        var systemConfig = getSystemConfig();
        if (systemConfig != null || systemConfig['from'] != undefined) {
            weather = getThermoHygro(date, systemConfig['weather']);
        }
    }

    // 温湿度グラフを描画
    if (weather != null) TempGraph.show('linechart', 13, [thermoHygro['thermo'], thermoHygro['hygro'], weather['thermo'], weather['hygro']]);
    else TempGraph.show('linechart', 13, [thermoHygro['thermo'], thermoHygro['hygro']]);

    // 1分間隔でグラフを再描画
    timer = setInterval('redraw()', 60000);
}

/**
 * 温湿度データ・センサー情報をクリアします。
 */
function clearTempLogger() {
    // タイマーを初期化
    clearTimeout(timer);
    
    // グラフを破棄
    TempGraph.destroy();

    // 温湿度グラフ名を設定
    $('#selectSensor').val(sensorId);
    TempGraph.setTitle($('#selectSensor option:selected').text() + ' ' +  date.split('/')[0] + '年' +  date.split('/')[1] + '月' + date.split('/')[2] + '日');

    // 空のグラフを描画
    TempGraph.show('linechart', 13, [[{}], [{}]]);
}

/**
 * 非同期通信で空調制御状態を取得します。
 * @return Array 空調制御コントローラー状態[
 *              'sentCommand' : 最後に送信した空調制御コマンド番号,
 *             ]
 */
function getControllerState() {
    var controllerState = null;
    $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        dataType: 'json',
        data: {'target' : 'ControllerState', 'controllerId' : controllerId},
    }).done(function(json) {
        if (json == null || json.length == 0) {
          alert('空調制御状態が存在しません。');
          return null;
        }
        controllerState = json;
    }).fail(function (data) {
        alert('空調制御状態の取得に失敗しました。');
        return null;
    });
    return controllerState;
}

/**
 * 非同期通信で空調制御コントローラーコマンド設定を取得します。
 * @param String sensorId 温湿度センサー番号
 * @return Array 空調制御コントローラーコマンド設定[[
 *              'controllerId' : 空調制御コントローラー番号,
 *              'controllerCommandId' : 空調制御コントローラーコマンド番号,
 *              'commandId' : 空調制御コマンド番号,
 *             ]]
 */
function getControllerCommand(sensorId) {
    var commands = [];
	  $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        data: {'target' : 'ControllerCommand', 'sensorId' : sensorId},
        dataType: 'json',
    }).done(function(json) {
        if (json == null) {
            alert('空調制御コマンドが存在しません。');
            return null;
        }
        var commandNum = json.length;
        for (var i = 0; i < commandNum; i++) {
            var command = [];
            command['controllerId'] = json[i].controllerId;
            command['controllerCommandId'] = json[i].controllerCommandId;
            command['commandId'] = json[i].commandId;
            commands.push(command);
        }    
    }).fail(function (data) {
        alert('コントローラーのコマンド取得に失敗しました。');
        return null;
    });
    return commands;
}

/**
 * 非同期通信で空調制御コマンドを取得します。
 * @return Array 空調制御コマンド設定[[
 *              'commandId' : 空調制御コマンド番号,
 *              'commandName' : 空調制御コマンド名
 *             ]]
 */
function getControlCommands() {
	  var commands = null;
	  $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        data: {'target' : 'ControlCommand'},
        dataType: 'json',
    }).done(function(json) {
        if (json == null || json.length == 0) {
            alert('空調制御コマンドが存在しません。');
            return null;
        }
        commands = json;
    }).fail(function (data) {
        alert('空調制御コマンドの取得に失敗しました。');
        return null;
    });
    return commands;
}

/**
 * 選択した空調制御コマンドを送信します。
 */
function sendCommand() {
    //console.log(controllerId);
    $.ajax({
       type: 'POST',
       async: false,
       url: '../php/requestReceptionist.php',
       data: {'target' : 'SendCommand', 'controllerId' : controllerId[0], 'sendCommand' : $('#control option:selected').val()},
       dataType: 'json',
    }).done(function(json) {
            alert($('#control option:selected').text() + '設定にしました。');
            $('#selectSensor').find('option').val($('#control option:selected').val());
    }).fail(function (data) {
            alert('空調制御コマンドの送信に失敗しました。\n数分ほど時間をあけてからやり直してください。'
                + '\n何度も異常が発生した場合は、\n緊急連絡先へ連絡をお願いします。');
    });
}
