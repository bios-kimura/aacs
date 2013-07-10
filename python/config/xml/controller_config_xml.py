# -*- coding: utf-8 -*-

"""
コントローラー設定を扱うモジュール(XML形式)

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

class ControllerConfigXML():
    """
    コントローラー設定を扱うクラス(XML形式)
    """
    def __init__(self):
        self.file_path = '../config/controllerConfig.xml'
        
    def read(self, controller_id):
        """
        指定されたコントローラー番号に一致するコントローラー設定を辞書で返します。
        {'id' : コントローラー番号, 'xbee' : XBeeシリアル番号}
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None 
        
        tree = parse(self.file_path)
        elem = tree.getroot()
        controller_config = {}
        for e in elem.iter('controller'):
            if e.get('id') == controller_id:
                controller_config['id'] = e.get('id')
                controller_config['xbee'] = e.find('xbee').text
        return controller_config

    def all_read(self):
        """
        コントローラー設定を読み込み配列として返します。
        [{'id : コントローラー番号, 'xbee' : XBeeシリアル番号}]
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None 
        
        tree = parse(self.file_path)
        elem = tree.getroot()
        controller_config = []
        controller_config = [{'id' : e.get('id'), 'xbee' : e.find('xbee').text} for e in elem.iter('controller')]
        return controller_config
