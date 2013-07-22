aacs
====

空調自動制御システム


■始めに
-

このシステムは温湿度センサーにてロギングした温湿度を定期的に監視し、
閾値を超えた際に空調を制御します。

■バージョン
-

バージョン 1.0.0

■更新履歴
-

1.0.0 : 初版

■動作環境
-

このシステムは以下のOS及びライブラリを用いて動作確認を行っています。

Windows XP Professional SP3

Python 2.7.3(http://www.python.jp/download/)  
pyserial 2.5(http://en.sourceforge.jp/projects/sfnet_pyserial/releases/)  
python-xbee 2.1.0(https://code.google.com/p/python-xbee/)  

温湿度のロギングにはArduino Unoを用いて動作確認を行いました。  

Arduino Uno R3(http://www.switch-science.com/catalog/789/)  
Arduino ワイヤレスSDシールド(http://www.switch-science.com/catalog/787/)  
XBee-PRO ZB / ワイヤアンテナ型(http://www.switch-science.com/catalog/602/)  
GROVE - ベースシールド(http://www.switch-science.com/catalog/1293/)  
GROVE - デジタル温度・湿度センサPro(http://www.switch-science.com/catalog/819/)  

空調制御制御には自作Arduinoを用いています。

Arduino Uno用交換チップ(http://www.switch-science.com/catalog/663/)  
XBee-PRO ZB / ワイヤアンテナ型(http://www.switch-science.com/catalog/602/)   
低損失三端子レギュレーター(http://akizukidenshi.com/catalog/g/gI-00534/)  
マイクロSDカードスロット・ピッチ変換基板(http://www.switch-science.com/catalog/36/)  
クリスタル(http://akizukidenshi.com/catalog/g/gP-00545/)  
赤外線ＬＥＤ(http://akizukidenshi.com/catalog/g/gI-04311/)  

■ディレクトリ構成
-

　/(aacs)  
　|  
　|-config(設定ファイル格納ディレクトリ)  
　| |  
　| |-controlCommand(空調制御コマンド)  
　| |  
　| |-controllerCommand(空調制御コントローラーに設定したコマンド)  
　| |  
　| |-tempLoggerConfig(温湿度センサーの設定)  
　| |  
　| |-controllerConfig.xml(空調制御コントローラーの設定)  
　| |  
　| |-controllerState.xml(空調制御コントローラーの稼働状況)  
　| |  
　| |-linkInfo.xml(温湿度センサーと空調制御コントローラーの紐付き設定など)  
　| |  
　| |-systemConfig.xml(メール設定やRS232C設定など)  
　|  
　|-log(Pythonのログ、温湿度データ格納ディレクトリ)  
　| |  
　| |-ThermoHygro(温湿度センサーからロギングした温湿度データ)  
　|  
　|-python  
　| |  
　| |-airconditioner_controller.py(空調自動制御システム)  
　| |  
　| |-config  
　| | |  
　| | |-xml  
　| | | |  
　| | | |-control_command_xml.py(空調制御コマンド)  
　| | | |  
　| | | |-controller_command_xml.py(空調制御コントローラーコマンド)  
　| | | |  
　| | | |-controller_config_xml.py(空調制御コントローラー設定)  
　| | | |  
　| | | |-controller_state_xml.py(空調制御コントローラー状態)  
　| | | |  
　| | | |-link_info_xml.py(温湿度センサー・空調制御コントローラー紐付け設定)  
　| | | |  
　| | | |-system_config_xml.py(システム設定)  
　| | | |  
　| | | |-templogger_config_xml.py(温湿度センサー設定)  
　| |  
　| |-judge  
　| | |  
　| | |-caution_value_judge.py(警戒値判定)  
　| | |  
　| | |-limit_value_judge.py(限界値判定)  
　| | |  
　| | |-threshold_judge.py(閾値判定)  
　| |  
　| |-log  
　| | |  
　| | |-temperature_log.py(温湿度データ)  
　| |  
　| |-mail  
　| | |  
　| | |-base_mail.py(ベースメール)  
　| | |  
　| | |-fatal_error_mail.py(死活監視メール)  
　| | |  
　| | |-temperature_alert_mail.py(温湿度異常メール)  
　| |  
　| |-socketcommand  
　| | |  
　| | |-socket_command.py(ソケット通信による空調制御)  
　| |  
　| |-surveillance  
　| | |  
　| | |-temperature_surveillance.py(温湿度監視)  
　| |  
　| |-log.conf(Pythonのログ出力設定)  

■このシステムを使用する前に
-

・設定変更を行なってください  
  
温湿度センサー名  
　./aacs/config/tempLoggerConfig/1-tempLoggerConfig.xmlに温湿度センサーを設置する部屋の名称などを記述して下さい。  
　センサーが増えた際は、「1-tempLoggerConfig.xml」をコピーして「2-tempLoggerConfig.xml」というように先頭の数値をセンサー数に合わして増やしてください。  
(例)
```
<?xml version="1.0" encoding="UTF-8"?>  
<temepLogger>  
<sensor id="1">  
<sensorName>センサー1</sensorName>  
<date>2013/07/08</date>  
</sensor>  
</temepLogger>  
```
  
空調制御コントローラーのXBeeシリアル番号  
　./aacs/config/controllerConfig.xmlに空調制御コントローラーのXBeeシリアル番号を記述してください。  
　XBeeの裏面に貼ってあるシールで確認できます。16桁入力して下さい。  
　空調制御コントローラーの数が増えた際は、controllers要素にcontroller要素を追加してください。  
　(例)  
```
　<?xml version="1.0" encoding="UTF-8"?>  
　<controllers>   
  　<controller id="1">  
    　<xbee>0013A200xxxxxxxx</xbee>  
  　</controller>  
  　<controller id="2">  
    　<xbee>0013A200xxxxxxxx</xbee>  
  　</controller>  
　</controllers>  
```
  
XBeeコーディネータのCOMポート  
　./aacs/config/systemConfig.xmlにXBeeコーディネータのCOMポートを記述してください。  
　XBeeコーディネータをPCと接続し、デバイスマネージャ→ポート(COMとLPT)にて確認できます。  
　(例)  
```
　<?xml version="1.0" encoding="UTF-8"?>  
　<systemConfig>  
  　<cordinator>COM1</cordinator>  
　</systemConfig>  
```

・必要に応じて動作環境にありますライブラリのインストールを行なって下さい  
・必要に応じて温湿度センサー、空調制御コントローラーの用意  
・XBeeの設定方法は以下のHPが参考になります。  
http://mag.switch-science.com/2012/08/01/startup_xbee_zb/

■使用方法
-

python ./aacs/python/airconditioner_controller.pyで実行します。

■ライセンス
-

The MIT License
 
Copyright (c) 2013 株式会社バイオス (http://www.bios-net.co.jp/index.html)
 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
