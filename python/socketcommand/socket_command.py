# -*- coding: utf-8 -*-

"""
ソケット通信による空調制御コマンドを扱うモジュール

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
import socket
import json
import threading
from config.xml.controller_state_xml import ControllerStateXML

logging.config.fileConfig('log.conf')

class ScoketCommand(threading.Thread):
    """
    ソケット通信による空調制御コマンドを扱うクラス
    """
    
    def __init__(self, command_queue):
        threading.Thread.__init__(self)
        self.setDaemon(True)
        self.host = 'localhost'
        self.port = 2002
        self.receive_size = 512
        self.command_queue = command_queue

    def run(self):
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.bind((self.host, self.port))
        try:
            controller_state = ControllerStateXML()
            while True:
                server_socket.listen(1)
                client_socket, client_addr = server_socket.accept()
                recv_msg = client_socket.recv(self.receive_size).rstrip()
                if not recv_msg:
                    client_socket.close()
                    continue
                recv_json = json.loads(recv_msg)
                controller_id = str(recv_json['controllerId'])
                send_command = str(recv_json['sendCommand'])
                logging.info(u'ソケット通信による受信: controllerId:' + controller_id + ' sendCommand:' + send_command)
                
                # 空調制御コマンドを空調制御コマンドキューへ登録
                self.command_queue.put({'controller_id' : controller_id, 'command' : send_command})
                
                # 空調制御状態を読み込み
                controller_state_list = controller_state.read(controller_id)
                
                # 空調制御状態ファイルの存在可否
                if controller_state_list == None:
                    logging.error(u'空調制御状態ファイルが存在しません。')
                
                # 空調制御状態の存在可否
                if controller_state_list == {}:
                    logging.warn(u'空調制御状態が存在しません。')
            
                # 空調制御状態を書き込み
                controller_state.write({'id' : controller_id, 'sent_command' : send_command, 'surveillance_count' : controller_state_list['surveillance_count'], 'latency_count' : controller_state_list['latency_count']})
            server_socket.close()
        except Exception as e:
            server_socket.close()
            raise e
