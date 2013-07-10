# -*- coding: utf-8 -*-

"""
温湿度データを扱うモジュール

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

import csv
import datetime
import os
import logging
import logging.config

logging.config.fileConfig('log.conf')

class TemperatureLog():
    """
    温湿度データを扱うモジュール
    """
    
    def __init__(self):
        self.temp_dir = '../log/ThermoHygro/'
    
    def get_time_loc(self, tm):
        """
        時刻から温湿度データの保存位置を返します。
        """
        hh = int(tm[0:2])
        mm = int(tm[3:5])
        return ((hh*60) + mm)

    def _get_time_str(self, bin):
        """
        温湿度データファイルに書き込む時刻を返します。
        """
        hh = '%02d' % (bin / 60)
        mm = ':%02d' % (bin % 60)
        return (hh + mm)
        
    def _make(self, file_path, sensor_id):
        """
        温湿度データファイルを作成します。
        """    
        with open(file_path, 'w') as f: 
            for seq in range(0, 1440):
                #         "HH:MM"             ,-99.9,-99.9
                f.write(self._get_time_str(seq) + '            \n')
        
    def write(self, file_path, temp):
        """
        温湿度データを書き込みます。
        """   
        now_tim = datetime.datetime.now().strftime('%H:%M')
        loc = self.get_time_loc(now_tim)
        with open(file_path, 'r+') as f:
            f.seek(loc * (len('00:00,-99.9,-99.9') + 2))
            f.write(now_tim + ',' + temp)

    def read(self, file_path):
        """
        温湿度データを読み込みます。
        """   
        loc = self.get_time_loc(datetime.datetime.now().strftime('%H:%M'))
        with open(file_path, 'r') as f:
            f.seek(loc * (len('00:00,-99.9,-99.9') + 2))
            temp_list = f.readline().split(',')
        return temp_list       
        
    def make_path(self, sensor_id):
        """
        温湿度データのパスを作成します。
        """   
        date = datetime.datetime.today()

        dir_name = self.temp_dir + date.strftime("%Y/")
        if not os.path.isdir(dir_name):
            os.mkdir(dir_name)
            logging.warn(dir_name + u'を作成します。')
            
        dir_name = dir_name + "sensor" + sensor_id + "/"
        if not os.path.isdir(dir_name):
            os.mkdir(dir_name)
            logging.warn(dir_name + u'を作成します。')

        file_path = dir_name + sensor_id + date.strftime('-%m%d.csv')
        if not os.path.isfile(file_path):
            self._make(file_path, sensor_id)
            logging.warn(file_path + u'を作成します。')
            
        return file_path
