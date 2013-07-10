# -*- coding: utf-8 -*-

"""
限界値の判定を行うモジュール

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

from threshold_judge import ThresholdJudge

class LimitValueJudge(ThresholdJudge):
    """
    限界値の判定を行うクラス
    """
    
    def __init__(self):
        ThresholdJudge.__init__(self)
        
    def judge(self, temp, hygro, max_temp, min_temp, max_hygro, min_hygro):
        if max_temp != 999.0:
            if self.is_over_threshold(temp, max_temp):
                return True
        
        if min_temp != 999.0:
            if self.is_under_threshold(temp, min_temp):
                return True
        
        if max_hygro != 999.0:
            if self.is_over_threshold(hygro, max_hygro):
                return True
                
        if min_hygro != 999.0:
            if self.is_under_threshold(hygro, min_hygro):
                return True
    