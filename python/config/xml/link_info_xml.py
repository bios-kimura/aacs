# -*- coding: utf-8 -*-

"""
温湿度センサーとコントローラーのリンク情報を扱うモジュール(XML形式)

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

class LinkInfoXML():
    """
    温湿度センサーとコントローラーのリンク情報を扱うクラス(XML形式)
    """
    def __init__(self):
        self.file_path = '../config/linkInfo.xml'
        
    def read(self, sensor_id):
        """
        指定された温湿度センサーのリンク情報を辞書で返します。
        指定された温湿度センサーが存在しない場合は空の辞書を返します。
        ファイルが存在しない場合はNoneを返します。
        {'sensor_id' : 温湿度センサー番号,
          'controller_id' : コントローラー番号,
          'surveillance_cycle' : 監視周期,
          'max_temp_limit_threshold' : 温度上限値(限界値),
          'min_temp_limit_threshold' : 温度下限値(限界値),
          'max_hygro_limit_threshold' : 湿度上限値(限界値),
          'min_hygro_limit_threshold' : 温度下限値(限界値),
          'latency' : 待機時間,
          'maxTempCautionThreshold' : 温度上限値(警戒値),
          'minTempCautionThreshold' : 温度下限値(警戒値),
          'maxHygroCautionThreshold' : 湿度上限値(警戒値),
          'minHygroCautionThreshold' : 温度下限値(警戒値),
          'is_send' : 警報メール送信可否
        }
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None 
        
        tree = parse(self.file_path)
        elem = tree.getroot()
        link_dic = {}
        for e in elem.iter('link'):
            if sensor_id == e.find('sensor').text:
                link_dic['sensor_id'] = e.find('sensor').text
                link_dic['controller_id'] = e.find('controller').text
                link_dic['surveillance_cycle'] = e.find('surveillanceCycle').text
                link_dic['max_temp_limit_threshold'] = e.find('maxTempLimitThreshold').text
                link_dic['min_temp_limit_threshold'] = e.find('minTempLimitThreshold').text
                link_dic['max_hygro_limit_threshold'] = e.find('maxHygroLimitThreshold').text
                link_dic['min_hygro_limit_threshold'] = e.find('minHygroLimitThreshold').text
                link_dic['latency'] = e.find('latency').text
                link_dic['max_temp_caution_threshold'] = e.find('maxTempCautionThreshold').text
                link_dic['min_temp_caution_threshold'] = e.find('minTempCautionThreshold').text
                link_dic['max_hygro_caution_threshold'] = e.find('maxHygroCautionThreshold').text
                link_dic['min_hygro_caution_threshold'] = e.find('minHygroCautionThreshold').text
                link_dic['is_send'] = e.find('isSend').text
        return link_dic

    def all_read(self):
        """
        温湿度センサーとコントローラーのリンク情報を読み込み配列として返します。
        ファイルが存在しない場合はNoneを返します。
        [{'sensor_id' : 温湿度センサー番号,
          'controller_id' : コントローラー番号,
          'surveillance_cycle' : 監視周期,
          'max_temp_limit_threshold' : 温度上限値(限界値),
          'min_temp_limit_threshold' : 温度下限値(限界値),
          'max_hygro_limit_threshold' : 湿度上限値(限界値),
          'min_hygro_limit_threshold' : 温度下限値(限界値),
          'latency' : 待機時間,
          'maxTempCautionThreshold' : 温度上限値(警戒値),
          'minTempCautionThreshold' : 温度下限値(警戒値),
          'maxHygroCautionThreshold' : 湿度上限値(警戒値),
          'minHygroCautionThreshold' : 温度下限値(警戒値),
          'is_send' : 警報メール送信可否
        }]
        """
        # ファイルの存在可否
        if not os.path.isfile(self.file_path):
            return None 
            
        tree = parse(self.file_path)
        elem = tree.getroot()
        link_list = []
        for e in elem.iter('link'):
            link_list.append({
                'sensor_id' : e.find('sensor').text,
                'controller_id' : e.find('controller').text,
                'surveillance_cycle' : e.find('surveillanceCycle').text,
                'max_temp_limit_threshold' : e.find('maxTempLimitThreshold').text,
                'min_temp_limit_threshold' : e.find('minTempLimitThreshold').text,
                'max_hygro_limit_threshold' : e.find('maxHygroLimitThreshold').text,
                'min_hygro_limit_threshold' : e.find('minHygroLimitThreshold').text,
                'latency' : e.find('latency').text,
                'max_temp_caution_threshold' : e.find('maxTempCautionThreshold').text,
                'min_temp_caution_threshold' : e.find('minTempCautionThreshold').text,
                'max_hygro_caution_threshold' : e.find('maxHygroCautionThreshold').text,
                'min_hygro_caution_threshold' : e.find('minHygroCautionThreshold').text,
                'is_send' : e.find('isSend').text
            })
        return link_list
