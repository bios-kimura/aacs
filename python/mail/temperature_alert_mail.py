# -*- coding: utf-8 -*-

"""
温湿度異常メールを扱うモジュール

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

import smtplib
import datetime
import base64
from email.MIMEText import MIMEText
from email import Encoders
from email.MIMEBase import MIMEBase
from email.MIMEMultipart import MIMEMultipart
from email.Utils import formatdate
from email.Header import Header
from mail.base_mail import BaseMail

class TemperatureAlertMail(BaseMail):
    """
    温湿度異常メールを扱うクラス
    """

    def __init__(self):
        BaseMail.__init__(self)

    def read_config(self):
        """
        システム設定を読み込みます。
        """
        from config.xml.system_config_xml import SystemConfigXML
        system_config = SystemConfigXML().read()
        if system_config == {}:
            pass
            
        return system_config
        
    def send_alert_mail(self, temp_list, sensor_id, sensor_name, kind):
        """
        温湿度異常メールを送信します。
        """
        system_config = self.read_config()
        date = datetime.datetime.today()
        subject = date.strftime('%Y/%m/%d 温湿度異常')
        body = kind + u'を超えたため、\nスマートフォンからの制御をお願いいたします。\n\n' + sensor_name + u'\n------------------------\n温度:' + str(temp_list[1]) + u'℃\n湿度:' + temp_list[2].rstrip() + u'%\nhttp://110.5.3.178:8080/html/tempLogger.html?sensorId=' + sensor_id + '&date=' + date.strftime('%Y/%m/%d')
        msg = self.create(subject, body, system_config['from'], system_config['to'], 'utf-8')
        self.send(msg, system_config)
