# -*- coding: utf-8 -*-

"""
温湿度監視を行うモジュール

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

import logging
import logging.config
import threading
import os
import datetime
import time
import parser
import csv
import re

from config.xml.controller_state_xml import ControllerStateXML
from config.xml.templogger_config_xml import TempLoggerConfigXML
from config.xml.link_info_xml import LinkInfoXML
from mail.temperature_alert_mail import TemperatureAlertMail
from log.temperature_log import TemperatureLog
from judge.limit_value_judge import LimitValueJudge
from judge.caution_value_judge import CautionValueJudge

logging.config.fileConfig('log.conf')
temperature_alert_mail = TemperatureAlertMail()

SURVEILLANCE_CYCLE = 60

class TemperatureSurveillance(threading.Thread):
    """
    温湿度監視を行うクラス。
    """
    
    def __init__(self, command_queue):
        threading.Thread.__init__(self)
        self.setDaemon(True)
        self.command_queue = command_queue
        
    def run(self):
        try:
            controller_state = ControllerStateXML()
            temp_log = TemperatureLog()
            templogger_config = TempLoggerConfigXML()
            link_info = LinkInfoXML()
            limit_value_judge = LimitValueJudge()
            caution_value_judge = CautionValueJudge()
            while True:
                # 温湿度データ監視
                templogger_config_list = templogger_config.read()
                
                # 温湿度センサー設定の存在確認
                if templogger_config_list == None:
                    logging.warning(u'温湿度センサー設定が存在しません。')
                    time.sleep(SURVEILLANCE_CYCLE)
                    continue

                for sensor in templogger_config_list:
                    now = datetime.datetime.now().strftime('%H:%M:%S')

                    # 温湿度センサーとコントローラーの紐付き情報を取得
                    link_dic = link_info.read(sensor['id'])
                    
                    # リンクファイルの存在可否
                    if link_dic == None:
                        logging.error(u'温湿度センサーリンク設定ファイルが存在しません。')
                        break
                    
                    # リンク情報の存在可否
                    if link_dic == {}:
                        logging.debug(u'温湿度センサー' + sensor['id'] + u'番と紐付くコントローラーが存在しません。')
                        continue

                    # 空調制御状態を取得
                    controller_state_dic = controller_state.read(link_dic['controller_id'])
                    
                    # 空調制御状態ファイルの存在可否
                    if controller_state_dic == None:
                        logging.error(u'空調制御状態ファイルが存在しません。')
                        break
                    
                    # 空調制御状態の存在可否
                    if controller_state_dic == {}:
                        logging.debug(u'空調制御コントローラー' + link_dic['controller_id'] + u'番の空調制御設定が存在しません。')
                        continue

                    surveillance_count = int(controller_state_dic['surveillance_count']) + 1
                    
                    # 監視周期に達したか否か
                    logging.debug(u'監視周期: ' + str((int(link_dic['surveillance_cycle']) / 60)) + u'分, 監視回数: ' + str(surveillance_count) + u'回')
                    if  not int(link_dic['surveillance_cycle']) <= (surveillance_count * 60):
                        logging.debug(u'監視周期に達していません。')
                        controller_state_dic['surveillance_count'] = str(surveillance_count)
                        
                        # 空調制御状態を書き込み
                        controller_state.write(controller_state_dic)
                        continue
                    controller_state_dic['surveillance_count'] = '0'

                    # 温湿度データ取得
                    file_path = temp_log.make_path(sensor['id'])
                    temprature = temp_log.read(file_path)

                    # 温湿度データに時刻、温度、湿度が書き込まれてるか否か
                    if len(temprature) != 3:
                        logging.debug(u'温湿度センサー' + sensor['id'] + u'番の温湿度データが存在しません。')
                        # 空調制御状態を書き込み
                        controller_state.write(controller_state_dic)
                        continue

                    logging.debug(u'読み込みデータ:' + now + ', 0' + sensor['id'] + ',' + temprature[1] + ',' + temprature[2])
                    
                    # 限界値と警戒値
                    temp = float(temprature[1])
                    hygro = float(temprature[2])

                    max_temp_limit = float(link_dic['max_temp_limit_threshold'])
                    min_temp_limit = float(link_dic['min_temp_limit_threshold'])
                    max_hygro_limit = float(link_dic['max_hygro_limit_threshold'])
                    min_hygro_limit = float(link_dic['min_hygro_limit_threshold'])

                    max_temp_caution = float(link_dic['max_temp_caution_threshold'])
                    min_temp_caution = float(link_dic['min_temp_caution_threshold'])
                    max_hygro_caution = float(link_dic['max_hygro_caution_threshold'])
                    min_hygro_caution = float(link_dic['min_hygro_caution_threshold'])

                    logging.debug(u'限界値: ' + str(max_temp_limit) + u',' + str(min_temp_limit) + u',' + str(max_hygro_limit) + u',' + str(min_hygro_limit))
                    logging.debug(u'警戒値: ' + str(max_temp_caution) + u',' + str(min_temp_caution) + u',' + str(max_hygro_caution) + u',' + str(min_hygro_caution))

                    # 限界値を超えているか否か？
                    if limit_value_judge.judge(temp, hygro, max_temp_limit, min_temp_limit, max_hygro_limit, min_hygro_limit):

                        sent_command = controller_state_dic['sent_command']
                        if sent_command != '1' and sent_command != '2' and sent_command != '3':
                            logging.info(u'オペレーション介入後も閾値を下回らないため、再度オペレーション介入時のコマンドを空調制御コマンドキューへ格納します。')
                            self.command_queue.put({'controller_id' : controller_state_dic['id'], 'command' : controller_state_dic['sent_command']})
                        else:
                            controller_state_dic['sent_command'] = '\x33'
                            logging.info(u'限界値を超えたため第2コマンドを空調制御コマンドキューへ格納します。')
                            self.command_queue.put({'controller_id' : controller_state_dic['id'], 'command' : controller_state_dic['sent_command']})
                    
                        # 警告メールを送信
                        if int(link_dic['is_send']): 
                            logging.debug(u'限界値を超えたため警告メールを送信します。')
                            temperature_alert_mail.send_alert_mail(temprature, sensor['id'], sensor['name'], u'限界値')
                        else:
                            logging.debug(u'警報メール送信停止中です。')

                    # 警戒値を超えているか否か？
                    elif caution_value_judge.judge(temp, hygro, max_temp_caution, min_temp_caution, max_hygro_caution, min_hygro_caution):

                        # 待機時間を超えているか否か？
                        latency_count = int(controller_state_dic['latency_count']) + 1
                        controller_state_dic['latency_count'] = str(latency_count)
                        logging.info(u'待機時間: ' + str(latency_count) + '/' + str(int(link_dic['latency']) / 60) + u'分')
                        if int(link_dic['latency']) <= (latency_count * 60):
                            controller_state_dic['latency_count'] = '0'
                            sent_command = controller_state_dic['sent_command']
                            if sent_command != '1' and sent_command != '2' and sent_command != '3':
                                logging.info(u'オペレーション介入後も閾値を下回らないため、再度オペレーション介入時のコマンドを空調制御コマンドキューへ格納します。')
                                self.command_queue.put({'controller_id' : controller_state_dic['id'], 'command' : controller_state_dic['sent_command']})
                            else:
                                # 第1コマンドを空調制御コマンドキューへ追加
                                controller_state_dic['sent_command'] = '\x32'
                                logging.info(u'温湿度が警戒値を超えたため第1コマンドを空調制御コマンドキューへ格納します。')
                                self.command_queue.put({'controller_id' : controller_state_dic['id'], 'command' : controller_state_dic['sent_command']})
                        else:
                            logging.debug(u'待機時間に達していません。')
                                
                        # 警告メールを送信
                        if int(link_dic['is_send']): 
                            logging.debug(u'警戒値を超えたため警告メールを送信します。')
                            temperature_alert_mail.send_alert_mail(temprature, sensor['id'], sensor['name'], u'警戒値')
                        else:
                            logging.debug(u'警報メール送信停止中です。')

                    else:
                        # 制御信号送信
                        controller_state_dic['sent_command'] = '\x31'
                        logging.info(u'温湿度が閾値内に収まっているため運転停止コマンドを空調制御コマンドキューへ格納します。')
                        self.command_queue.put({'controller_id' : controller_state_dic['id'], 'command' : controller_state_dic['sent_command']})
                        logging.info(u'温湿度がしきい値内であるため空調機器停止コマンドを送信します。')
                        surveillance_count = 0
                        
                    # 空調制御状態を書き込み
                    controller_state.write(controller_state_dic)
                
                time.sleep(SURVEILLANCE_CYCLE)
        except Exception as e:
            server_socket.close()
            raise e