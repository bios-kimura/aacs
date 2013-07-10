/**
 * @fileOverview 温湿度センサーリンク情報を扱うモジュールです。
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

$(function() {
    // 温湿度センサーリンク情報を表示します。
    showSensorLink('1');
    
    // 紐付け設定を削除
	$('#delete').live('click', function() {
        deleteConfig('LinkInfo', '../php/requestReceptionist.php', getLinkTable(), $('#linkTable').find('tr').eq(0).find('td').find('select').val(), changeSensor);
    });
    
    // 紐付け設定を登録
	$('#save').bind('click', function() {
        saveConfig('LinkInfo', '../php/requestReceptionist.php', getLinkTable(), changeSensor);
    });

    // 温湿度センサーリンク設定をコピー
    $('#copy').bind('click', function() {
        copyConfig('LinkInfo', '../php/requestReceptionist.php', $('#configCopy').find('select').val(), $('#linkTable').find('tr').eq(0).find('td').find('select').val(), changeSensor);
    });

    // 温湿度センサーを選択
    $('#sensor').bind('change', changeSensor);
    
    // 選択した温度上限値に合わせて、選択可能な要素を制御。
    $('tr').eq(6).find('td').eq(0).find('select').bind('change', availableOptionMaxTemp);

    // 選択した温度下限値に合わせて、選択可能な要素を制御。
    $('tr').eq(6).find('td').eq(1).find('select').bind('change', availableOptionMinTemp);

    // 選択した湿度上限値に合わせて、選択可能な要素を制御。
    $('tr').eq(6).find('td').eq(2).find('select').bind('change', availableOptionMaxHygro);
    
    // 選択した湿度下限値に合わせて、選択可能な要素を制御。
    $('tr').eq(6).find('td').eq(3).find('select').bind('change', availableOptionMinHygro);

    // 選択した温度上限値に合わせて、選択可能な要素を制御。
    $('tr').eq(10).find('td').eq(0).find('select').bind('change', availableOptionMaxTemp);

    // 選択した温度下限値に合わせて、選択可能な要素を制御。
    $('tr').eq(10).find('td').eq(1).find('select').bind('change', availableOptionMinTemp);

    // 選択した湿度上限値に合わせて、選択可能な要素を制御。
    $('tr').eq(10).find('td').eq(2).find('select').bind('change', availableOptionMaxHygro);
    
    // 選択した湿度下限値に合わせて、選択可能な要素を制御。
    $('tr').eq(10).find('td').eq(3).find('select').bind('change', availableOptionMinHygro);

    // 限界値の要素制御
    availableOptionMax($('tr').eq(6).find('td').eq(0).find('select'), 1);
    availableOptionMin($('tr').eq(6).find('td').eq(1).find('select'), 0);
    availableOptionMax($('tr').eq(6).find('td').eq(2).find('select'), 3);
    availableOptionMin($('tr').eq(6).find('td').eq(3).find('select'), 2);

    // 警戒値の要素制御
    availableOptionMax($('tr').eq(10).find('td').eq(0).find('select'), 1);
    availableOptionMin($('tr').eq(10).find('td').eq(1).find('select'), 0);
    availableOptionMax($('tr').eq(10).find('td').eq(2).find('select'), 3);
    availableOptionMin($('tr').eq(10).find('td').eq(3).find('select'), 2);
});

/**
 * 温湿度センサーのリンク情報をコピーします。
 */
function copyConfig(target, url, fromCopy, toCopy, callback) {
    $.ajax({
        type: 'POST',
        async: false,
        url: url,
        dataType: 'json',
        data: {'target' : target, 'fromCopy' : fromCopy, 'toCopy' : toCopy},
    }).done(function(json) {
        callback();
    }).fail(function (XMLHttpRequest, status, errorThrown) {
        alert("設定値のコピーに失敗しました。\n数分ほど時間をあけてからやり直してください。" 
          + "\n何度も異常が発生した場合は、\n緊急連絡先へ連絡をお願いします。");
    });
}

/**
 * 温湿度センサーのリンク情報を表示します。
 * @param selectSensor 温湿度センサーリンク情報表示対象の温湿度センサー番号
 */
function showSensorLink(selectSensor) {
    // センサー情報を取得
    var sensor = getTempLoggerConfig();
    
    // 空調制御情報を取得
    var controller = getController();
    
    // センサー紐付け情報を取得
    var linkInfo = getLinkSensor(selectSensor);

    // 設定コピー用セレクトボックスにセンサー情報を設定
    setCopySensor(sensor);
    
    // 温湿度センサー紐付け情報を設定
    setLinkInfo(sensor, selectSensor, controller, linkInfo);
}

/**
 * 選択した温湿度センサーリンク情報を初期化します。
 */
function clearSensorLink() {
    // 温湿度センサーNo & 温湿度センサー名
    $('#linkTable').find('tr').eq(0).find('td').find('select').empty();
    $('#linkTable').find('tr').eq(1).find('td').text('');

    // コントローラーNo
    $('#linkTable').find('tr').eq(2).find('td').find('select').empty();

    // 監視周期
    $('#linkTable').find('tr').eq(4).find('td').eq(0).find('select').empty();
    $('#linkTable').find('tr').eq(4).find('td').eq(1).find('select').empty();
    $('#linkTable').find('tr').eq(4).find('td').eq(2).find('select').empty();

    // 限界値
    $('#linkTable').find('tr').eq(6).find('td').eq(0).find('select').empty();
    $('#linkTable').find('tr').eq(6).find('td').eq(1).find('select').empty();
    $('#linkTable').find('tr').eq(6).find('td').eq(2).find('select').empty();
    $('#linkTable').find('tr').eq(6).find('td').eq(3).find('select').empty();

    // 待機時間
    $('#linkTable').find('tr').eq(8).find('td').eq(0).find('select').empty();
    $('#linkTable').find('tr').eq(8).find('td').eq(1).find('select').empty();
    $('#linkTable').find('tr').eq(8).find('td').eq(2).find('select').empty();

    // 警戒値
    $('#linkTable').find('tr').eq(10).find('td').eq(0).find('select').empty();
    $('#linkTable').find('tr').eq(10).find('td').eq(1).find('select').empty();
    $('#linkTable').find('tr').eq(10).find('td').eq(2).find('select').empty();
    $('#linkTable').find('tr').eq(10).find('td').eq(3).find('select').empty();

    // 警報メール
    $('#linkTable').find('tr').eq(11).find('td').find('input').removeAttr('checked');
}

/**
 * 選択した温湿度センサーリンク情報を表示します。
 */
function changeSensor() {
    // 登録・削除後の遷移
    if ($(this) == undefined) {
        var selectSensor = $(this).val();
    // 温湿度センサー切替時
    } else {
        var selectSensor = $('#linkTable').find('tr').eq(0).find('td').find('select').val();
    }

    // 温湿度センサーリンク情報を初期化
    clearSensorLink();

    // 温湿度センサーリンク情報を表示
    showSensorLink(selectSensor);
}

/*
 * 選択した下限値に合わせて、選択可能な要素を制御します。
 */
function availableOptionMin(elements, tdIndex) {
    if ($(elements).val() == '999') {
        for (var i = 1, option = null; option = $(elements).parent().parent().find('td').eq(tdIndex).find('select').find('option')[i]; i++) $(option).removeAttr('disabled');
        return;
    }
    for (var i = 1, option = null; option = $(elements).parent().parent().find('td').eq(tdIndex).find('select').find('option')[i]; i++) {
        if (parseInt($(elements).val(), 10) > parseInt($(option).val(), 10)) {
            $(option).attr('disabled', 'disabled');
        }
    }
}

/*
 * 選択した上限値に合わせて、選択可能な要素を制御します。
 */
function availableOptionMax(elements, tdIndex) {
    if ($(elements).val() == '999') {
        for (var i = 1, option = null; option = $(elements).parent().parent().find('td').eq(tdIndex).find('select').find('option')[i]; i++) $(option).removeAttr('disabled');
        return;
    }
    for (var i = 1, option = null; option = $(elements).parent().parent().find('td').eq(tdIndex).find('select').find('option')[i]; i++) {
        if (parseInt($(elements).val(), 10) < parseInt($(option).val(), 10)) {
            $(option).attr('disabled', 'disabled');
        }
    }
}

/*
 * 上下限値が未選択であるか否か
 * @return 未選択であればtrue、未選択以外であればfalse
 */
function isBlank(select) {
    return $(select).val() === '999';
}

/*
 * 選択した温度上限値に合わせて、選択可能な要素を制御します。
 */
function availableOptionMaxTemp() {
    availableOptionMax($(this), 1);
}

/*
 * 選択した温度下限値に合わせて、選択可能な要素を制御します。
 */
function availableOptionMinTemp() {
    availableOptionMin($(this), 0);
}

/*
 * 選択した湿度上限値に合わせて、選択可能な要素を制御します。
 */
function availableOptionMaxHygro() {
    availableOptionMax($(this), 3);
}

/*
 * 選択した湿度下限値に合わせて、選択可能な要素を制御します。
 */
function availableOptionMinHygro() {
    availableOptionMin($(this), 2);
}

/**
 * 画面の温湿度センサーリンク情報を配列で取得します。
 * @return Array 温湿度センサーリンク情報
 */
function getLinkTable() {
    var linkArray = {};

    // 温湿度センサー
    linkArray['sensorId'] = $('#linkTable').find('tr').eq(0).find('td').find('select').val();

    // コントローラー
    linkArray['controllerId'] = $('#linkTable').find('tr').eq(2).find('td').find('select').val();

    // 監視周期
    var surveillanceCycle = parseInt($('#linkTable').find('tr').eq(4).find('td').eq(0).find('select').val(), 10)
        + parseInt($('#linkTable').find('tr').eq(4).find('td').eq(1).find('select').val(), 10)
        + parseInt($('#linkTable').find('tr').eq(4).find('td').eq(2).find('select').val(), 10);
    linkArray['surveillanceCycle'] = surveillanceCycle;

    // 限界値
    linkArray['maxTempLimitThreshold'] = $('#linkTable').find('tr').eq(6).find('td').eq(0).find('select').val();
    linkArray['minTempLimitThreshold'] = $('#linkTable').find('tr').eq(6).find('td').eq(1).find('select').val();
    linkArray['maxHygroLimitThreshold'] = $('#linkTable').find('tr').eq(6).find('td').eq(2).find('select').val();
    linkArray['minHygroLimitThreshold'] = $('#linkTable').find('tr').eq(6).find('td').eq(3).find('select').val();

    // 待機時間
    var latency = parseInt($('#linkTable').find('tr').eq(8).find('td').eq(0).find('select').val(), 10)
        + parseInt($('#linkTable').find('tr').eq(8).find('td').eq(1).find('select').val(), 10)
        + parseInt($('#linkTable').find('tr').eq(8).find('td').eq(2).find('select').val(), 10);
    linkArray['latency'] = latency;

    // 警戒値
    linkArray['maxTempCautionThreshold'] = $('#linkTable').find('tr').eq(10).find('td').eq(0).find('select').val();
    linkArray['minTempCautionThreshold'] = $('#linkTable').find('tr').eq(10).find('td').eq(1).find('select').val();
    linkArray['maxHygroCautionThreshold'] = $('#linkTable').find('tr').eq(10).find('td').eq(2).find('select').val();
    linkArray['minHygroCautionThreshold'] = $('#linkTable').find('tr').eq(10).find('td').eq(3).find('select').val();

    // 警報メール
    linkArray['isSend'] = $('#linkTable').find('tr').eq(11).find('td').find("input[type='checkbox']").attr('checked') ? 1 : 0;
    return linkArray;
}

/**
 * 温湿度センサー情報をセットします。
 * @param sensor 温湿度センサー設定
 * @param selectSensor 温湿度センサーリンク情報を表示するセンサーの番号
 * @param controller 空調制御コントローラー設定
 * @param linkInfo 温湿度センサーリンク情報
 */
function setLinkInfo(sensor, selectSensor, controller, linkInfo) {
    // 温室度センサーの設定
    setSensor(sensor, linkInfo.linkSensorId, selectSensor);

    // コントローラーの設定
    setController(controller, linkInfo.controllerId);

    // 監視周期 & 待機時間の設定
    setSurveillanceAndLatency(linkInfo.surveillanceCycle, linkInfo.latency);

    // 限界値 & 警戒値の設定
    setTemp(linkInfo.maxTempLimitThreshold, linkInfo.minTempLimitThreshold, linkInfo.maxTempCautionThreshold, linkInfo.minTempCautionThreshold);

    // 警戒値、限界値の湿度設定
    setHygro(linkInfo.maxHygroLimitThreshold, linkInfo.minHygroLimitThreshold, linkInfo.maxHygroCautionThreshold, linkInfo.minHygroCautionThreshold);

    // 警報メール送信フラグ
    setSendFlag(linkInfo.isSend);
}

/**
 * 温湿度センサー設定を設定コピー用セレクトボックスにセットします。
 * @param sensorConfig 温湿度センサー設定
 */
function setCopySensor(sensorConfig) {
    var sensorNum = sensorConfig.length;
    if (sensorNum < 1) {
        $('#configCopy').find('select').append("<option value='0'></option>");
        return;
    }
    for (var i = 0; i < sensorNum; i++) {
        $('#configCopy').find('select').append("<option value='" + sensorConfig[i].sensorId + "'>" + sensorConfig[i].sensorId + "</option>");
    }
}

/**
 * 温湿度センサー設定を画面にセットします。
 * @param sensorConfig 温湿度センサー設定
 * @param linkSensorId 温湿度センサーリンク情報をセットする温湿度センサーの番号
 * @param selectSensor 温湿度センサーリンク情報をセットする温湿度センサーの番号
 */
function setSensor(sensorConfig, linkSensorId, selectSensor) {
    var sensorNum = sensorConfig.length;
    if (sensorNum < 1) {
        $('#linkTable').find('tr').eq(0).find('td').find('select').append("<option value='0'></option>");
    }
    for (var i = 0; i < sensorNum; i++) {
        if (linkSensorId == sensorConfig[i].sensorId || linkSensorId == undefined && selectSensor == sensorConfig[i].sensorId) {
            $('#linkTable').find('tr').eq(0).find('td').find('select').append("<option selected value='" + sensorConfig[i].sensorId + "'>" + sensorConfig[i].sensorId + "</option>");
            $('#linkTable').find('tr').eq(1).find('td').text(sensorConfig[i].sensorName);
        } else {
            $('#linkTable').find('tr').eq(0).find('td').find('select').append("<option value='" + sensorConfig[i].sensorId + "'>" + sensorConfig[i].sensorId + "</option>");
        }
    }
}

/**
 * 空調制御コントローラー設定を画面にセットします。
 * @param controller 空調制御コントローラー設定
 * @param linkControllerId 温湿度センサーとリンクする空調制御コントローラーの番号
 */
function setController(controller, linkControllerId) {
    $('#linkTable').find('tr').eq(2).find('td').find('select').append("<option value='0'></option>");
    var controllerNum = controller.length;
    for(var i = 0; i < controllerNum; i++) {
        if (linkControllerId == controller[i].controllerId) {
            $('#linkTable').find('tr').eq(2).find('td').find('select').append("<option selected value='" + controller[i].controllerId + "'>" + controller[i].controllerId + "</option>");
        } else {
            $('#linkTable').find('tr').eq(2).find('td').find('select').append("<option value='" + controller[i].controllerId + "'>" + controller[i].controllerId + "</option>");
        }
    }
}

/**
 * 監視周期、待機時間の日時を画面にセットします。
 * @param surveillanceCycle 監視周期
 * @param latency 待機時間
 */
function setSurveillanceAndLatency(surveillanceCycle, latency) {
    var surveillanceNum = 0;
    if (surveillanceCycle != undefined) {
        surveillanceNum = parseInt(surveillanceCycle, 10);
    }
    var latencyNum = 0;
    if (latency != undefined) {
        latencyNum = parseInt(latency, 10);
    }

    // 監視周期、待機時間の分を設定
    var surveillanceMinute = surveillanceNum / 60;
    if (surveillanceMinute >= 1440) surveillanceMinute = surveillanceMinute - 1440;
    if (surveillanceMinute >= 60) surveillanceMinute = surveillanceMinute - 60;
    var latencyMinute = latencyNum / 60;
    if (latencyMinute >= 1440) latencyMinute = latencyMinute - 1440;
    if (latencyMinute >= 60) latencyMinute = latencyMinute - 60;
    setMinutes(parseInt(surveillanceMinute, 10), parseInt(latencyMinute, 10));

    // 監視周期、待機時間の時間を設定
    var surveillanceHour = surveillanceNum / 60 / 60;
    if (surveillanceHour >= 24) surveillanceHour = surveillanceHour - 24;
    var latencyHour = latencyNum / 60 / 60;
    if (latencyHour >= 24) latencyHour = latencyHour - 24;
    setHours(parseInt(surveillanceHour, 10), parseInt(latencyHour, 10));

    // 監視周期、待機時間の日を設定
    setDays(parseInt(surveillanceNum / 60 / 60 / 24, 10), parseInt(latencyNum / 60 / 60 / 24, 10));
}

/**
 * 監視周期、待機時間の日を画面にセットします。
 * @param surveillance 監視周期
 * @param latency 待機時間
 */
function setDays(surveillance, latency) {
    $('#linkTable').find('tr').eq(4).find('td').eq(0).find('select').append("<option value='0'></option>");
    $('#linkTable').find('tr').eq(8).find('td').eq(0).find('select').append("<option value='0'></option>");
    for (var i = 1; i < 31; i++) {
        // 監視周期
        if (surveillance == i) {
            $('#linkTable').find('tr').eq(4).find('td').eq(0).find('select').append("<option selected value='" + (i * 86400) + "'>" + i + '日間' + "</option>");            
        } else {
            $('#linkTable').find('tr').eq(4).find('td').eq(0).find('select').append("<option value='" + (i * 86400) + "'>" + i + '日間' + "</option>");            
        }

        // 待機時間
        if (latency == i) {
            $('#linkTable').find('tr').eq(8).find('td').eq(0).find('select').append("<option selected value='" + (i * 86400) + "'>" + i + '日間' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(8).find('td').eq(0).find('select').append("<option value='" + (i * 86400) + "'>" + i + '日間' + "</option>");
        }
    }
}

/**
 * 監視周期、待機時間の時を画面にセットします。
 * @param surveillance 監視周期
 * @param latency 待機時間
 */
function setHours(surveillance, latency) {
    $('#linkTable').find('tr').eq(4).find('td').eq(1).find('select').append("<option value='0'></option>");
    $('#linkTable').find('tr').eq(8).find('td').eq(1).find('select').append("<option value='0'></option>");
    for (var i = 1; i < 24; i++) {
        // 監視周期
        if (surveillance == i) {
            $('#linkTable').find('tr').eq(4).find('td').eq(1).find('select').append("<option selected value='" + (i * 3600) + "'>" + i + '時間' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(4).find('td').eq(1).find('select').append("<option value='" + (i * 3600) + "'>" + i + '時間' + "</option>");
        }

        // 待機時間
        if (latency == i) {
            $('#linkTable').find('tr').eq(8).find('td').eq(1).find('select').append("<option selected value='" + (i * 3600) + "'>" + i + '時間' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(8).find('td').eq(1).find('select').append("<option value='" + (i * 3600) + "'>" + i + '時間' + "</option>");            
        }
    }
}

/**
 * 監視周期、待機時間の分を画面にセットします。
 * @param surveillance 監視周期
 * @param latency 待機時間
 */
function setMinutes(surveillance, latency) {
    $('#linkTable').find('tr').eq(4).find('td').eq(2).find('select').append("<option value='0'></option>");
    $('#linkTable').find('tr').eq(8).find('td').eq(2).find('select').append("<option value='0'></option>");
    for (var i = 1; i < 60; i++) {
        // 監視周期
        if (surveillance == i) {
            $('#linkTable').find('tr').eq(4).find('td').eq(2).find('select').append("<option selected value='" + (i * 60) + "'>" + i + '分間' + "</option>");            
        } else {
            $('#linkTable').find('tr').eq(4).find('td').eq(2).find('select').append("<option value='" + (i * 60) + "'>" + i + '分間' + "</option>");                        
        }

        // 待機時間
        if (latency == i) {
            $('#linkTable').find('tr').eq(8).find('td').eq(2).find('select').append("<option selected value='" + (i * 60) + "'>" + i + '分間' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(8).find('td').eq(2).find('select').append("<option value='" + (i * 60) + "'>" + i + '分間' + "</option>");            
        }
    }
}

/**
 * 警戒値、限界値の温度を画面にセットします。
 * @param maxTempLimitThreshold 温度上限値(限界値)
 * @param minTempLimitThreshold 温度下限値(限界値)
 * @param maxTempCautionThreshold 温度上限値(警戒値)
 * @param minTempCautionThreshold 温度下限値(警戒値)
 */
function setTemp(maxTempLimitThreshold, minTempLimitThreshold, maxTempCautionThreshold, minTempCautionThreshold) {
    // 温度
    $('#linkTable').find('tr').eq(6).find('td').eq(0).find('select').append("<option value='999'></option>");
    $('#linkTable').find('tr').eq(10).find('td').eq(0).find('select').append("<option value='999'></option>");
    $('#linkTable').find('tr').eq(6).find('td').eq(1).find('select').append("<option value='999'></option>");
    $('#linkTable').find('tr').eq(10).find('td').eq(1).find('select').append("<option value='999'></option>");
    for (var i = -5; i < 41; i++) {
        // 温度上限値(限界値)
        if (maxTempLimitThreshold == String(i)) {
            $('#linkTable').find('tr').eq(6).find('td').eq(0).find('select').append("<option selected value='" + i + "'>" + i + '℃' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(6).find('td').eq(0).find('select').append("<option value='" + i + "'>" + i + '℃' + "</option>");
        }

        // 温度下限値(限界値)
        if (minTempLimitThreshold == String(i)) {
            $('#linkTable').find('tr').eq(6).find('td').eq(1).find('select').append("<option selected value='" + i + "'>" + i + '℃' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(6).find('td').eq(1).find('select').append("<option value='" + i + "'>" + i + '℃' + "</option>");
        }

        // 温度上限値(警戒値)
        if (maxTempCautionThreshold == String(i)) {
            $('#linkTable').find('tr').eq(10).find('td').eq(0).find('select').append("<option selected value='" + i + "'>" + i + '℃' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(10).find('td').eq(0).find('select').append("<option value='" + i + "'>" + i + '℃' + "</option>");
        }

        // 温度下限値(警戒値)
        if (minTempCautionThreshold == String(i)) {
            $('#linkTable').find('tr').eq(10).find('td').eq(1).find('select').append("<option selected value='" + i + "'>" + i + '℃' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(10).find('td').eq(1).find('select').append("<option value='" + i + "'>" + i + '℃' + "</option>");
        }
    }
}

/**
 * 警戒値、限界値の湿度を画面にセットします。
 * @param maxHygroLimitThreshold 湿度上限値(限界値)
 * @param minHygroLimitThreshold 湿度下限値(限界値)
 * @param maxHygroCautionThreshold 湿度上限値(警戒値)
 * @param minHygroCautionThreshold 湿度下限値(警戒値)
 */
function setHygro(maxHygroLimitThreshold, minHygroLimitThreshold, maxHygroCautionThreshold, minHygroCautionThreshold) {
    // 湿度
    $('#linkTable').find('tr').eq(6).find('td').eq(2).find('select').append("<option value='999'></option>");
    $('#linkTable').find('tr').eq(10).find('td').eq(2).find('select').append("<option value='999'></option>");
    $('#linkTable').find('tr').eq(6).find('td').eq(3).find('select').append("<option value='999'></option>");
    $('#linkTable').find('tr').eq(10).find('td').eq(3).find('select').append("<option value='999'></option>");
    for (var i = 10; i < 91; i += 5) {
        // 湿度上限値(限界値)
        if (maxHygroLimitThreshold == String(i)) {
            $('#linkTable').find('tr').eq(6).find('td').eq(2).find('select').append("<option selected value='" + i + "'>" + i + '%' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(6).find('td').eq(2).find('select').append("<option value='" + i + "'>" + i + '%' + "</option>");
        }

        // 湿度下限値(限界値)
        if (minHygroLimitThreshold == String(i)) {
            $('#linkTable').find('tr').eq(6).find('td').eq(3).find('select').append("<option selected value='" + i + "'>" + i + '%' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(6).find('td').eq(3).find('select').append("<option value='" + i + "'>" + i + '%' + "</option>");
        }

        // 湿度上限値(警戒値)
        if (maxHygroCautionThreshold == String(i)) {
            $('#linkTable').find('tr').eq(10).find('td').eq(2).find('select').append("<option selected value='" + i + "'>" + i + '%' + "</option>");
        } else {
            $('#linkTable').find('tr').eq(10).find('td').eq(2).find('select').append("<option value='" + i + "'>" + i + '%' + "</option>");
        }

        // 湿度下限値(警戒値)
        if (minHygroCautionThreshold == String(i)) {
            $('#linkTable').find('tr').eq(10).find('td').eq(3).find('select').append("<option selected value='" + i + "'>" + i + '%' + "</option>");  
        } else {
            $('#linkTable').find('tr').eq(10).find('td').eq(3).find('select').append("<option value='" + i + "'>" + i + '%' + "</option>");  
        }
    }
}

/**
 * 警報メール送信フラグを画面にセットします。
 * @param isSend 送信フラグ
 */
function setSendFlag(isSend) {
    if (isSend == '1') {
        $('#linkTable').find('tr').eq(11).find('td').find('input').attr('checked', 'checked');
    }
}

/**
 * 非同期通信で温湿度センサー紐付け情報を取得します。
 * @return Array 温湿度センサー紐付け情報 [
 *              'linkSensorId' : 温湿度センサー番号,
 *              'linkControllerId' : 空調制御コントローラー番号,
 *              'surveillanceCycle' : 温湿度監視周期,
 *              'maxTempLimitThreshold' : 温度上限値(限界値),
 *              'minTempLimitThreshold' : 温度下限値(限界値),
 *              'maxHygroLimitThreshold' : 湿度上限値(限界値),
 *              'minHygroLimitThreshold' : 湿度下限値(限界値),
 *              'latency' : 待機時間,
 *              'maxTempCautionThreshold' : 温度上限値(警戒値),
 *              'minTempCautionThreshold' : 温度下限値(警戒値),
 *              'maxHygroCautionThreshold' : 湿度上限値(警戒値),
 *              'minHygroCautionThreshold' : 湿度下限値(警戒値),
 *              'isSend' : 警報メール送信可否
 *             ]
 */
function getLinkSensor(sensorId) {
    var linkInfo = null;
    $.ajax({
        type: 'POST',
        async: false,
        url: '../php/requestReceptionist.php',
        dataType: 'json',
        data: {'target' : 'LinkInfo', 'sensorId' : sensorId},
    }).done(function(json) {
        if (json == null || json.length == 0) {
            alert('取得可能な温湿度センサー紐付け情報が存在しません。\n'
              + '温湿度センサー設定画面から\n温湿度センサー情報を登録してください。');
			      return null;
        }
        linkInfo = json;
    }).fail(function (data) {
        alert('温湿度センサーリンク情報の取得に失敗しました。');
        return null;
    });

    return linkInfo;
}
