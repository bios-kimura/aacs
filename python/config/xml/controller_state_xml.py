# -*- coding: utf-8 -*-

"""
コントローラー状態を扱うモジュール(XML形式)

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

class ControllerStateXML():
    """
    コントローラー状態を扱うクラス(XML形式)
    """
    def __init__(self):
        self.file_path = '../config/controllerState.xml'
        
    def write(self, controller_state):
        """
        コントローラー状態を書き込みます。
        ファイルが存在しない場合は作成します。
        controller_state = {
            'id' : コントローラー番号,
            'sent_command' : 最後に送信したコマンド,
            'surveillance_count' : 監視回数,
            'latency_count' : 待機回数
        }
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None
            
        tree = parse(self.file_path)
        elem = tree.getroot()
        for e in elem.iter('controller'):
            if e.get('id') == controller_state['id']:
                e.find('sentCommand').text = controller_state['sent_command']
                e.find('surveillanceCount').text = controller_state['surveillance_count']
                e.find('latencyCount').text = controller_state['latency_count']
        tree.write('../config/controllerState.xml', 'UTF-8', xml_declaration=True)
        # 設定が存在しない場合

    def all_read(self):
        """
        コントローラー状態を読み込み配列として返します。
        ファイルが存在しない場合はNoneを返します。
        [{'id : コントローラー番号,
          'sent_command' : 最後に送信したコマンド番号,
          'surveillance_count' : 監視回数,
          'latency_count' : 待機回数
        }]
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None

        tree = parse(self.file_path)
        elem = tree.getroot()
        controller_state_list = []
        for e in elem.iter('controller'):
            controller_state_list.append(
                {'id' : e.get('id'),
                 'sent_command' : e.find('sentCommand').text,
                 'surveillance_count' : e.find('surveillanceCount').text,
                 'latency_count' : e.find('latencyCount').text
                })
        return controller_state_list
        
    def read(self, controller_id):
        """
        指定されたコントローラー番号の空調制御状態を辞書で返します。
        ファイルが存在しない場合はNoneを返します。
        一致するコントローラーが存在しない場合は空の辞書を返します。
        {'id' : コントローラー番号,
         'sent_command' : 最後に送信したコマンド番号,
         'surveillance_count' : 監視回数,
         'latency_count' : 待機回数
        }
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None
        
        tree = parse(self.file_path)
        elem = tree.getroot()
        controller_state_dic = {}
        for e in elem.iter('controller'):
            if controller_id == e.get('id'):
                controller_state_dic['id'] = e.get('id')
                controller_state_dic['sent_command'] = e.find('sentCommand').text
                controller_state_dic['surveillance_count'] = e.find('surveillanceCount').text
                controller_state_dic['latency_count'] = e.find('latencyCount').text
        return controller_state_dic
