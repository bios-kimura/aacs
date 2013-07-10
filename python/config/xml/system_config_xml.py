# -*- coding: utf-8 -*-

"""
システム設定を扱うクラス(XML形式)

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

import os
from xml.etree.ElementTree import*

class SystemConfigXML():
    """
    システム設定を扱うクラス(XML形式)
    """
    def __init__(self):
        self.file_path = '../config/systemConfig.xml'

    def read(self):
        """
        システムを読み込み辞書形式で返します。
        システム設定ファイルが存在しない場合はNoneを返します。
        return システム設定
        {'from' : メール送信元,
          'to' : メール送信先,
          'smtp' : SMTPサーバホスト名,
          'port' : SMTPサーバポート番号,
          'user' : メール送信元ユーザ名,
          'passwd' : メール送信元パスワード,
          'cordinator' : コーディネータCOMポート,
          'irReceive' : 赤外線受信機COMポート,
          'xbee' : XBee電圧閾値
        }
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None
        
        tree = parse(self.file_path)
        elem = tree.getroot()
        mail = elem.find('mail')
        weather = elem.find('weather')
        system_config = {}
        system_config['from'] = mail.find('from').text
        system_config['to'] = mail.find('to').text
        system_config['smtp'] = mail.find('smtp').text
        system_config['port'] = mail.find('port').text
        system_config['user'] = mail.find('user').text
        system_config['passwd'] = mail.find('passwd').text
        system_config['cordinator'] = elem.find('cordinator').text
        system_config['irReceive'] = elem.find('irReceive').text
        system_config['xbee'] = elem.find('xbee').text
        return system_config