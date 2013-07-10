/**
 * @fileOverview 温湿度データダウンロードを扱うモジュールです。
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

var date = "";       // 温湿度データファイルの日付
var sensorNo = ""; // センサー番号
var timer = null; // 再描画用タイマー

$(function() {
    // 1分間隔で再描画
	timer = setInterval('redraw()', 60000);
    
    // 温湿度センサー情報設定
    setSensor();
	 
	// 日付が選択されているか否か
	$('#downloadTemp').click(checkSelectDate);
	 
	// センサーが変わると日付を初期化
	$('#sensor').change(changeSensor);

    var dates = $('#from, #to').datepicker({
		changeMonth: true,
		numberOfMonths: 1,
		onSelect: function(selectedDate) {
			var option = this.id == 'from' ? 'minDate' : 'maxDate',
				instance = $(this).data('datepicker'),
				d = $.datepicker.parseDate(
					instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
					selectedDate, instance.settings);
			dates.not(this).datepicker('option', option, d);
			if ($(this).get(0) == $('#from').get(0)) {
				date = $('#from').val();
				redraw();
			}
		}
	});
	
	$('#sensorName').val($('#sensor option:selected').text());
	
	date = new DateFormat('yyyy/MM/dd').format(new Date());
	sensorNo = '1'; // 初期表示時などは1番目のセンサーを表示
	TempGraph.setTitle($('#sensorName').val() + ' ' +  date.split('/')[0] + '年' +  date.split('/')[1] + '月' + date.split('/')[2] + '日');
	$('#from').val(date);
	$('#to').val('');
    
    // 温湿度データ取得
    var thermoHygro = getThermoHygro(date, sensorNo, '../../php/requestReceptionist.php');
    if (thermoHygro == null) {
        clearTempLogger();
        return;
    } else if (thermoHygro['thermo'] == undefined) {
        clearTempLogger();
        $('#downloadTemp').attr('disabled', true);
        return;
    }
    $('#downloadTemp').attr('disabled', false);
    TempGraph.show('linechart', 25, [thermoHygro['thermo'], thermoHygro['hygro']]);
});

/**
 * ダウンロードボタン押下時に日付が選択されているかチェックします。
 */
 function checkSelectDate() {
    if ($('#from').val() === '') {
        alert('温湿度データをダウンロードする日付を選択してください。');
        return false;
    }
 }

/**
 * 選択した温湿度センサーの温湿度データをグラフ表示します。
 */
function changeSensor() {
    $('#from').val('');
    $('#to').val('');
    $('#sensorName').val($('#sensor option:selected').text());
    sensorNo = $('#sensor option:selected').val();
    date = new DateFormat('yyyy/MM/dd').format(new Date());
    $('#from').val(date);
    redraw();
}

/**
 * 温湿度センサー情報を設定します。
 */
function setSensor() {
    var sensor = getTempLoggerConfigNearDate('../../php/requestReceptionist.php', date);
    if (sensor == null) return;
    if (sensor.length === 0) {
        $('#sensor').attr('disabled', true);
        $('#downloadTemp').attr('disabled', true);
        $('#from').attr('disabled', true);
        $('#to').attr('disabled', true);
        alert("ダウンロード可能な温湿度データが存在しません。\n"
            + "温湿度センサー設定画面から\n温湿度センサー情報を登録してください。");
        return;
    }
    
    var sensorNum = sensor.length;
    for (var i = 0; i < sensorNum; i++) {
        $('#sensor').append($('<option value=' + sensor[i]['sensorId'] + '>' + sensor[i]['sensorName'] + '</option>'));
    }
    $('#sensor').val('1');
}

/**
 * 温湿度グラフを再描画します。
 */
function redraw() {
	TempGraph.destroy();
	TempGraph.setTitle($('#sensorName').val()  + ' ' +  date.split('/')[0] + '年' +  date.split('/')[1] + '月' + date.split('/')[2] + '日');
    // 温湿度データ取得
    var thermoHygro = getThermoHygro(date, sensorNo, '../../php/requestReceptionist.php');
    if (thermoHygro == null || thermoHygro['thermo'] == undefined) {
        clearTempLogger();
        $('#downloadTemp').attr('disabled', true);
        return;
    }
    $('#downloadTemp').attr('disabled', false);
    TempGraph.show('linechart', 25, [thermoHygro['thermo'], thermoHygro['hygro']]);
}

/**
 * 温湿度データ・センサー情報をクリアします。
 */
function clearTempLogger() {
	clearTimeout(timer);
	TempGraph.destroy();
    TempGraph.setTitle($('#sensorName').val() + ' ' +  date.split('/')[0] + '年' +  date.split('/')[1] + '月' + date.split('/')[2] + '日');
	TempGraph.show('linechart', 25, [[{}], [{}]]);
}