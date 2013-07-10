/**
 * @fileOverview システム設定を扱うモジュールです。
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

var config = [
    {'type' : 'email', 'name' : 'from'},
    {'type' : 'text', 'name' : 'to'},
    {'type' : 'text', 'name' : 'smtp'},
    {'type' : 'text', 'name' : 'port'},
    {'type' : 'text', 'name' : 'user'},
    {'type' : 'password', 'name' : 'passwd'},
    {'type' : 'text', 'name' : 'cordinator'},
    {'type' : 'text', 'name' : 'irReceive'},
    {'type' : 'select', 'name' : 'weather'},
    {'type' : 'select', 'name' : 'xbee'},
];

$(function() {
    // システム設定を取得
    var systemConfig = getSystemConfig();

    // システム設定が未設定及びシステム設定が存在しない場合は画面に表示しない
    if (systemConfig == null || systemConfig['from'] == undefined) {
        return;
    }

    // 温湿度センサー設定を取得
    var tempLoggerConfig = getTempLoggerConfig();
    if (tempLoggerConfig == null) {
        return;
    }

    // システム設定を表示
    showSystemTable(systemConfig, tempLoggerConfig);
    
    // システム設定を登録
    $('#save').bind('click', function() {
        saveConfig('SystemConfig', '../php/requestReceptionist.php', getSystemTable(), location.reload);
    });
    
    // システム設定を削除
    $('.del').bind('click', function() {
        deleteConfig('SystemConfig', '../php/requestReceptionist.php', getSystemTable(), config[parseInt($(this).children().next().val(), 10)]['name'], location.reload);
    });
});

/**
 * システム設定を画面に表示します。
 * @param systemConfig システム設定
 */
function showSystemTable(systemConfig, tempLoggerConfig) {
    var count = $('#systemTable').find('tr').size() - 2; // 温湿度センサー、XBee閾値の分を除去
    for (var i = 0; i < count; i++) {
        $('#systemTable').find('tr').eq(i).find('td').children("input[type='" + config[i]['type'] + "']").val(systemConfig[config[i]['name']]);
    }

    // 気象情報としてグラフに表示する温湿度センサーの番号
    var tempLoggerNum = tempLoggerConfig.length;
    for (var i = 0; i < tempLoggerNum; i++) {
        if (systemConfig['weather'] == tempLoggerConfig[i].sensorId) {
            $('#systemTable').find('tr').eq(8).find('td').eq(0).find('select').append("<option selected value='" + tempLoggerConfig[i].sensorId + "'>" + tempLoggerConfig[i].sensorName + "</option>");
        } else {
            $('#systemTable').find('tr').eq(8).find('td').eq(0).find('select').append("<option value='" + tempLoggerConfig[i].sensorId + "'>" + tempLoggerConfig[i].sensorName + "</option>");
        }
    }

    // XBee閾値を選択
    var options = $('#systemTable').find('tr').eq(9).find('td').eq(0).find('select').find('option');
    var optionsNum = options.size();
    for (var i = 0; i < optionsNum; i++) {
        var option = $(options).eq(i);
        if (systemConfig['xbee'] === $(option).val()) $(option).attr('selected', 'selected');
    }
}

/**
 * システム情報を画面から配列で取得します。
 * @return システム設定
 */
function getSystemTable() {
    var systemConfig = {};
    var configNum = $('#systemTable').find('tr').size();
    var getKey = function(index) {return config[index]['name'];};
    for (var i = 0; i < configNum; i++) {
        systemConfig[config[i]['name']] = $('#systemTable').find('tr').eq(i).find('td').children().val();
    }
    return systemConfig;
}
