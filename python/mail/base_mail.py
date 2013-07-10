# -*- coding: utf-8 -*-

"""
メールを扱うモジュール

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
import logging
import logging.config
import datetime
import base64
import os
from email.MIMEText import MIMEText
from email import Encoders
from email.MIMEBase import MIMEBase
from email.MIMEMultipart import MIMEMultipart
from email.Utils import formatdate
from email.Header import Header

class BaseMail():
    """
    メールを扱うクラス
    """
    
    def __init__(self):
        pass
        
    def send(self, msg, system_config):
        """
        メールを送信します。
        """
        smtp = smtplib.SMTP(system_config['smtp'], system_config['port'])
        smtp.login(system_config['user'], system_config['passwd'])
        to = system_config['to'].split(',')
        to.append(system_config['from'])
        smtp.sendmail(system_config['from'], to, msg.as_string())
        smtp.close()
        
    def create(self, subject, body, from_addr, to_addr, encoding):
        """
        メールを生成します。
        """
        msg = MIMEMultipart()
        msg['Subject'] = Header(subject, encoding)
        msg['From'] = from_addr
        msg['To'] = to_addr
        msg['Date'] = formatdate()
        
        mail_body = MIMEText(body, 'plain', encoding)
        msg.attach(mail_body)
        
        return msg

    def create_message(self, subject, body, from_addr, to_addr, encoding, attachment_list):
        """
        添付ファイル付きメールを生成します。
        """
        msg = MIMEMultipart()
        msg['Subject'] = Header(subject, encoding)
        msg['From'] = from_addr
        msg['To'] = to_addr + ',' + from_addr
        msg['Date'] = formatdate()

        mail_body = MIMEText(body, 'plain', encoding)
        msg.attach(mail_body)

        for attach in attachment_list:
            if not os.path.isfile(attach[1]):
                logging.warning(attach[1] + 'が存在しません。')
                continue
            with open(attach[1]) as f:
                csv = MIMEText(f.read(), 'plain', encoding)
                csv.add_header('Content-Disposition', 'attachment', filename=attach[0])
                msg.attach(csv)

        return msg