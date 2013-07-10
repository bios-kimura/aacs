# -*- coding: utf-8 -*-

"""
温湿度のロギング、温湿度監視、空調制御コマンドの送信を行うモジュール

2013/08/09	ver1.00

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
"""

import serial
import re
import datetime
import logging
import logging.config
import Queue
import sys
import time
from xbee import XBee,ZigBee
from socketcommand.socket_command import ScoketCommand
from config.xml.system_config_xml import SystemConfigXML
from config.xml.controller_config_xml import ControllerConfigXML
from surveillance.temperature_surveillance import TemperatureSurveillance
from log.temperature_log import TemperatureLog
from mail.fatal_error_mail import FatalErrorMail

logging.config.fileConfig('log.conf')

temp_log = TemperatureLog()
command_queue = Queue.Queue()
controller_config = ControllerConfigXML()

def logging_temperature(sensing_data):
    """
    温湿度データのロギングをします。
    """
    temp = sensing_data['rf_data'].rstrip()
    
    # 温湿度データの書式チェック
    if None == re.match("[0-9]{2}[,]{1}[\s]?[\s]?[-]?[0-9]?[0-9]?[.]{1}[0-9]{1}[,]{1}[\s]?[\s]?[-]?[0-9]?[0-9]?[.]{1}[0-9]{1}", temp):
        logging.warn(u'破棄するデータ: ' + temp)
        return
    
    # 温湿度データの書き込み
    file_path = temp_log.make_path(temp[1])
    temp_log.write(file_path, temp[3:])
    
    logging.debug(u'ロギングデータ:' + temp)

# 温湿度データのロギング・監視を行い空調を制御します。
def main():
    cordinator = None
    xbee = None
    
    system_config = SystemConfigXML().read()
    
    # システム設定ファイルの存在可否
    if system_config == None:
        logging.error(u'システム設定ファイルが存在しません。')
        sys.exit()
    
    try:
        cordinator = serial.Serial(port=system_config['cordinator'], baudrate=9600, timeout=1, bytesize=8, parity='N')
        xbee = ZigBee(cordinator)
        
        # 温湿度データの監視
        temp_surveillance = TemperatureSurveillance(command_queue)
        temp_surveillance.start()
        
       # ソケット通信による空調制御コマンド受信
        socket_command = ScoketCommand(command_queue)
        socket_command.start()
        
        check_xbee_voltage_time = datetime.datetime.now() # XBee電圧チェック時間
        xbee_voltage_check_num = 0
        send_command_num = 0
        while True:
            # 1日に1回空調制御コントローラーの電圧を確認
            now = datetime.datetime.now()
            if check_xbee_voltage_time <= now:
                controller_list = controller_config.all_read()
                for conf in controller_list:
                    xal = re.split('(..)', conf['xbee'])[1::2]
                    xbee_addr = chr(int(xal[0], 16)) + chr(int(xal[1], 16)) + chr(int(xal[2], 16)) + chr(int(xal[3], 16)) + chr(int(xal[4], 16)) + chr(int(xal[5], 16)) + chr(int(xal[6], 16)) + chr(int(xal[7], 16))

                    timeout = datetime.datetime.now() + datetime.timedelta(seconds=10)
                    get_supply_num = 0
                    while True:
                        get_supply_num += 1
                        xbee.send('remote_at', dest_addr_long=xbee_addr, dest_addr='\xFF\xFE', command='%v', frame_id='A')
                        logging.info(u'空調制御コントローラーNo.' + conf['id'] + u'番電圧取得回数:' + str(get_supply_num) + u'回目')
                        
                        if timeout < datetime.datetime.now():
                            timeout = datetime.datetime.now() + datetime.timedelta(seconds=10)
                            xbee_voltage_check_num += 1
                            logging.warn(u'電圧取得処理タイムアウト' + str(xbee_voltage_check_num) + u'回目')
                            if 10 <= xbee_voltage_check_num:
                                logging.warn(u'空調制御コントローラーNo' + conf['id'] + u'の電圧取得処理タイムアウト')
                                subject = datetime.datetime.today().strftime('%Y/%m/%d %H:%M:%S 空調制御コントローラーNo' + conf['id'] + 'の電圧取得処理タイムアウト')
                                body = u'空調制御コントローラーのバッテリー残量なし若しくはコントローラー故障の可能性があります。\n早めの確認をお願いします。'
                                FatalErrorMail().send_mail(system_config, subject, body)
                                xbee_voltage_check_num = 0
                                break

                        recv_data = xbee.wait_read_frame()
                        if not recv_data:
                            logging.warn(u'温湿度データもしくはXBee電圧取得コマンド送信結果が存在しません。')
                            time.sleep(0.1)
                            continue

                        if  recv_data.has_key('parameter'):
                            mv = int(hex(ord(recv_data['parameter'][0])).split('0x')[1] + hex(ord(recv_data['parameter'][1])).split('0x')[1], 16)
                            logging.warn(u'コントローラーNo.' + conf['id'] + ' = ' + str(mv) + u'mV, 閾値 = ' + system_config['xbee'] + 'V')
                            subject = datetime.datetime.today().strftime('%Y/%m/%d %H:%M:%S 空調制御コントローラーNo' + conf['id'] + 'の取得電圧')
                            body = u'コントローラーNo.' + conf['id'] + ' = ' + str(mv) + u'mV, 閾値 = ' + system_config['xbee'] + 'V'
                            system_config['to'] = 'yamashita@bios-net.co.jp'
                            FatalErrorMail().send_mail(system_config, subject, body)
                            xbee_voltage_check_num = 0
                            system_config = SystemConfigXML().read()
           
                            # 取得した電圧値と閾値を比較し、閾値を下回ればメール通知
                            if float(system_config['xbee']) * 1000 > float(mv):
                                subject = datetime.datetime.today().strftime('%Y/%m/%d %H:%M:%S 空調制御コントローラー バッテリー残量低下')
                                body = u'空調制御コントローラー' + conf['id'] + u'番のバッテリー残量が低下しています。\n早めのバッテリー交換をお願いします。'
                                FatalErrorMail().send_mail(system_config, subject, body)
                            break
                        elif recv_data.has_key('rf_data'):
                            # 温湿度データをロギング
                            logging_temperature(recv_data)
                            
                        time.sleep(0.5)
                # 日付を加算
                one_day = datetime.timedelta(days=1)
                check_xbee_voltage_time = now + one_day

            # 空調制御コマンドキューにコマンドが存在すれば送信
            if not command_queue.empty():
                queue = command_queue.get()
                
                # XBee番号を取得
                controller = controller_config.read(queue['controller_id'])
                
                # 空調制御コントローラー設定の存在可否
                if controller == None:
                    logging.error(u'空調制御コントローラー設定ファイルが存在しません。')
                elif controller == {}:
                    logging.error(u'空調制御コントローラー設定が存在しません。')
                else:
                    # 空調制御コマンド送信
                    logging.debug(u'空調制御コマンド送信: コントローラー番号 ' + queue['controller_id'] + u': 送信コマンド: ' + queue['command'])
                    xal = re.split('(..)', controller['xbee'])[1::2]
                    xbee_addr = chr(int(xal[0], 16)) + chr(int(xal[1], 16)) + chr(int(xal[2], 16)) + chr(int(xal[3], 16)) + chr(int(xal[4], 16)) + chr(int(xal[5], 16)) + chr(int(xal[6], 16)) + chr(int(xal[7], 16))
                    
                    timeout = datetime.datetime.now() + datetime.timedelta(seconds=10)
                    while True:
                        if timeout < datetime.datetime.now():
                            timeout = datetime.datetime.now() + datetime.timedelta(seconds=10)
                            send_command_num += 1
                            logging.warn(u'空調制御コマンド送信処理タイムアウト' + str(send_command_num) + u'回目')
                            if 10 <= send_command_num:
                                logging.warn(u'空調制御コントローラーNo' + controller['id'] + u'のコマンド送信処理タイムアウト')
                                subject = datetime.datetime.today().strftime('%Y/%m/%d %H:%M:%S 空調制御コントローラーNo' + controller['id'] + 'の空調制御コマンド送信処理タイムアウト')
                                body = u'空調制御コントローラー故障の可能性があります。\n早めの確認をお願いします。'
                                FatalErrorMail().send_mail(system_config, subject, body)
                                send_command_num = 0
                                break

                        xbee.send('tx', dest_addr_long=xbee_addr, dest_addr='\xFF\xFE', data=queue['command'], frame_id='\x10')
                        recv_data = xbee.wait_read_frame()
                        if not recv_data:
                            logging.warn(u'温空調制御コマンド送信結果が存在しません。')
                            time.sleep(0.1)
                            continue

                        if recv_data.has_key('deliver_status'):
                            deliver_status = recv_data['deliver_status']
                            char_code =  int(ord(deliver_status))
                            print u'コマンド送信結果:' + str(char_code)
                            if char_code == 0:
                                logging.info(u'空調制御コマンドは正常に送信されました。')
                                send_command_num = 0
                                break
                        elif recv_data.has_key('rf_data'):
                            # 温湿度データをロギング
                            logging_temperature(recv_data)

                        time.sleep(0.5)

            # 温湿度データを受信した場合は保存
            if cordinator.inWaiting() > 0:
                sensing_data = xbee.wait_read_frame()
                if not sensing_data:
                    logging.warn(u'温湿度データが存在しません。')
                    time.sleep(0.1)
                    continue
                
                # 温湿度データが存在するか否か？
                if sensing_data.has_key('rf_data'):
                    # 温湿度データをロギング
                    logging_temperature(sensing_data)
                
            time.sleep(0.1)
    except KeyboardInterrupt:
        logging.warn(u'キーボード操作により処理を停止します。')
    except:
        subject = datetime.datetime.today().strftime('%Y/%m/%d %H:%M:%S 空調自動制御システム異常')
        body = u'空調自動制御システムが停止しました。\n\nメッセージ\n' + str(sys.exc_info()[0])
        FatalErrorMail().send_mail(system_config, subject, body)
        logging.error(sys.exc_info()[0])
    finally:
        if xbee != None:
            xbee.halt()
        if cordinator != None:
            cordinator.close()

if __name__ == '__main__':
	main()
