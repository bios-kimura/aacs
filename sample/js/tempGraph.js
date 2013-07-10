 /**
 * @fileOverview 温湿度グラフを扱うモジュールです。
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
 
var TempGraph = (function() {
    var _graph = null; // 温湿度グラフ
    var _title = ''; // 温湿度グラフタイトル
    
    /**
     * 温湿度グラフを消去します。
     */
    function _destroy() {
        // 温湿度グラフを破棄
        if (_graph != null) {
            _graph.destroy();
        }

        // 温湿度グラフタイトルを初期化
        _titile = '';
    }

    /**
     * 温湿度グラフのタイトルを設定します。
     * @param title 温湿度グラフタイトル
     */
    function _setTitle(title) {
        _title = title;
    }
    
    /**
     * 温湿度グラフを表示します。
     * @param graphId 温湿度グラフを描画するDIVタグのID
     * @param numberTicks 温湿度グラフX軸(時刻)の個数
     * @param thermoHygro 温度データ[{'time' : 時刻, 'thermo' : 温度}]
     */
    function _show(graphId, numberTicks, thermoHygro) {
        _graph = $.jqplot(graphId, thermoHygro, {
            series: [{label: '温度', yaxis: 'yaxis', lineWidth: 2},
                     {label: '湿度', yaxis: 'y2axis', lineWidth: 2},
                     {label: '気温1', yaxis: 'yaxis', lineWidth: 1},
                     {label: '湿度2', yaxis: 'y2axis', lineWidth: 1}],
            seriesDefaults: { showMarker: false },
            axes: {
                xaxis: {
                    numberTicks: numberTicks,
                    tickOptions: {
                        angle: 30,
                        formatString: '%H:%M'
                    },
                    renderer: $.jqplot.DateAxisRenderer,
                    min: '00:00',
                    max: '24:00',
                    tickRenderer: $.jqplot.CanvasAxisTickRenderer, 
                    label: _title
                },
                yaxis: {
                    label: '℃',
                    ticks: [-5, 0, 5, 10, 15, 20, 25, 30, 35, 40],
                    tickoptions: {
                        mark: 'outside',
                        showMark: true,
                        showGridline: true,
                        show: true,
                        showLabel: true,
                        formatString: '%d', // C言語のsprintfと同じフォーマットが使える
                    }
                },
                y2axis: {
                    label: '%',
                    ticks: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                    tickoptions: {
                        mark: 'outside',
                        showMark: true,
                        showGridline: true,
                        show: true,
                        showLabel: true,
                        formatString: '%d',
                    }
                }
            },
            legend: {
                show: true,
                location: 'nw',
                xoffset: 10,
                yoffset: 10,
            },
            highlighter: {
                show: true, // マウスオーバー時の数値表示
                tooltipAxes: 'y' // Y軸のみ表示
            }
        });
    }
    
    return {
        show : _show,
        destroy: _destroy,
        setTitle: _setTitle
    };
}());

