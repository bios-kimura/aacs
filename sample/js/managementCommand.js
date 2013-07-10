/**
 * @fileOverview 空調制御コマンドを扱うモジュールです。
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

var controllerId = '1';

$(function() {
    // 温室度センサーとコマンドを表示
    showCommand();
    
    // コントローラーを切り替え
    $('#selectSensor').live('change', showCommand);
    
    // 空調制御コントローラーにコマンド登録
    $('#entryBtn').live('click', entryControllerCommand);
    
    // 空調制御コマンドを登録
    $('.commandEntry').live('click', entryCommand);

    // 空調制御コントローラーのコマンドを削除
    $('.deleteBtn').live('click', deleteControllerCommand);
    
    // 空調制御コマンドを削除
    $('.commandDelete').live('click', deleteCommand);
    
    // 入力行を1行増やす
    $("input[type='text']:last").live('click', function() {
        appendRow($('#commandsTable tbody').children().length, '', '');
    });
});

/**
 * 入力行を1行増やします。
 * @param commandId 空調制御コントローラー番号
 * @param commandName 空調制御コントローラー名
 * @param signal 空調制御信号
 */
function appendRow(commandId, commandName, signal) {
	$('#commandsTable').find('tbody').append('<tr><td>' + commandId
		+ "<input type='hidden' value='" + signal + "'></td><td><input type='text' value='" + commandName + "'/></td>"
        + "<td><input class='commandEntry' type='button' value='登録'></td>"
        + "<td><input class='commandDelete' type='button' value='削除'></td></tr>");
}

/**
 * 温室度センサーを画面にセットします。
 * @param sensorList 温湿度センサー設定
 */
function setSensor(sensorList) {
    var sensorNum = sensorList.length;
    var selected = $('#selectSensor').val();
    $('#selectSensor').empty();
    for (var i = 0; i < sensorNum; i++) { 
        if (selected != null && selected == sensorList[i]['sensorId']) {
            $('#selectSensor').append("<option value='" + sensorList[i]['sensorId'] + "' selected>" + sensorList[i]['sensorName'] + '</option>');
        } else {
            $('#selectSensor').append("<option value='" + sensorList[i]['sensorId'] + "'>" + sensorList[i]['sensorName'] + '</option>');
        }
    }
}

/**
 * 空調制御コマンドを画面にセットします。
 * @param commands 空調制御コマンド
 */
function setCommand(commands) {
    var commandLength = commands.length;
    $('#commandsTable').find('tbody').find('tr:not(:eq(0))').remove();
    var prevCommandId = 0;
    for (var i = 0; i < commandLength; i++) {
        var commandId = parseInt(commands[i]['commandId'], 10);
        if ((i + 1) === commandId) {
            appendRow(commandId, commands[i]['commandName'], commands[i]['signal']);
        } else {
            var commandDiff = commandId - prevCommandId - 1;
            for (var j = 0; j < commandDiff; j++) {
                appendRow($('#commandsTable tbody').children().length, '', '');
            }
            appendRow(commandId, commands[i]['commandName'], commands[i]['signal']);
        }
        prevCommandId = commandId;
        
    }
    appendRow($('#commandsTable tbody').children().length, '', '');
}
 
/**
 * コントローラーの空調制御コマンドを画面にセットします。
 * @param sensorId 温湿度センサー番号
 * @param commands 空調制御コマンド
 */
function setControllerCommand(sensorId, commands) {
    var commandLength = commands.length;
    
    // 空調制御コマンドを取得
    var commandList = getControllerCommand(sensorId);

    // 空調制御コマンド選択欄を初期化
    for (var i = 0; i < 10; i++) {
        $('#commandTable').find('tr').eq(i + 1).find('td:eq(1)').find('select').empty();
    }

    var emptyRow = function(i) {
        $('#commandTable').find('tr').eq(i + 1).find('td:eq(1)').find('select').append("<option value='0'></option>");
    }
    var commandRow = function(i, j, commands, selected) {
            if(typeof selected === 'undefined') selected = false;
            $('#commandTable').find('tr').eq(i + 1).find('td:eq(1)').find('select').append("<option value='" + commands[j]['commandId']
                + "' " + (selected ? "selected" : " ") + ">" + commands[j]['commandName'] + '</option>')};

    controllerId = commandList[0]['controllerId'];

    // 空調制御コントローラーのコマンドが未登録
    if (commandList[0]['commandId'] === '') {
        for (var i = 0; i < 10; i++) {
            emptyRow(i);
            for (var j = 0; j < commandLength; j++) {
                commandRow(i, j, commands);
            }
        }
        return;
    }

    var controllerCommandLength = commandList.length;
    $('#entryBtn').removeAttr('disabled');
    var prevControllerId = 0; // コントローラー表示位置調整に使う。
    var controllerSelectCommand = function(rowNum, commands, selected) {
        var num = commands.length;
        for (var i = 0; i < num; i++) {
            commandRow(rowNum, i, commands, selected);
        }
    };
    for (var i = 0; i < controllerCommandLength; i++) { // jqueryで取得
        // 空調制御コントローラーコマンド番号
        var controllerCommandId = parseInt(commandList[i]['controllerCommandId'], 10);
        
        // 空調制御コントローラーコマンド登録数が10個未満 or 空調制御コントローラーコマンド表示位置が一致しない
        if(i >= controllerCommandLength) emptyRow(i);

        // 空調制御コントローラーコマンド番号が一致
        if((i + 1) === controllerCommandId) {
            for (var j = 0; j < commandLength; j++) {
                commandRow(i, j, commands, commands[j]['commandId'] === commandList[i]['commandId']);
            }
        } else {
            // すでに追加済み
            if ((i +1) <= prevControllerId) continue;

            // 空調制御コントローラーコマンドが順に存在しない場合は、空の入力欄を追加
            for (var k = i; k < controllerCommandId - 1; k++) {
                emptyRow(k);
                controllerSelectCommand(k, commands, false);
            }
            for (var j = 0; j < commandLength; j++) {
                commandRow(controllerCommandId - 1, j, commands, commands[j]['commandId'] === commandList[i]['commandId']);
            }
        }

        prevControllerId = parseInt(commandList[i]['controllerCommandId'], 10);
    }

    // 空調制御コントローラーコマンド登録数が10個未満であれば
    var rowNum = $('#commandTable').find('tr:not(:has(th))').size();
    for (var i = prevControllerId; i < rowNum; i++) {
        emptyRow(i);
        controllerSelectCommand(i, commands, false);
    }
}

/**
 * 選択した温室度センサーとリンクするコントローラーのコマンドを表示します。
 */
function showCommand() {
    // 温室度センサーを表示
    var sensorList = getTempLoggerConfig();
    setSensor(sensorList);
    
    // 空調制御コマンドを取得
    var commands = getControlCommands();
    
    // コントローラーのコマンドを表示
    setControllerCommand($('#selectSensor').val(), commands);
    
    // コマンドを表示
    setCommand(commands);
}

/**
 * 空調制御コントローラーのコマンドを登録します。
 * 空調制御コマンド未選択時は登録しません。
 */
function entryControllerCommand() {
    // 入力チェック
    var isSelected = false;
    $.each($('#commandTable').find('tr:not(:has(th))'), function() {
        if ($(this).find('td').eq(1).find('select').val() !== '0') {
            isSelected = true;
        }
    });

    // 空調制御コマンド未選択時は登録しない
    if (! isSelected) {
        alert('空調制御コマンドを選択してください。');
        return;
    }

    $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        dataType: 'json',
        data: {
            'target' : 'ControllerCommand',
            //'controllerId' : controllerId,
            'configArray' : getControllerCommandTable()
        },
    }).done(function(json){
        showCommand();
    }).fail(function (data) {
        alert('空調制御コントローラーのコマンド登録に失敗しました。\n数分ほど時間をあけてからやり直してください。'
            + '\n何度も異常が発生した場合は、\n緊急連絡先へ連絡をお願いします。');
    });
}

/**
 * 空調制御コマンドを登録します。
 */
function entryCommand() {
    $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        dataType: 'json',
        data: {
            'target' : 'ControlCommand',
            'configArray' : getCommandTable(),
            'entryId' : $(this).parent().parent().find('td').eq(0).text()
        },
    }).done(function(json){
        showCommand();
    }).fail(function (data) {
        alert('空調制御コマンドの登録に失敗しました。\n数分ほど時間をあけてからやり直してください。'
            + '\n何度も異常が発生した場合は、\n緊急連絡先へ連絡をお願いします。');
    });
}

/**
 * 空調制御コマンドを削除します。
 */
function deleteCommand() {
    $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        dataType: 'json',
        data: {
            'target' : 'ControlCommand',
            'configArray' : getCommandTable(),
            'deleteId' : $(this).parent().parent().find('td').eq(0).text()
        },
    }).done(function(json){
        showCommand();
    }).fail(function (data) {
        alert('空調制御コントローラーのコマンド削除に失敗しました。\n数分ほど時間をあけてからやり直してください。'
            + '\n何度も異常が発生した場合は、\n緊急連絡先へ連絡をお願いします。');
    });
}

/**
 * 空調制御コントローラーのコマンドを削除します。
 */
function deleteControllerCommand() {
    $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        dataType: 'json',
        data: {
            'target' : 'ControllerCommand',
            //'controllerId' : controllerId,
            'configArray' : getControllerCommandTable(),
            'deleteId' : $(this).children().next().val()
        },
    }).done(function(json){
        showCommand();
    }).fail(function (data) {
        alert("設定値の削除に失敗しました。\n数分ほど時間をあけてからやり直してください。" 
            + "\n何度も異常が発生した場合は、\n緊急連絡先へ連絡をお願いします。");
    });
}

/**
 * 空調制御コマンドを取得します。
 * @return Array 空調制御コマンド[空調制御コマンド番号, 空調制御コマンド名]
 */
function getCommandTable() {
    var commandTableArray = new Array();
    $.each($('#commandsTable').find('tr'), function() {
        // 見出し及びコマンド名未入力は除外
        if ($(this).find('td:eq(1)').find('input').val() == undefined ||
            $(this).find('td:eq(1)').find('input').val() == '') return true;
        
        commandTableArray.push({
            'commandId' : $(this).find('td:eq(0)').text(),
            'commandName' : $(this).find('td:eq(1)').find('input').val(),
            'signal' : $(this).find('td:eq(0)').find('input').val()
        });
    });
    return commandTableArray;
}

/**
 * 画面に表示・入力した空調制御コマンド取得します。
 * @return Array 空調制御コマンド[空調制御コマンド番号, 空調制御コマンド名]
 */
function getControllerCommandTable() {
    var array = new Array();
    $.each($('#commandTable').find('tr'), function() {
        // 見出し及びコマンド名未入力は除外
        if ($(this).find('td:eq(1)').find('select').val() == undefined ||
            $(this).find('td:eq(1)').find('select').val() == '0') return true;

        array.push({
            'controllerId' : controllerId,
            'controllerCommandId' : $(this).find('td:eq(0)').text(),
            'commandId' : $(this).find('td:eq(1)').find('select').val()
        });
    });
    return array;
}
