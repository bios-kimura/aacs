# -*- coding: utf-8 -*-

"""
空調制御コマンドを扱うクラス(XML形式)

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

class ControlCommandXML():
    """
    空調制御コマンドを扱うクラス(XML形式)
    """
    def __init__(self, file_path):
        self.file_path = file_path

    def read(self):
        """
        空調制御コマンドを読み込み配列として返します。
        ファイルが存在しない場合はNoneを返します。
        [{'id' : コントローラー番号,
          'name' : コマンド名,
          'signal' : 信号
        }]
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None
        
        tree = parse(self.file_path)
        elem = tree.getroot()
        command_list = []
        for e in elem.iter('command'):
            command_list.append({
                'id' : c.get('id'),
                'name' : c.find('commandName').text,
                'signal' : c.find('signal').text
            })
        return command_list
