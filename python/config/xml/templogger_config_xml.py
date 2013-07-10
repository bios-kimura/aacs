# -*- coding: utf-8 -*-

"""
温湿度センサー設定を扱うモジュール(XML形式)

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

class TempLoggerConfigXML():
    """
    温湿度センサー設定を扱うクラス(XML形式)
    """
    def __init__(self):
        self.file_path = '../config/tempLoggerConfig/'
        self.file_name = '-tempLoggerConfig.xml'

    def read(self):
        """
        温湿度センサー設定を読み込み配列として返します。
        [{'id : 温湿度センサー番号, 'name' : 温湿度センサー名}]
        """
        temp_logger_list = []
        files = os.listdir(self.file_path)
        import datetime
        for file in files:
            # ファイルの存在可否
            if os.path.isfile(self.file_path + file):
                tree = parse(self.file_path + file)
                elem = tree.getroot()
                temp_logger = [{'id' : e.get('id'), 'name' : e.find('sensorName').text, 'date' : e.find('date').text} for e in elem.iter('sensor')]
                
                # 日付の降順にソート
                sorted_list = sorted(temp_logger, key=lambda sensor : sensor.get('date'), reverse=True)
                temp_logger_list.append(sorted_list[0])
        return temp_logger_list
